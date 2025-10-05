// import { StatusCodes } from 'http-status-codes';
// import { ETripStatus } from '../../../../prisma';
// import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../../util/db';
import getDistanceAndTime from '../../../util/location/getDistanceAndTime';
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
import { otpGenerator } from '../../../util/crypto/otpGenerator';
import { TServeResponse } from '../../../util/server/serveResponse';

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
      omit: tripOmit,
    });

    SocketServices.getIO()
      ?.to(trip_id)
      .emit(
        'trip_notification',
        JSON.stringify({
          status: StatusCodes.OK,
          message: 'Trip accepted successfully',
          data: updatedTrip,
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

    SocketServices.getIO()
      ?.to(trip_id)
      .emit(
        'trip_notification',
        JSON.stringify({
          status: StatusCodes.OK,
          message: 'Trip started successfully',
          data: updatedTrip,
        }),
      );

    SocketServices.getIO()
      ?.to(updatedTrip.passenger_id)
      .emit('start_trip', JSON.stringify(updatedTrip));
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
      omit: tripOmit,
    });

    SocketServices.getIO()
      ?.to(trip_id)
      .emit(
        'trip_notification',
        JSON.stringify({
          status: StatusCodes.OK,
          message: 'Trip completed successfully',
          data: updatedTrip,
        }),
      );
  },

  async findNearestDriver(trip: Partial<TTrip>) {
    if (trip.status !== ETripStatus.REQUESTED) return;

    const [pickupLng, pickupLat] = trip.pickup_address!.geo;

    const nearestDriver: any = (
      (await prisma.availableDriver.aggregateRaw({
        pipeline: [
          {
            $geoNear: {
              near: {
                type: 'Point',
                coordinates: [pickupLng, pickupLat],
              },
              distanceField: 'distance',
              spherical: true,
              maxDistance: config.app.max_distance,
              query: {},
            },
          },
          { $limit: 1 },
        ],
      })) as any
    ).filter(
      (driver: any) =>
        !trip.exclude_driver_ids ||
        !trip.exclude_driver_ids.includes(driver.driver_id.$oid),
    );

    const driver = nearestDriver?.[0]?.driver_id?.$oid;

    if (!driver) {
      SocketServices.getIO()
        ?.to(trip.passenger_id!)
        .emit(
          'trip_notification',
          JSON.stringify({
            status: StatusCodes.NOT_FOUND,
            message: 'No driver found',
            data: trip,
          }),
        );

      const updatedTrip = await prisma.trip.findUnique({
        where: { id: trip.id },
        omit: {
          ...tripOmit,
          exclude_driver_ids: undefined,
        },
      });

      setTimeout(() => this.findNearestDriver(updatedTrip!), 1000);

      return;
    }

    const distanceDuration = await getDistanceAndTime(
      trip.pickup_address!.geo,
      nearestDriver?.[0]?.location?.geo,
    );

    Object.assign(trip, {
      ...distanceDuration,
      passenger_count: trip.passenger_ages?.length,
    });

    SocketServices.getIO()
      ?.to(driver)
      .emit('request_for_trip', JSON.stringify(trip));
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
