import { TLocation } from '../../../../prisma';
import prisma from '../../../util/prisma';

export const AvailableDriverServices = {
  async join({
    location,
    driver_id,
  }: {
    location: TLocation;
    driver_id: string;
  }) {
    return prisma.availableDriver.upsert({
      where: { driver_id },
      update: { location },
      create: { driver_id, location },
    });
  },

  async leave({ driver_id }: { driver_id: string }) {
    return prisma.availableDriver.delete({ where: { driver_id } });
  },
};
