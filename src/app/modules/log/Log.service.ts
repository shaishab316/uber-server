import { Prisma } from '../../../../prisma';
import { prisma } from '../../../util/db';
import { TPagination } from '../../../util/server/serveResponse';
import { TList } from '../query/Query.interface';
import { logSearchableFields as searchableFields } from './Log.constant';

export const LogServices = {
  async getSuccessLogs({
    page,
    limit,
    search,
    timestamp,
  }: TList & { timestamp?: Date }) {
    const where: Prisma.LogWhereInput = {};

    if (search)
      where.OR = searchableFields.map(field => ({
        [field]: { contains: search, mode: 'insensitive' },
      }));

    if (timestamp) {
      const startOfDay = new Date(timestamp);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(timestamp);
      endOfDay.setHours(23, 59, 59, 999);

      where.timestamp = { gte: startOfDay, lte: endOfDay };
    }

    const logs = await prisma.log.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      select: { timestamp: true, message: true, id: true },
      orderBy: { timestamp: 'desc' },
    });

    const total = await prisma.log.count({ where });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
      },
      logs,
    };
  },

  async getErrorLogs({
    page,
    limit,
    search,
    timestamp,
  }: TList & { timestamp: Date }) {
    const where: Prisma.ErrorLogWhereInput = {};

    if (search)
      where.OR = searchableFields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));

    if (timestamp) {
      const startOfDay = new Date(timestamp);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(timestamp);
      endOfDay.setHours(23, 59, 59, 999);

      where.timestamp = { gte: startOfDay, lte: endOfDay };
    }

    const error_logs = await prisma.errorLog.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        timestamp: true,
        message: true,
        id: true,
      },
      orderBy: { timestamp: 'desc' },
    });

    const total = await prisma.errorLog.count({ where });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
      },
      error_logs,
    };
  },

  async clearLogs() {
    return prisma.log.deleteMany({ where: {} });
  },

  async clearErrorLogs() {
    return prisma.errorLog.deleteMany({ where: {} });
  },

  async deleteLog(id: string) {
    return prisma.log.delete({ where: { id } });
  },

  async deleteErrorLog(id: string) {
    return prisma.errorLog.delete({ where: { id } });
  },
};
