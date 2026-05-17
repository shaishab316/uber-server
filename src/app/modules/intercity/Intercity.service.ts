import { prisma } from '../../../utils/db';
import {
  TCreateIntercity,
  TUpdateIntercityStatus,
  THandleJoinRequest,
  TGetIntercityRides,
} from './Intercity.interface';
import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import { EDay } from '../../../../prisma';
import { TPagination } from '../../../utils/server/serveResponse';

export const IntercityServices = {
  async createIntercity(data: TCreateIntercity) {
    const today: EDay = [
      EDay.SUNDAY,
      EDay.MONDAY,
      EDay.TUESDAY,
      EDay.WEDNESDAY,
      EDay.THURSDAY,
      EDay.FRIDAY,
      EDay.SATURDAY,
    ][new Date().getDay()];

    const intercity = await prisma.intercity.create({
      data: {
        driver_id: data.driver_id,
        vehicle: data.vehicle,
        pickup_address: data.pickup_address,
        dropoff_address: data.dropoff_address,
        available_seats: data.available_seats,
        total_seats: data.total_seats,
        price_per_seat: data.price_per_seat,
        scheduled_at: data.scheduled_at
          ? new Date(data.scheduled_at)
          : new Date(),
        day: today,
        notes: data.notes,
        stops: data.stops || [],
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });

    return intercity;
  },

  async getDriverIntercities(
    driverId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const [intercities, total] = await Promise.all([
      prisma.intercity.findMany({
        where: { driver_id: driverId },
        skip,
        take: limit,
        include: {
          intercityJoinRequests: {
            select: {
              id: true,
              passenger_id: true,
              status: true,
              seats_requested: true,
              pickup_location: true,
            },
          },
          intercityBookings: {
            select: {
              id: true,
              passenger_id: true,
              seats_booked: true,
              total_fare: true,
            },
          },
        },
      }),
      prisma.intercity.count({
        where: { driver_id: driverId },
      }),
    ]);

    return {
      data: intercities,
      meta: {
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        } satisfies TPagination,
      },
    };
  },

  async getIntercityById(intercityId: string, driverId: string) {
    const intercity = await prisma.intercity.findUnique({
      where: { id: intercityId },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
            rating: true,
          },
        },
        intercityJoinRequests: {
          include: {
            passenger: {
              select: {
                id: true,
                name: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
        intercityBookings: {
          include: {
            passenger: {
              select: {
                id: true,
                name: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!intercity) {
      throw new ServerError(StatusCodes.NOT_FOUND, 'Intercity ride not found');
    }

    if (intercity.driver_id !== driverId) {
      throw new ServerError(StatusCodes.FORBIDDEN, 'Unauthorized access');
    }

    return intercity;
  },

  async updateIntercityStatus(
    intercityId: string,
    data: TUpdateIntercityStatus,
  ) {
    if (
      data.driver_id !==
      (
        await prisma.intercity.findUnique({
          where: { id: intercityId },
          select: { driver_id: true },
        })
      )?.driver_id
    ) {
      throw new ServerError(StatusCodes.FORBIDDEN, 'Unauthorized access');
    }

    const intercity = await prisma.intercity.update({
      where: { id: intercityId },
      data: { status: data.status },
      include: {
        intercityJoinRequests: true,
        intercityBookings: true,
      },
    });

    return intercity;
  },

  async handleJoinRequest(requestId: string, data: THandleJoinRequest) {
    const joinRequest = await prisma.intercityJoinRequest.findUnique({
      where: { id: requestId },
    });

    if (!joinRequest) {
      throw new ServerError(StatusCodes.NOT_FOUND, 'Join request not found');
    }

    const intercity = await prisma.intercity.findUnique({
      where: { id: joinRequest.intercity_id },
    });

    if (intercity?.driver_id !== data.driver_id) {
      throw new ServerError(StatusCodes.FORBIDDEN, 'Unauthorized access');
    }

    const updated = await prisma.intercityJoinRequest.update({
      where: { id: requestId },
      data: {
        status: data.status,
        responded_at: new Date(),
      },
      include: {
        passenger: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    return updated;
  },
};
