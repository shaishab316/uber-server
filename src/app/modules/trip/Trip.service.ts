// import { StatusCodes } from 'http-status-codes';
// import { ETripStatus } from '../../../../prisma';
// import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import { prisma } from '../../../util/db';
import getDistanceAndTime from '../../../util/location/getDistanceAndTime';
import { TTripStart } from './Trip.interface';

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

    const [pickupLng, pickupLat] = pickup_address.geo;

    const nearestDriver: any = await prisma.availableDriver.aggregateRaw({
      pipeline: [
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [pickupLng, pickupLat],
            },
            distanceField: 'distance',
            spherical: true,
            maxDistance: 500000,
            query: {},
          },
        },
        { $limit: 1 },
      ],
    });

    const driver = nearestDriver?.[0]?.driver_id?.$oid;

    if (!driver)
      throw new ServerError(StatusCodes.NOT_FOUND, 'Driver not found');

    const distanceDuration = await getDistanceAndTime(
      pickup_address.geo,
      nearestDriver?.[0]?.location?.geo,
    );

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
      },
    });

    Object.assign(trip, {
      ...distanceDuration,
      passenger_count: trip.passenger_ages?.length,
    });

    global.io?.to(driver).emit('receivePassenger', JSON.stringify(trip));
  },
};
