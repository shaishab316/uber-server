// import { StatusCodes } from 'http-status-codes';
// import { ETripStatus } from '../../../../prisma';
// import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../../util/db';
import getDistanceAndTime from '../../../util/location/getDistanceAndTime';
import { TTripStart } from './Trip.interface';
import config from '../../../config';
import { Trip as TTrip } from '../../../../prisma';

export const TripServices = {
  async start({
    dropoff_address,
    pickup_address,
    vehicle,
    stops,
    passenger_id,
    passenger_ages,
  }: TTripStart & { passenger_id: string }) {
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

    await this.findNearestDriver(trip);
  },

  async rejectTrip(tripId: string, driverId: string) {
    const trip = (await prisma.trip.findUnique({
      where: { id: tripId },
    }))!;

    Object.assign(trip, {
      exclude_driver_ids: Array.from(
        new Set([...trip.exclude_driver_ids, driverId]),
      ),
    });

    await prisma.trip.update({
      where: { id: tripId },
      data: { exclude_driver_ids: trip.exclude_driver_ids },
    });

    await this.findNearestDriver(trip);
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
};
