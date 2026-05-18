import { prisma } from '../../../utils/db';
import {
  TCreateIntercity,
  TUpdateIntercityStatus,
  THandleJoinRequest,
  TGetIntercityRides,
  TFindNearbyIntercities,
  TSendJoinRequest,
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

    // Notify join request passengers for all status updates
    if (intercity.join_requests.length > 0) {
      intercity.join_requests.forEach(request => {
        if (request.passenger_id) {
          let notificationTitle = `Ride ${data.status}`;
          let notificationMessage = getStatusMessage(data.status);

          if (data.status === 'ONGOING') {
            notificationTitle = '🚗 Your ride is on the way!';
          } else if (data.status === 'CANCELLED') {
            notificationTitle = '❌ Intercity Ride Cancelled';
            notificationMessage =
              'The intercity ride you were waiting to join has been cancelled. Your seat refund (if any) will be processed shortly.';
          } else if (data.status === 'COMPLETED') {
            notificationTitle = '✅ Ride Completed';
            notificationMessage =
              'Your intercity ride has been completed. Thank you for traveling with us!';
          }

          notificationPromises.push(
            NotificationServices.createNotification({
              user_id: request.passenger_id,
              title: notificationTitle,
              message: notificationMessage,
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

    // Notify passenger and create booking if accepted
    if (data.status === 'ACCEPTED') {
      if (joinRequest.status !== 'ACCEPTED') {
        // Create intercity booking
        await prisma.intercityBooking.create({
          data: {
            intercity_id: joinRequest.intercity_id,
            passenger_id: joinRequest.passenger_id,
            seats_booked: joinRequest.seats_requested,
            total_fare:
              (intercity?.price_per_seat || 0) * joinRequest.seats_requested,
            pickup_location: joinRequest.pickup_location,
          },
        });

        // Update available seats
        if (intercity) {
          const newAvailableSeats =
            (intercity.available_seats || 0) - joinRequest.seats_requested;
          await prisma.intercity.update({
            where: { id: joinRequest.intercity_id },
            data: {
              available_seats: Math.max(0, newAvailableSeats),
            },
          });
        }
      }

      await NotificationServices.createNotification({
        user_id: joinRequest.passenger_id,
        title: '✅ Join Request Accepted',
        message: `Your join request for the intercity ride has been accepted! You have ${joinRequest.seats_requested} seat(s) reserved.`,
      });
    } else if (data.status === 'REJECTED') {
      await NotificationServices.createNotification({
        user_id: joinRequest.passenger_id,
        title: '❌ Join Request Rejected',
        message:
          'Unfortunately, your join request for the intercity ride has been rejected by the driver.',
      });
    }

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

  async sendJoinRequest(intercityId: string, data: TSendJoinRequest) {
    // Check if intercity exists
    const intercity = await prisma.intercity.findUnique({
      where: { id: intercityId },
      select: {
        id: true,
        driver_id: true,
        available_seats: true,
        status: true,
      },
    });

    if (!intercity) {
      throw new ServerError(StatusCodes.NOT_FOUND, 'Intercity ride not found');
    }

    if (intercity.status !== 'SCHEDULED') {
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        'This intercity ride is not accepting requests',
      );
    }

    // Check if user already has a pending or accepted request for this intercity
    const existingRequest = await prisma.intercityJoinRequest.findFirst({
      where: {
        intercity_id: intercityId,
        passenger_id: data.passenger_id,
        status: {
          in: ['PENDING', 'ACCEPTED'],
        },
      },
    });

    if (existingRequest) {
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        'You already have a pending or accepted request for this ride',
      );
    }

    if (!intercity.available_seats) {
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        'No seats available for this ride',
      );
    }

    // Check if requested seats exceed available seats
    if (data.seats_requested > intercity.available_seats) {
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        `Only ${intercity.available_seats} seats available`,
      );
    }

    // Create join request
    const joinRequest = await prisma.intercityJoinRequest.create({
      data: {
        intercity_id: intercityId,
        passenger_id: data.passenger_id,
        seats_requested: data.seats_requested,
        pickup_location: data.pickup_location,
        message: data.message,
      },
      include: {
        intercity: {
          select: {
            id: true,
            driver_id: true,
            pickup_address: true,
            dropoff_address: true,
            available_seats: true,
            price_per_seat: true,
          },
        },
        passenger: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });

    // Notify driver
    if (intercity.driver_id) {
      await NotificationServices.createNotification({
        user_id: intercity.driver_id,
        title: '🚗 New Join Request',
        message: `A passenger requested to join your intercity ride. They need ${data.seats_requested} seat(s).`,
      });
    }

    return joinRequest;
  },

  async getJoinRequests(
    intercityId: string,
    driverId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    // Verify driver owns this intercity
    const intercity = await prisma.intercity.findUnique({
      where: { id: intercityId },
      select: { driver_id: true },
    });

    if (!intercity) {
      throw new ServerError(StatusCodes.NOT_FOUND, 'Intercity ride not found');
    }

    if (intercity.driver_id !== driverId) {
      throw new ServerError(StatusCodes.FORBIDDEN, 'Unauthorized access');
    }

    const skip = (page - 1) * limit;

    const [joinRequests, total] = await Promise.all([
      prisma.intercityJoinRequest.findMany({
        where: { intercity_id: intercityId },
        skip,
        take: limit,
        include: {
          passenger: {
            select: {
              id: true,
              name: true,
              phone: true,
              avatar: true,
              rating: true,
            },
          },
        },
        orderBy: { requested_at: 'desc' },
      }),
      prisma.intercityJoinRequest.count({
        where: { intercity_id: intercityId },
      }),
    ]);

    return {
      data: joinRequests,
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
};
