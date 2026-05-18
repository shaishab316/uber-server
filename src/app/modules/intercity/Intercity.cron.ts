import { prisma } from '../../../utils/db';
import { NotificationServices } from '../notification/Notification.service';

export const sendIntercityReminders = async () => {
  try {
    // Get all scheduled intercity rides
    const intercities = await prisma.intercity.findMany({
      where: {
        status: 'SCHEDULED',
      },
      include: {
        join_requests: {
          where: {
            status: 'ACCEPTED',
          },
          select: {
            passenger_id: true,
          },
        },
        bookings: {
          select: {
            passenger_id: true,
          },
        },
      },
    });

    const now = new Date();
    const notificationPromises: Promise<any>[] = [];

    for (const intercity of intercities) {
      if (!intercity.scheduled_at) continue;

      // Calculate minutes until scheduled time
      const minutesUntilScheduled = Math.floor(
        (intercity.scheduled_at.getTime() - now.getTime()) / (1000 * 60),
      );

      // Check if we should send 30-minute reminder
      if (minutesUntilScheduled === 30 || minutesUntilScheduled === 29) {
        console.log(
          'Sending 30-minute reminder for intercity %s',
          intercity.id,
        );
        const passengerIds = new Set<string>();

        // Add accepted join request passengers
        intercity.join_requests.forEach(req => {
          if (req.passenger_id) passengerIds.add(req.passenger_id);
        });

        // Add booked passengers
        intercity.bookings.forEach(booking => {
          if (booking.passenger_id) passengerIds.add(booking.passenger_id);
        });

        // Send notifications to all passengers
        passengerIds.forEach(passengerId => {
          notificationPromises.push(
            NotificationServices.createNotification({
              user_id: passengerId,
              title: '🚗 Ride Starting in 30 Minutes',
              message: `Your intercity ride is starting in 30 minutes. Get ready for departure!`,
            }),
          );
        });
      }

      // Check if we should send 15-minute reminder
      if (minutesUntilScheduled === 15 || minutesUntilScheduled === 14) {
        console.log(
          'Sending 15-minute reminder for intercity %s',
          intercity.id,
        );
        const passengerIds = new Set<string>();

        // Add accepted join request passengers
        intercity.join_requests.forEach(req => {
          if (req.passenger_id) passengerIds.add(req.passenger_id);
        });

        // Add booked passengers
        intercity.bookings.forEach(booking => {
          if (booking.passenger_id) passengerIds.add(booking.passenger_id);
        });

        // Send notifications to all passengers
        passengerIds.forEach(passengerId => {
          notificationPromises.push(
            NotificationServices.createNotification({
              user_id: passengerId,
              title: '⏰ Ride Starting in 15 Minutes',
              message: `Your intercity ride is starting in 15 minutes. Please be at the pickup location!`,
            }),
          );
        });
      }
    }

    // Execute all notifications in parallel
    if (notificationPromises.length > 0) {
      await Promise.all(notificationPromises);
      console.log('Sent %d intercity reminders', notificationPromises.length);
    }
  } catch (error) {
    console.log('Error sending intercity reminders: %o', error);
    throw error;
  }
};
