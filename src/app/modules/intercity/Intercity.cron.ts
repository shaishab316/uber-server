import { prisma } from '../../../utils/db';
import { NotificationServices } from '../notification/Notification.service';

export const sendIntercityReminders = async () => {
  console.log(
    'Running intercity reminders cron job at %s',
    new Date().toISOString(),
  );

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

    console.log('Found %d scheduled intercity rides', intercities.length);

    const now = new Date();

    const notificationPromises: Promise<any>[] = [];

    for (const intercity of intercities) {
      if (!intercity.scheduled_at) continue;

      console.log(
        `Now: ${now.toISOString()}, Intercity ID: ${intercity.id}, Scheduled At: ${intercity.scheduled_at.toISOString()}`,
      );

      // Calculate minutes until scheduled time
      const minutesUntilScheduled = Math.floor(
        (intercity.scheduled_at.getTime() - now.getTime()) / (1000 * 60),
      );

      console.log(
        'Intercity %s is scheduled in %d minutes',
        intercity.id,
        minutesUntilScheduled,
      );

      // Check if we should send 30-minute reminder
      if (minutesUntilScheduled <= 30 || minutesUntilScheduled >= 27) {
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
      if (minutesUntilScheduled <= 15 || minutesUntilScheduled >= 12) {
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
