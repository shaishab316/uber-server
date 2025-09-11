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
        passenger_id,
        passenger_ages,
      },
    });
  },
};
