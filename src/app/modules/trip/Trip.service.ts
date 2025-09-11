import { prisma } from '../../../util/db';
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

    const [pickupLng, pickupLat] = trip.pickup_address.geo;

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
            maxDistance: 5000,
            query: {},
          },
        },
        { $limit: 1 },
      ],
    });

    const driver = nearestDriver?.[0]?.driver_id?.$oid;

    global.io?.to(driver).emit('receivePassenger', JSON.stringify(trip));
  },
};
