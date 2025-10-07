// import { StatusCodes } from 'http-status-codes';
// import { ETripStatus } from '../../../../prisma';
// import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../../utils/db';
import { TRequestForTrip } from './Trip.interface';
import config from '../../../config';
import {
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
import { Namespace } from 'socket.io';
import { tripOmit } from './Trip.constant';
import { otpGenerator } from '../../../utils/crypto/otpGenerator';
import { TServeResponse } from '../../../utils/server/serveResponse';
import { socketResponse } from '../socket/Socket.utils';
import getDistanceAndTime from '../../../utils/location/getDistanceAndTime';
import chalk from 'chalk';
import { AvailableDriverServices } from '../availableDriver/AvailableDriver.service';
import ms from 'ms';
import { calculateFare } from '../../../utils/uber/calculateFare';

export const TripServices = {
  async requestForTrip({
    dropoff_address,
    pickup_address,
    vehicle,
    stops,
    passenger_id,
    passenger_ages,
  }: TRequestForTrip) {
    //! TODO: uncomment it
    // const existingTrip = await prisma.trip.findFirst({
    //   where: {
    //     passenger_id,
    //     status: ETripStatus.REQUESTED,
    //   },
    //   select: {
    //     id: true,
    //   },
    // });

    // if (existingTrip)
    //   throw new ServerError(
    //     StatusCodes.CONFLICT,
    //     'You have a pending trip with id ' + existingTrip.id,
    //   );

    const sOtp = otpGenerator(config.otp.length);
    const eOtp = otpGenerator(config.otp.length);

    const { distance, duration } = await getDistanceAndTime(
      pickup_address.geo,
      dropoff_address.geo,
    );

    const estimatedFare = calculateFare({
      distance: distance.value,
      time: duration.value,
      passengerAges: passenger_ages,
    });

    console.log(estimatedFare);

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
        distance_km: distance.value,
        
      },
      select: {
        passenger: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            nid_number: true,
          },
        },
        pickup_address: true,
        dropoff_address: true,
        stops: true,
        passenger_ages: true,
        id: true,
        status: true,
        requested_at: true,
      },
    });

    //! Don't use await for faster response
    this.findNearestDriver(trip);

    return {
      trip_id: trip.id,
      start_otp: sOtp,
      end_otp: eOtp,
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
    const trip = (await prisma.trip.findUnique({
      where: { id: trip_id },
      omit: {
        ...tripOmit,
        exclude_driver_ids: undefined,
      },
    }))!;

    Object.assign(trip, {
      exclude_driver_ids: Array.from(
        new Set([...trip.exclude_driver_ids, driver_id]),
      ),
    });

    await prisma.trip.update({
      where: { id: trip_id },
      data: { exclude_driver_ids: trip.exclude_driver_ids },
    });

    //! Don't use await for faster response
    this.findNearestDriver(trip);

    //! Track cancel trip reason
    await CancelTripServices.cancelTrip({
      trip_id,
      driver_id,
      reason,
    });
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
          },
        },
      },
    });

    if (trip?.driver_id)
      throw new ServerError(
        StatusCodes.CONFLICT,
        `Driver ${trip.driver?.name} is already assigned to this trip`,
      );

    const updatedTrip = await prisma.trip.update({
      where: { id: trip_id },
      data: {
        driver_id,
        status: ETripStatus.ACCEPTED,
        vehicle_address: location,
        accepted_at: new Date(),
      },
      include: {
        passenger: {
          select: {
            name: true,
          },
        },
      },
      omit: tripOmit,
    });

    SocketServices.getIO('/trip')
      ?.to(trip_id)
      .emit(
        'trip_notification',
        socketResponse({
          message: `${updatedTrip?.passenger?.name} accepted your trip request`,
          data: updatedTrip,
          meta: {
            trip_id,
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

    const updatedTrip = await prisma.trip.update({
      where: { id: trip_id },
      data: {
        driver_id,
        status: ETripStatus.STARTED,
        started_at: new Date(),
      },
      include: {
        passenger: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
      omit: tripOmit,
    });

    SocketServices.getIO('/trip')
      ?.to(trip_id)
      .emit(
        'trip_notification',
        socketResponse({
          message: `${updatedTrip?.passenger?.name} started your trip`,
          data: updatedTrip,
          meta: {
            trip_id,
          },
        }),
      );

    SocketServices.getIO('/trip')
      ?.to(updatedTrip.passenger_id)
      .emit(
        'start_trip',
        socketResponse({
          message: 'Trip started',
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
        driver_id,
        status: ETripStatus.COMPLETED,
        completed_at: new Date(),
      },
      include: {
        passenger: {
          select: {
            name: true,
          },
        },
      },
      omit: tripOmit,
    });

    SocketServices.getIO('/trip')
      ?.to(trip_id)
      .emit(
        'trip_notification',
        socketResponse({
          message: `${updatedTrip?.passenger?.name} completed your trip`,
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
            // Filter excluded drivers at database level
            query: trip.exclude_driver_ids?.length
              ? {
                  driver_id: {
                    $nin: trip.exclude_driver_ids.map(id => ({ $oid: id })),
                  },
                }
              : {},
          },
        },
        { $limit: 1 },
        // Project only needed fields to reduce memory
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
    const io = SocketServices.getIO('/trip');
    const timeout = Date.now() - new Date(trip.requested_at!).getTime();

    // If more than 20 seconds have passed, notify passenger
    if (timeout > ms('20s')) {
      io?.to(trip.passenger_id!).emit(
        'trip_notification',
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
        'close_trip',
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
  },

  // Extract socket emission to separate method
  async sendTripRequest(driverId: string, trip: Partial<TTrip>): Promise<void> {
    const io = SocketServices.getIO('/trip');

    console.log(chalk.red(`Sending trip request to driver ${driverId}`));

    io?.to(driverId).emit(
      'request_for_trip',
      socketResponse({
        message: 'Request for trip',
        data: trip,
        meta: { trip_id: trip.id },
      }),
    );
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
    io: Namespace | null;
  }) {
    const { user } = socket.data;
    const userSelectableField = { select: { name: true, avatar: true } };
    const where: Prisma.TripWhereInput = {
      status: ETripStatus.STARTED,
    };

    if (user.role === EUserRole.DRIVER) {
      where.driver_id = user.id;
    } else {
      where.passenger_id = user.id;
    }

    const trip = await prisma.trip.findFirst({
      where,
      include: {
        driver: userSelectableField,
        passenger: userSelectableField,
      },
      omit: tripOmit,
    });

    if (trip) {
      socket.join(trip.id);
      io?.to(trip.id).emit(
        'start_trip',
        JSON.stringify({
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Trip started successfully',
          data: trip,
          meta: {
            trip_id: trip.id,
          },
        } as TServeResponse<typeof trip>),
      );
    }
  },
};
