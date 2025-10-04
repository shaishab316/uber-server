import { Prisma } from '../../../../prisma';

export const tripOmit: Prisma.TripOmit = {
  exclude_driver_ids: true,
};
