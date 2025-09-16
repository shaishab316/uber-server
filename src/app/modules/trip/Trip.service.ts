// import { StatusCodes } from 'http-status-codes';
// import { ETripStatus } from '../../../../prisma';
// import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../../util/db';
import getDistanceAndTime from '../../../util/location/getDistanceAndTime';
import { TTripStart } from './Trip.interface';
import config from '../../../config';
import { TLocation, Trip as TTrip } from '../../../../prisma';
import ServerError from '../../../errors/ServerError';
import { CancelTripServices } from '../cancelTrip/CancelTrip.service';

export const TripServices = {
  async start({
    dropoff_address,
    pickup_address,
    vehicle,
    stops,
    passenger_id,
    passenger_ages,
  }: TTripStart & { passenger_id: string }) {
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

    const trip = await prisma.trip.create({
      data: {
        dropoff_address,
        pickup_address,
        vehicle,
        stops,
        passenger_ages,
        passenger_id,
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
      },
    });

    //! Don't use await for faster response
    this.findNearestDriver(trip);

    return trip;
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

  async findNearestDriver(trip: Partial<TTrip>) {
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

    if (!driver)
      return global.io?.to(trip.passenger_id!).emit(
        'tripInfo',
        JSON.stringify({
          id: trip.id,
          status: StatusCodes.NOT_FOUND,
          message: 'No driver found',
        }),
      );

    const distanceDuration = await getDistanceAndTime(
      trip.pickup_address!.geo,
      nearestDriver?.[0]?.location?.geo,
    );

    Object.assign(trip, {
      ...distanceDuration,
      passenger_count: trip.passenger_ages?.length,
    });

    global.io?.to(driver).emit('receivePassenger', JSON.stringify(trip));
  },

  async updateTripLocation({
    location,
    tripId,
    userId,
  }: {
    location: TLocation;
    tripId: string;
    userId: string;
  }) {
    // Get the trip info
    const trip = (await prisma.trip.findUnique({
      where: { id: tripId },
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

    if (trip.driver.id !== userId)
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        `You can't location update for ${trip.driver.name}'s trip`,
      );

    // Finally update trip location
    await prisma.trip.update({
      where: { id: tripId },
      data: { vehicle_address: location },
    });
  },
};
