import { Prisma } from '../../../../prisma';
import { prisma } from '../../../util/db';
import { TPagination } from '../../../util/server/serveResponse';
import { TList } from '../query/Query.interface';
import { userOmit } from '../user/User.service';

export const CancelTripServices = {
  async cancelTrip({
    trip_id,
    driver_id,
    reason,
  }: {
    trip_id: string;
    driver_id: string;
    reason: string;
  }) {
    return prisma.cancelTrip.upsert({
      where: {
        trip_id,
      },
      update: {
        driver_id,
        reason,
      },
      create: {
        trip_id,
        driver_id,
        reason,
      },
    });
  },

  async getAllCancelTrip({
    limit,
    page,
    driver_id,
    search,
  }: TList & { driver_id: string }) {
    const where: Prisma.CancelTripWhereInput = {};

    if (driver_id) where.driver_id = driver_id;

    if (search)
      where.OR = [
        { reason: { contains: search, mode: 'insensitive' } },
        { driver: { name: { contains: search, mode: 'insensitive' } } },
      ];

    const cancelTrips = await prisma.cancelTrip.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        driver: {
          omit: userOmit,
        },
        trip: {
          omit: {
            exclude_driver_ids: true,
          },
        },
      },
    });

    const total = await prisma.cancelTrip.count({ where });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
      },
      cancelTrips,
    };
  },
};
