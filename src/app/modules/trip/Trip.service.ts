/* eslint-disable no-console */
// import { StatusCodes } from 'http-status-codes';
// import { ETripStatus } from '../../../../prisma';
// import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../../utils/db';
import {
  TGetTripHistory,
  TRatingTrip,
  TRequestForTrip,
} from './Trip.interface';
import config from '../../../config';
import {
  EDay,
  ETripStatus,
  EUserRole,
  Prisma,
  TLocation,
  Trip as TTrip,
} from '../../../../prisma';
import ServerError from '../../../errors/ServerError';
import { CancelTripServices } from '../cancelTrip/CancelTrip.service';
import { SocketServices } from '../socket/Socket.service';
import { TAuthenticatedSocket } from '../socket/Socket.interface';
import { Server as IOServer } from 'socket.io';
import {
  tripOmit,
  tripSearchableFields as searchableFields,
  cancelAbleTripStatus,
} from './Trip.constant';
import { otpGenerator } from '../../../utils/crypto/otpGenerator';
import {
  TPagination,
  TServeResponse,
} from '../../../utils/server/serveResponse';
import { socketResponse } from '../socket/Socket.utils';
import getDistanceAndTime from '../../../utils/location/getDistanceAndTime';
import chalk from 'chalk';
import { AvailableDriverServices } from '../availableDriver/AvailableDriver.service';
import ms from 'ms';
import { calculateTripFare } from '../../../utils/uber/tripFareHelper';
import { ChatServices } from '../chat/Chat.service';
import { NotificationServices } from '../notification/Notification.service';

export const userTripSelectableField = {
  select: {
    name: true,
    avatar: true,
    phone: true,
    location: true,
    rating: true,
    rating_count: true,

    driver_info: true,
  } satisfies Prisma.UserSelect,
};

