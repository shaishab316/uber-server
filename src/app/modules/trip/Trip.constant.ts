import { Prisma, Trip as TTrip } from '../../../../prisma';

export const tripOmit: Prisma.TripOmit = {
  exclude_driver_ids: true,
  sOtp: true,
  eOtp: true,
};

export const tripSearchableFields: (keyof TTrip)[] = [
  'driver_id',
  'id',
  'vehicle',
];
