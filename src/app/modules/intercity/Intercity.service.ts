import { prisma } from '../../../utils/db';
import {
  TCreateIntercity,
  TUpdateIntercityStatus,
  THandleJoinRequest,
  TGetIntercityRides,
  TFindNearbyIntercities,
} from './Intercity.interface';
import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import { EDay } from '../../../../prisma';
import { TPagination } from '../../../utils/server/serveResponse';
import { NotificationServices } from '../notification/Notification.service';

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
          join_requests: {
            select: {
              id: true,
              passenger_id: true,
              status: true,
              seats_requested: true,
              pickup_location: true,
            },
          },
          bookings: {
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
        join_requests: {
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
        bookings: {
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
    const existingIntercity = await prisma.intercity.findUnique({
      where: { id: intercityId },
      select: { driver_id: true, status: true },
    });

    if (data.driver_id !== existingIntercity?.driver_id) {
      throw new ServerError(StatusCodes.FORBIDDEN, 'Unauthorized access');
    }

    const intercity = await prisma.intercity.update({
      where: { id: intercityId },
      data: { status: data.status },
      include: {
        join_requests: true,
        bookings: true,
      },
    });

    const notificationPromises: Promise<any>[] = [];

    const getStatusMessage = (status: string): string => {
      switch (status) {
        case 'ONGOING':
          return 'Your ride is starting soon! Get ready for pickup.';
        case 'COMPLETED':
          return 'Your ride has been completed. Thank you for traveling with us!';
        case 'CANCELLED':
          return 'Unfortunately, your ride has been cancelled. We apologize for any inconvenience.';
        default:
          return 'Your ride status has been updated.';
      }
    };

    // Notify booked passengers
    intercity.bookings.forEach(booking => {
      if (booking.passenger_id) {
        notificationPromises.push(
          NotificationServices.createNotification({
            user_id: booking.passenger_id,
            title:
              data.status === 'ONGOING'
                ? '🚗 Your ride is on the way!'
                : `Ride ${data.status}`,
            message: getStatusMessage(data.status),
          }),
        );
      }
    });

    // Notify join request passengers when scheduled ride is cancelled
    if (
      existingIntercity?.status === 'SCHEDULED' &&
      data.status === 'CANCELLED'
    ) {
      intercity.join_requests.forEach(request => {
        if (request.passenger_id) {
          notificationPromises.push(
            NotificationServices.createNotification({
              user_id: request.passenger_id,
              title: '❌ Intercity Ride Cancelled',
              message:
                'The intercity ride you were waiting to join has been cancelled. Your seat refund (if any) will be processed shortly.',
            }),
          );
        }
      });
    }

    await Promise.all(notificationPromises);

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

  async findNearbyIntercities(query: TFindNearbyIntercities) {
    const skip = (query.page - 1) * query.limit;
    const radiusInMeters = query.radius * 1000; // Convert km to meters

    // Use MongoDB aggregation pipeline with $geoNear operator
    const pipeline = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [query.long, query.lat],
          },
          distanceField: 'distance',
          spherical: true,
          maxDistance: radiusInMeters,
          key: 'pickup_address.geo',
          query: {
            status: 'SCHEDULED',
          },
        },
      },
      { $skip: skip },
      { $limit: query.limit },
      {
        $lookup: {
          from: 'users',
          let: { driver_id: '$driver_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$driver_id'],
                },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                avatar: 1,
                rating: 1,
                phone: 1,
              },
            },
          ],
          as: 'driver',
        },
      },
      {
        $addFields: {
          driver: {
            $cond: [
              { $gt: [{ $size: '$driver' }, 0] },
              { $arrayElemAt: ['$driver', 0] },
              null,
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'intercity_join_requests',
          localField: '_id',
          foreignField: 'intercity_id',
          as: 'join_requests',
        },
      },
      {
        $lookup: {
          from: 'intercity_bookings',
          localField: '_id',
          foreignField: 'intercity_id',
          as: 'bookings',
        },
      },
      {
        $project: {
          _id: 1,
          driver_id: 1,
          status: 1,
          scheduled_at: 1,
          available_seats: 1,
          total_seats: 1,
          price_per_seat: 1,
          notes: 1,
          day: 1,
          vehicle: 1,
          pickup_address: 1,
          dropoff_address: 1,
          stops: 1,
          distance: 1,
          'driver._id': 1,
          'driver.name': 1,
          'driver.avatar': 1,
          'driver.rating': 1,
          'driver.phone': 1,
          'join_requests._id': 1,
          'join_requests.status': 1,
          'bookings._id': 1,
          'bookings.seats_booked': 1,
        },
      },
    ];

    const intercities = (await prisma.intercity.aggregateRaw({
      pipeline,
    })) as unknown as any[];

    // Get total count for pagination
    const countPipeline = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [query.long, query.lat],
          },
          distanceField: 'distance',
          spherical: true,
          maxDistance: radiusInMeters,
          key: 'pickup_address.geo',
          query: {
            status: 'SCHEDULED',
          },
        },
      },
      {
        $count: 'total',
      },
    ];

    const countResult = (await prisma.intercity.aggregateRaw({
      pipeline: countPipeline,
    })) as unknown as any[];

    const total = countResult?.[0]?.total || 0;

    // Map results to match expected format and convert BSON to JSON
    const enrichedData = intercities.map((intercity: any) => {
      const getId = (val: any) => {
        if (!val) return null;
        if (typeof val === 'string') return val;
        if (val.$oid) return val.$oid;
        return val.toString?.() || val;
      };

      const getDate = (val: any) => {
        if (!val) return null;
        if (val.$date) return new Date(val.$date);
        return new Date(val);
      };

      return {
        id: getId(intercity._id),
        driver_id: getId(intercity.driver_id),
        status: intercity.status,
        scheduled_at: getDate(intercity.scheduled_at),
        available_seats: intercity.available_seats,
        total_seats: intercity.total_seats,
        price_per_seat: intercity.price_per_seat,
        notes: intercity.notes,
        day: intercity.day,
        vehicle: intercity.vehicle,
        pickup_address: intercity.pickup_address,
        dropoff_address: intercity.dropoff_address,
        stops: intercity.stops || [],
        distance: intercity.distance,
        driver: intercity.driver
          ? {
              id: getId(intercity.driver._id),
              name: intercity.driver.name,
              avatar: intercity.driver.avatar,
              rating: intercity.driver.rating,
              phone: intercity.driver.phone,
            }
          : null,
        join_requests: (intercity.join_requests || []).map((req: any) => ({
          id: getId(req._id),
          status: req.status,
        })),
        bookings: (intercity.bookings || []).map((booking: any) => ({
          id: getId(booking._id),
          seats_booked: booking.seats_booked,
        })),
      };
    });

    return {
      data: enrichedData,
      meta: {
        pagination: {
          total,
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(total / query.limit),
        } satisfies TPagination,
      },
    };
  },
};
