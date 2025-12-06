import chalk from 'chalk';
import { errorLogger } from '../../../utils/logger';
import { logger } from '../../../utils/logger';
import config from '../../../config';
import { prisma } from '../../../utils/db';
import { hashPassword } from '../auth/Auth.utils';
import { TAdminOverviewArgs } from './Admin.interface';
import { EUserRole } from '../../../../prisma';

export const AdminServices = {
  /**
   * Seeds the admin user if it doesn't exist in the database
   *
   * This function checks if an admin user already exists in the database.
   * If an admin user exists, it returns without creating a new one.
   * Otherwise, it creates a new admin user with the provided admin data.
   */
  async seed() {
    const { name, email, password } = config.admin;

    logger.info(chalk.green('🔑 admin seed started...'));

    try {
      const admin = await prisma.user.findFirst({
        where: { email },
      });

      if (admin?.is_admin && admin?.is_active && admin?.is_verified) return;

      logger.info(chalk.green('🔑 admin creation started...'));

      if (admin) {
        await prisma.user.update({
          where: {
            id: admin.id,
          },
          data: {
            is_active: true,
            is_verified: true,
            is_admin: true,
          },
        });
      } else {
        await prisma.user.create({
          data: {
            name,
            email,
            password: await hashPassword(password),
            avatar: config.server.default_avatar,

            is_active: true,
            is_verified: true,
            is_admin: true,

            wallet: { create: {} },
          },
        });
      }

      logger.info(chalk.green('✔ admin created successfully!'));
    } catch (error) {
      errorLogger.error(chalk.red('❌ admin creation failed!'), error);
    } finally {
      logger.info(chalk.green('🔑 admin seed completed!'));
    }
  },

  async overview({ tab }: TAdminOverviewArgs) {
    const todayTripsCount = await prisma.trip.count({
      where: {
        accepted_at: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    });

    const todayActiveDrivers = await prisma.user.count({
      where: {
        last_online_at: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
        role: EUserRole.DRIVER,
      },
    });

    const todayActivePassengers = await prisma.user.count({
      where: {
        last_online_at: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
        role: EUserRole.USER,
      },
    });

    const todayEarnings = await prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        created_at: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    });

    const months = [
      'jan',
      'feb',
      'mar',
      'apr',
      'may',
      'jun',
      'jul',
      'aug',
      'sep',
      'oct',
      'nov',
      'dec',
    ];

    let revenueData: { label: string; revenue: number }[] = [];

    if (tab === 'year') {
      // Group by month for the current year
      const yearStart = new Date(new Date().getFullYear(), 0, 1);
      const yearEnd = new Date(
        new Date().getFullYear(),
        11,
        31,
        23,
        59,
        59,
        999,
      );

      const transactions = await prisma.transaction.findMany({
        where: {
          created_at: {
            gte: yearStart,
            lte: yearEnd,
          },
          type: { in: ['TOPUP', 'EXPENSE'] },
        },
        select: {
          amount: true,
          created_at: true,
        },
      });

      // Initialize all months with 0
      const monthlyRevenue = months.map(month => ({
        label: month,
        revenue: 0,
      }));

      // Aggregate by month
      transactions.forEach(transaction => {
        const monthIndex = transaction.created_at.getMonth();
        monthlyRevenue[monthIndex].revenue += transaction.amount * 0.2;
      });

      revenueData = monthlyRevenue;
    } else if (tab === 'month') {
      // Group by day for the current month
      const monthStart = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      );
      const monthEnd = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      const transactions = await prisma.transaction.findMany({
        where: {
          created_at: {
            gte: monthStart,
            lte: monthEnd,
          },
          type: { in: ['TOPUP', 'EXPENSE'] },
        },
        select: {
          amount: true,
          created_at: true,
        },
      });

      // Get the number of days in the current month
      const daysInMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0,
      ).getDate();
      const dailyRevenue = Array.from({ length: daysInMonth }, (_, i) => ({
        label: String(i + 1),
        revenue: 0,
      }));

      // Aggregate by day
      transactions.forEach(transaction => {
        const dayIndex = transaction.created_at.getDate() - 1;
        dailyRevenue[dayIndex].revenue += transaction.amount * 0.2;
      });

      revenueData = dailyRevenue;
    }

    return {
      todayTripsCount,
      todayActiveDrivers,
      todayActivePassengers,
      todayEarnings: todayEarnings._sum.amount
        ? todayEarnings._sum.amount * 0.2
        : 0,
      revenueData,
    };
  },
};
