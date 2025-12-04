import { ETripStatus, EUserRole, Prisma } from '../../../../prisma';
import { prisma } from '../../../utils/db';
import { TList } from '../query/Query.interface';
import { userOmit } from '../user/User.service';
import { userSearchableFields as searchFields } from '../user/User.constant';
import { TPagination } from '../../../utils/server/serveResponse';
import { TGetEarningsArgs } from './Driver.interface';

export const DriverServices = {
  async superGetPendingDriver({ page, limit, search }: TList) {
    const where: Prisma.UserWhereInput = {
      is_pending_driver: true,
    };

    if (search)
      where.OR = searchFields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));

    const users = await prisma.user.findMany({
      where,
      omit: userOmit,
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.user.count({ where });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
      },
      users,
    };
  },

  async superApproveDriver(driverId: string) {
    return prisma.user.update({
      where: { id: driverId },
      omit: userOmit,
      data: {
        is_pending_driver: false,
        role: EUserRole.DRIVER,
      },
    });
  },

  async superRejectDriver(driverId: string) {
    return prisma.user.update({
      where: { id: driverId },
      omit: userOmit,
      data: {
        is_pending_driver: false,
        role: EUserRole.USER,
        driver_info: null,
      },
    });
  },

  async getEarnings({ dateType, limit, page, driver_id }: TGetEarningsArgs) {
    const where: Prisma.TripWhereInput = {
      driver_id,
      status: ETripStatus.COMPLETED,
    };

    if (dateType === 'last_month') {
      where.requested_at = {
        gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      };
    } else if (dateType === 'this_month') {
      where.requested_at = {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      };
    } else if (dateType === 'last_week') {
      const today = new Date();
      const lastWeekStart = new Date(
        today.setDate(today.getDate() - today.getDay() - 7),
      );
      const lastWeekEnd = new Date(today.setDate(lastWeekStart.getDate() + 7));
      where.requested_at = {
        gte: lastWeekStart,
        lt: lastWeekEnd,
      };
    } else if (dateType === 'this_week') {
      const today = new Date();
      const thisWeekStart = new Date(
        today.setDate(today.getDate() - today.getDay()),
      );
      const thisWeekEnd = new Date(today.setDate(thisWeekStart.getDate() + 7));
      where.requested_at = {
        gte: thisWeekStart,
        lt: thisWeekEnd,
      };
    }

    const trips = await prisma.trip.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        requested_at: 'desc',
      },
    });

    const total = await prisma.trip.count({ where });
    const totalEarnings = await prisma.trip.aggregate({
      where,
      _sum: {
        total_cost: true,
      },
    });

    const totalOnlineTime = await prisma.trip.aggregate({
      where,
      _sum: {
        duration_sec: true,
      },
    });

    let successRate = 100;
    if (dateType === 'last_month' || dateType === 'this_month') {
      const currentPeriodTrips = await prisma.trip.count({ where });
      const previousPeriodWhere: Prisma.TripWhereInput = {};
      if (dateType === 'last_month') {
        previousPeriodWhere.requested_at = {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        };
      } else {
        previousPeriodWhere.requested_at = {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        };
      }
      const previousPeriodTrips = await prisma.trip.count({
        where: previousPeriodWhere,
      });
      if (previousPeriodTrips > 0) {
        successRate =
          ((currentPeriodTrips - previousPeriodTrips) / previousPeriodTrips) *
          100;
      }
    } else if (dateType === 'last_week' || dateType === 'this_week') {
      const currentPeriodTrips = await prisma.trip.count({ where });
      const previousPeriodWhere: Prisma.TripWhereInput = {};
      const today = new Date();
      if (dateType === 'last_week') {
        const lastWeekStart = new Date(
          today.setDate(today.getDate() - today.getDay() - 14),
        );
        const lastWeekEnd = new Date(
          today.setDate(lastWeekStart.getDate() + 7),
        );
        previousPeriodWhere.requested_at = {
          gte: lastWeekStart,
          lt: lastWeekEnd,
        };
      } else {
        const thisWeekStart = new Date(
          today.setDate(today.getDate() - today.getDay() - 7),
        );
        const thisWeekEnd = new Date(
          today.setDate(thisWeekStart.getDate() + 7),
        );
        previousPeriodWhere.requested_at = {
          gte: thisWeekStart,
          lt: thisWeekEnd,
        };
      }
      const previousPeriodTrips = await prisma.trip.count({
        where: previousPeriodWhere,
      });
      if (previousPeriodTrips > 0) {
        successRate =
          ((currentPeriodTrips - previousPeriodTrips) / previousPeriodTrips) *
          100;
      }
    }

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } satisfies TPagination,
        totalOnlineTime: totalOnlineTime._sum.duration_sec ?? 0,
        successRate,
        totalEarnings: totalEarnings._sum.total_cost ?? 0,
      },
      trips,
    };
  },
};