export const TripServices = {
  async requestForTrip({
    dropoff_address,
    pickup_address,
    vehicle,
    stops,
    passenger_id,
    passenger_ages,
  }: TRequestForTrip) {
    const existingTrip = await prisma.trip.findFirst({
      where: {
        passenger_id,
        status: ETripStatus.REQUESTED,
      },
      select: {
        id: true,
      },
    });

    if (existingTrip)
      throw new ServerError(
        StatusCodes.CONFLICT,
        'You have a pending trip with id ' + existingTrip.id,
      );

    const sOtp = otpGenerator(config.otp.length);
    const eOtp = otpGenerator(config.otp.length);

    const { distance, duration } = await getDistanceAndTime(
      pickup_address.geo,
      dropoff_address.geo,
    );

    // Calculate estimated fare using the new pricing system
    const fareResult = await calculateTripFare({
      distance_km: distance.value / 1000, // Convert meters to km
      passenger_ages,
      requested_at: new Date(),
      accepted_at: null,
      started_at: null,
      pickup_address,
      dropoff_address,
      stops,
      vehicle,
    } as any);

    const estimatedFare = fareResult.total;

    const todayEnum: EDay = [
      EDay.SUNDAY,
      EDay.MONDAY,
      EDay.TUESDAY,
      EDay.WEDNESDAY,
      EDay.THURSDAY,
      EDay.FRIDAY,
      EDay.SATURDAY,
    ][new Date().getDay()];

    const trip = await prisma.trip.create({
      data: {
        dropoff_address,
        pickup_address,
        vehicle,
        stops,
        passenger_ages,
        passenger_id,
        status: ETripStatus.REQUESTED,
        sOtp,
        eOtp,
        total_cost: estimatedFare,
        duration_sec: duration.value,
        distance_km: distance.value / 1000, // Convert meters to km
        day: todayEnum,

        //? Store initial fare breakdown for later use in case of fare adjustments or disputes
        price_breakdown: {
          base_fare: estimatedFare,
          distance_fare: fareResult.details.distance,
          time_fare: fareResult.details.waiting,
          platform_fee: fareResult.app,
          driver_earning: fareResult.driver,
        },
      },
      omit: {
        ...tripOmit,
        exclude_driver_ids: undefined,
      },
    });

    //! Don't use await for faster response
    this.findNearestDriver(trip);

    return {
      ...trip,
      sOtp,
      eOtp,
    };
  },

  async rejectTrip({
    driver_id,
    trip_id,
    reason,
  }: {
    trip_id: string;
    driver_id: string;
    reason: string;
  }) {
    const trip = await prisma.trip.update({
      where: { id: trip_id },
      data: {
        exclude_driver_ids: { push: driver_id },
      },
      omit: {
        ...tripOmit,
        exclude_driver_ids: undefined,
      },
    });

    //! Track cancel trip reason
    await CancelTripServices.cancelTrip({
      trip_id,
      driver_id,
      reason,
    });

    await prisma.availableDriver.update({
      where: { driver_id },
      data: { trip_id: null },
    });

    await this.findNearestDriver(trip!);
  },

  async cancelTrip({
    trip_id,
    reason,
    passenger_id,
  }: {
    trip_id: string;
    passenger_id: string;
    reason: string;
  }) {
    const trip = (await prisma.trip.findUnique({
      where: { id: trip_id },
      include: { passenger: { select: { name: true } } },
      omit: tripOmit,
    }))!;

    if (!cancelAbleTripStatus.includes(trip.status))
      throw new ServerError(StatusCodes.CONFLICT, 'Trip cannot be cancelled');

    if (trip.passenger_id !== passenger_id)
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        `You can't cancel ${trip.passenger.name}'s trip`,
      );

    await prisma.trip.update({
      where: { id: trip_id },
      data: {
        status: ETripStatus.CANCEL,
        passenger_id,
        cancelled_at: new Date(),
      },
    });

    // Release any drivers reserved for this trip
    await prisma.availableDriver.updateMany({
      where: { trip_id },
      data: { trip_id: null },
    });

    //! Track cancel trip reason
    await CancelTripServices.cancelTrip({
      trip_id,
      passenger_id,
      reason,
    });

    if (trip.driver_id) {
      // Notify driver about trip cancellation
      SocketServices.getIO()
        ?.to(trip.driver_id)
        .emit(
          'trip:driver-cancelled',
          socketResponse({
            message: `${trip.passenger.name} canceled the trip`,
            data: trip,
            meta: {
              trip_id,
            },
          }),
        );
    }
  },

  async acceptTrip({
    trip_id,
    driver_id,
    location,
  }: {
    trip_id: string;
    driver_id: string;
    location: TLocation;
  }) {
    //! Delete driver from availableDriver
    try {
      await AvailableDriverServices.leave({ driver_id });
    } catch {
      void 0;
    }

    const trip = await prisma.trip.findUnique({
      where: { id: trip_id },
      include: {
        driver: {
          select: {
            name: true,
            avatar: true,
            phone: true,
          },
        },
        passenger: {
          select: {
            name: true,
            avatar: true,
            phone: true,
          },
        },
      },
    });

    if (trip?.driver_id && trip.driver_id !== driver_id)
      throw new ServerError(
        StatusCodes.CONFLICT,
        `Driver ${trip.driver?.name} is already assigned to this trip`,
      );

    const updatedTrip: any = await prisma.trip.update({
      where: { id: trip_id },
      data: {
        driver_id,
        status: ETripStatus.ACCEPTED,
        vehicle_address: location,
        accepted_at: new Date(),
      },
      include: {
        passenger: userTripSelectableField,
        driver: userTripSelectableField,
      },
      omit: {
        exclude_driver_ids: true,
      },
    });

    //? easily access in chat service
    const chat = await ChatServices.getChat({
      driver_id,
      user_id: updatedTrip.passenger_id,
    });

    updatedTrip.chat_id = chat.id;

    try {
      const { distance, duration } = await getDistanceAndTime(
        updatedTrip.driver!.location!.geo,
        updatedTrip.pickup_address.geo,
      );

      console.log('{ distance, duration }', { distance, duration });

      updatedTrip.driver_distance = distance.value;
      updatedTrip.driver_duration = duration.value;
    } catch (error) {
      updatedTrip.driver_distance = 0;
      updatedTrip.driver_duration = 0;
    }

    // Notify passenger that driver accepted the trip
    SocketServices.getIO()
      ?.to(updatedTrip.passenger_id)
      .emit(
        'trip:accepted',
        socketResponse({
          message: `${updatedTrip?.passenger?.name} accepted your trip request`,
          data: updatedTrip,
          meta: {
            trip_id,
            chat_id: chat.id,
          },
        }),
      );
  },

  async startTrip({
    trip_id,
    driver_id,
    sOtp,
  }: {
    trip_id: string;
    driver_id: string;
    location: TLocation;
    sOtp: string;
  }) {
    const trip = await prisma.trip.findUnique({
      where: { id: trip_id },
      include: {
        driver: {
          select: {
            name: true,
            avatar: true,
            phone: true,
          },
        },
        passenger: {
          select: {
            name: true,
            avatar: true,
            phone: true,
          },
        },
      },
    });

    if (trip?.driver_id !== driver_id)
      throw new ServerError(
        StatusCodes.CONFLICT,
        `You can't start ${trip?.driver?.name}'s trip`,
      );

    if (trip.status !== ETripStatus.ACCEPTED)
      throw new ServerError(StatusCodes.CONFLICT, 'Trip is not accepted yet');

    if (trip?.sOtp !== sOtp)
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        'Trip start otp is incorrect',
      );

    const updatedTrip: any = await prisma.trip.update({
      where: { id: trip_id },
      data: {
        status: ETripStatus.STARTED,
        started_at: new Date(),
      },
      include: {
        driver: userTripSelectableField,
        passenger: userTripSelectableField,
      },
      omit: {
        ...tripOmit,
        eOtp: undefined,
      },
    });

    try {
      const { distance, duration } = await getDistanceAndTime(
        updatedTrip.driver!.location!.geo,
        updatedTrip.dropoff_address.geo,
      );

      updatedTrip.dropoff_driver_distance = distance.value;
      updatedTrip.dropoff_driver_duration = duration.value;
    } catch {
      updatedTrip.dropoff_driver_distance = 0;
      updatedTrip.dropoff_driver_duration = 0;
    }

    // Notify passenger that trip has started
    SocketServices.getIO()
      ?.to(updatedTrip.passenger_id)
      .emit(
        'trip:notification',
        socketResponse({
          message: `${updatedTrip?.passenger?.name} started your trip`,
          data: {
            ...updatedTrip,
            eOtp: undefined,
          },
          meta: {
            trip_id,
          },
        }),
      );

    SocketServices.getIO()
      ?.to(updatedTrip.passenger_id)
      .emit(
        'trip:started',
        socketResponse({
          message: 'Trip started',
          data: updatedTrip,
          meta: {
            trip_id,
          },
        }),
      );
  },

  async arrivedTrip({
    trip_id,
    driver_id,
    eOtp,
  }: {
    trip_id: string;
    driver_id: string;
    eOtp: string;
  }) {
    const trip = await prisma.trip.findUnique({
      where: { id: trip_id },
      include: {
        driver: {
          select: {
            name: true,
            avatar: true,
            phone: true,
          },
        },
        passenger: {
          select: {
            name: true,
            avatar: true,
            phone: true,
          },
        },
      },
      omit: {
        ...tripOmit,
        eOtp: undefined,
      },
    });

    if (trip?.driver_id !== driver_id)
      throw new ServerError(
        StatusCodes.CONFLICT,
        `You can't complete ${trip?.driver?.name}'s trip`,
      );

    if (trip?.eOtp !== eOtp)
      throw new ServerError(StatusCodes.FORBIDDEN, 'Trip end otp is invalid');

    const updatedTrip = await prisma.trip.update({
      where: { id: trip_id },
      data: {
        status: ETripStatus.ARRIVED,
        arrived_at: new Date(),
      },
      include: {
        driver: userTripSelectableField,
        passenger: userTripSelectableField,
      },
      omit: tripOmit,
    });

    // Notify passenger that driver arrived
    SocketServices.getIO()
      ?.to(updatedTrip.passenger_id)
      .emit(
        'trip:arrived',
        socketResponse({
          message: `${updatedTrip?.passenger?.name} arrived your trip`,
          data: updatedTrip,
          meta: {
            trip_id,
          },
        }),
      );
  },

  async completeTrip({
    trip_id,
    driver_id,
  }: {
    trip_id: string;
    driver_id: string;
  }) {
    const trip = await prisma.trip.findUnique({
      where: { id: trip_id },
      include: {
        driver: {
          select: {
            name: true,
            avatar: true,
            phone: true,
          },
        },
        passenger: {
          select: {
            name: true,
            avatar: true,
            phone: true,
          },
        },
      },
      omit: tripOmit,
    });

    if (trip?.driver_id !== driver_id)
      throw new ServerError(
        StatusCodes.CONFLICT,
        `You can't complete ${trip?.driver?.name}'s trip`,
      );

    if (trip.status === ETripStatus.COMPLETED) return;

    const updatedTrip = await prisma.trip.update({
      where: { id: trip_id },
      data: {
        status: ETripStatus.COMPLETED,
        completed_at: new Date(),
      },
      include: {
        passenger: userTripSelectableField,
        driver: userTripSelectableField,
      },
      omit: tripOmit,
    });

    // Notify passenger that trip is completed
    SocketServices.getIO()
      ?.to(updatedTrip.passenger_id)
      .emit(
        'trip:completed',
        socketResponse({
          message: `${updatedTrip?.passenger?.name} arrived your trip`,
          data: updatedTrip,
          meta: {
            trip_id,
          },
        }),
      );
  },

  async findNearestDriver(trip: Partial<TTrip>): Promise<void> {
    // Early return to prevent unnecessary processing
    if (trip.status !== ETripStatus.REQUESTED) return;

    const [pickupLng, pickupLat] = trip.pickup_address!.geo;

    try {
      // Optimized aggregation pipeline with single pass filtering
      const pipeline = [
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [pickupLng, pickupLat],
            },
            distanceField: 'distance',
            spherical: true,
            maxDistance: config.uber.max_distance,
            query: {
              ...(trip.exclude_driver_ids?.length
                ? {
                    driver_id: {
                      $nin: trip.exclude_driver_ids.map(id => ({ $oid: id })),
                    },
                  }
                : {}),
              $or: [{ trip_id: null }, { trip_id: { $oid: trip.id } }],
            },
          },
        },
        { $limit: 1 },
        {
          $project: {
            driver_id: 1,
            location: 1,
            distance: 1,
          },
        },
      ];

      const result = (await prisma.availableDriver.aggregateRaw({
        pipeline,
      })) as unknown as any[];

      const nearestDriver = result?.[0];

      // No driver found - notify and retry
      if (!nearestDriver?.driver_id?.$oid) {
        await this.handleNoDriverFound(trip);
        return;
      }

      const driverId = nearestDriver.driver_id.$oid;

      // Get distance and duration, then send request
      const distanceDuration = await getDistanceAndTime(
        trip.pickup_address!.geo,
        nearestDriver.location.geo,
      );

      // Add calculated fields to trip
      const enrichedTrip = {
        ...trip,
        ...distanceDuration,
        passenger_count: trip.passenger_ages?.length,
      };

      // Send trip request to driver
      await this.sendTripRequest(driverId, enrichedTrip);

      // Schedule driver availability check
      this.scheduleDriverCheck(trip.id!);
    } catch (error) {
      console.error('Error finding nearest driver:', error);
      // Retry with backoff on error
      setTimeout(() => this.retryFindDriver(trip.id!), 5000);
    }
  },

  // Separate method for no driver scenario
  async handleNoDriverFound(trip: Partial<TTrip>): Promise<void> {
    const io = SocketServices.getIO();
    const timeout = Date.now() - new Date(trip.requested_at!).getTime();

    // If more than 20 seconds have passed, notify passenger
    if (timeout > ms('20s')) {
      io?.to(trip.passenger_id!).emit(
        'trip:notification',
        socketResponse({
          statusCode: StatusCodes.NOT_FOUND,
          message: 'No driver found for this trip',
          data: {
            ...trip,
            exclude_driver_ids: undefined,
          },
          meta: { trip_id: trip.id },
        }),
      );
    }

    // Retry only if the trip is less than 5 minutes old
    if (timeout < ms('5m')) {
      setTimeout(() => this.retryFindDriver(trip.id!), 5000);
    } else {
      io?.to(trip.passenger_id!).emit(
        'trip:close',
        socketResponse({
          statusCode: StatusCodes.NOT_FOUND,
          message: 'No driver found for this trip',
          data: {
            ...trip,
            exclude_driver_ids: undefined,
          },
          meta: { trip_id: trip.id },
        }),
      );

      // Finalize: release any reserved drivers for this trip to avoid stale locks
      try {
        await prisma.availableDriver.updateMany({
          where: { trip_id: trip.id! },
          data: { trip_id: null },
        });
      } catch {
        void 0;
      }
    }
  },

  // Extract socket emission to separate method
  async sendTripRequest(driverId: string, trip: Partial<TTrip>): Promise<void> {
    const io = SocketServices.getIO();

    const updatedTrip = await prisma.trip.findUnique({
      where: { id: trip.id! },
      select: {
        exclude_driver_ids: true,
        passenger: userTripSelectableField,
      },
    });

    if (updatedTrip?.exclude_driver_ids?.includes(driverId)) {
      // Driver has already rejected this trip, skip sending request
      return;
    }

    console.log(chalk.red(`Sending trip request to driver ${driverId}`));

    // notify driver about the trip request
    io?.to(driverId).emit(
      'trip:driver-request',
      socketResponse({
        message: 'Request for trip',
        data: {
          ...trip,
          passenger: updatedTrip?.passenger,
        },
        meta: { trip_id: trip.id },
      }),
    );

    await prisma.availableDriver.update({
      where: { driver_id: driverId },
      data: { trip_id: trip.id },
    });
  },

  // Centralized retry logic with fresh data fetch
  async retryFindDriver(tripId: string): Promise<void> {
    console.log(chalk.red(`Retrying to find driver for trip ${tripId}`));
    const updatedTrip = await prisma.trip.findUnique({
      where: { id: tripId },
      omit: {
        ...tripOmit,
        exclude_driver_ids: undefined,
      },
    });

    if (updatedTrip && !updatedTrip.driver_id) {
      await this.findNearestDriver(updatedTrip);
    }
  },

  // Schedule check with cleanup
  scheduleDriverCheck(tripId: string): void {
    setTimeout(async () => {
      const updatedTrip = await prisma.trip.findUnique({
        where: { id: tripId },
        select: {
          id: true,
          driver_id: true,
          status: true,
        },
      });

      // Only retry if trip still needs a driver
      if (
        updatedTrip?.status === ETripStatus.REQUESTED &&
        !updatedTrip.driver_id
      ) {
        // Fetch full trip data only when needed
        const fullTrip = await prisma.trip.findUnique({
          where: { id: tripId },
          omit: {
            ...tripOmit,
            exclude_driver_ids: undefined,
          },
        });

        if (fullTrip) {
          await this.findNearestDriver(fullTrip);
        }
      }
    }, 5000);
  },

  async updateTripLocation({
    location,
    trip_id,
    user_id,
  }: {
    location: TLocation;
    trip_id: string;
    user_id: string;
  }) {
    // Get the trip info
    const trip = (await prisma.trip.findUnique({
      where: { id: trip_id },
      select: {
        driver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }))!;

    // Only own driver can update location
    if (!trip.driver)
      throw new ServerError(
        StatusCodes.NOT_FOUND,
        'No driver assigned for this trip',
      );

    if (trip.driver.id !== user_id)
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        `You can't location update for ${trip.driver.name}'s trip`,
      );

    // Finally update trip location
    return prisma.trip.update({
      where: { id: trip_id },
      data: { vehicle_address: location },
      omit: tripOmit,
    });
  },

  async launchStartedTrip({
    socket,
    io,
  }: {
    socket: TAuthenticatedSocket;
    io: IOServer | null;
  }) {
    const { user } = socket.data;

    const where: Prisma.TripWhereInput = {
      status: {},
    };

    if (user.role === EUserRole.DRIVER) {
      where.driver_id = user.id;

      where.status = {
        in: [
          ETripStatus.REQUESTED,
          ETripStatus.ACCEPTED,
          ETripStatus.STARTED,
          ETripStatus.ARRIVED,
        ],
      };
    } else {
      where.passenger_id = user.id;

      where.status = {
        in: [ETripStatus.ACCEPTED, ETripStatus.STARTED, ETripStatus.ARRIVED],
      };
    }

    const trip: any = await prisma.trip.findFirst({
      where,
      include: {
        driver: userTripSelectableField,
        passenger: userTripSelectableField,
      },
    });

    if (trip) {
      try {
        const { distance, duration } = await getDistanceAndTime(
          trip.driver!.location!.geo,
          trip.pickup_address.geo,
        );

        trip.driver_distance = distance.value;
        trip.driver_duration = duration.value;
      } catch {
        trip.driver_distance = 0;
        trip.driver_duration = 0;
      }

      try {
        //? No driver assigned
        if (!trip.driver_id) return;

        //? easily access in chat service
        const chat = await ChatServices.getChat({
          driver_id: trip.driver_id,
          user_id: trip.passenger_id,
        });

        trip.chat_id = chat.id;
      } catch (error) {
        if (error instanceof Error) {
          console.error(
            'Error fetching chat during trip recovery:',
            error.message,
          );
        }
      }

      console.log(
        JSON.stringify({
          success: true,
          statusCode: StatusCodes.OK,
          message: `Trip ${trip.status.toLowerCase()} successfully from recover trip`,
          data: trip,
          meta: {
            trip_id: trip.id,
            chat_id: trip.chat_id,
          },
        }),
      );

      if (user.role === EUserRole.DRIVER)
        Object.assign(trip, { sOtp: undefined, eOtp: undefined });

      console.log(
        '{{trip_event}}',
        `trip:${user.role === EUserRole.DRIVER ? 'driver-' : ''}${trip.status.toLowerCase()}`,
      );

      io?.to(user.id).emit(
        `trip:${user.role === EUserRole.DRIVER ? 'driver-' : ''}${trip.status.toLowerCase()}`,
        JSON.stringify({
          success: true,
          statusCode: StatusCodes.OK,
          message: `Trip ${trip.status.toLowerCase()} successfully from recover trip`,
          data: trip,
          meta: {
            trip_id: trip.id,
            chat_id: trip.chat_id,
          },
        } satisfies TServeResponse<typeof trip>),
      );
    }
  },

  async getTripHistory({
    limit,
    page,
    search,
    status,
    driver_id,
    passenger_id,
  }: TGetTripHistory) {
    const where: Prisma.TripWhereInput = {};

    if (driver_id) where.driver_id = driver_id;
    if (passenger_id) where.passenger_id = passenger_id;

    if (status) {
      where.status =
        status === ETripStatus.UPCOMING
          ? {
              not: {
                in: [ETripStatus.CANCEL, ETripStatus.COMPLETED],
              },
            }
          : status;
    }

    if (search) {
      where.OR = searchableFields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));
    }

    const trips = await prisma.trip.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      omit: tripOmit,
      include: {
        driver: {
          select: {
            name: true,
            avatar: true,
          },
        },
        passenger: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        requested_at: 'desc',
      },
    });

    const total = await prisma.trip.count({ where });

    const activeTipCount = await prisma.trip.count({
      where: {
        status: {
          not: {
            in: [ETripStatus.CANCEL, ETripStatus.COMPLETED],
          },
        },
      },
    });

    const completedTipCount = await prisma.trip.count({
      where: {
        status: ETripStatus.COMPLETED,
      },
    });

    const cancelledTripCount = await prisma.trip.count({
      where: {
        status: ETripStatus.CANCEL,
      },
    });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
        status,
        activeTipCount,
        completedTipCount,
        cancelledTripCount,
      },
      trips,
    };
  },

  async ratingTrip({ rating, trip_id, feedback, reviewer_id }: TRatingTrip) {
    const trip = await prisma.trip.findUnique({
      where: { id: trip_id },
      select: {
        driver: {
          select: {
            id: true,
            rating: true,
          },
        },
      },
    });

    if (!trip?.driver) {
      throw new ServerError(
        StatusCodes.NOT_FOUND,
        'No driver assigned for this trip',
      );
    }

    //? Save review
    await prisma.review.create({
      data: {
        user_id: trip.driver.id,
        reviewer_id,
        rating,
        comment: feedback,
        ref_trip_id: trip_id,
      },
    });

    const driverRating = trip?.driver?.rating || 0;

    const avgRating = Number(((driverRating + rating) / 2).toFixed(1));

    //? Notify user about new review
    await NotificationServices.createNotification({
      user_id: trip.driver.id,
      title: 'New Review Received',
      message: `You received a ${rating}-star review. Your average rating is now ${avgRating}.`,
    });

    return prisma.user.update({
      where: { id: trip?.driver?.id },
      data: { rating: avgRating, rating_count: { increment: 1 } },
    });
  },
};
