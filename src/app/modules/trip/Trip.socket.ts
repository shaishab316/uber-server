import { prisma } from '../../../utils/db';
import { TSocketHandler } from '../socket/Socket.interface';
import { TripValidations } from './Trip.validation';
import { TripServices } from './Trip.service';
import { tripNotificationMaps } from './Trip.utils';
import { EUserRole } from '../../../../prisma';
import { catchAsyncSocket, socketResponse } from '../socket/Socket.utils';
import { AvailableDriverServices } from '../availableDriver/AvailableDriver.service';
import getDistanceAndTime from '../../../utils/location/getDistanceAndTime';
import { calculateTripFare } from '../../../utils/uber/tripFareHelper';

const TripSocket: TSocketHandler = async (io, socket) => {
  const { user } = socket.data;

  //! Launch started trip quickly
  await TripServices.launchStartedTrip({ io, socket });

  //! delete offline driver from availableDriver
  socket.on('disconnect', async () => {
    try {
      await AvailableDriverServices.leave({ driver_id: user.id });
    } catch {
      void 0;
    }
  });

  const isUser = user.role === EUserRole.USER;

  socket.on(
    'trip:update_location',
    catchAsyncSocket(async ({ location, trip_id }) => {
      const trip = await TripServices.updateTripLocation({
        user_id: user.id,
        trip_id,
        location,
      });

      // Target the other participant in the trip
      const targetUserId = isUser ? trip.driver_id : trip.passenger_id;
      if (targetUserId) {
        io.to(targetUserId).emit(
          'trip:location_updated',
          socketResponse({
            message: `${user.name} updated trip's location`,
            data: location,
            meta: { trip_id },
          }),
        );
      }

      const { distance } = await getDistanceAndTime(
        trip.pickup_address.geo,
        location.geo,
      );

      // Recalculate fare with updated distance (driver's current position to destination)
      const fareResult = await calculateTripFare({
        distance_km: distance.value / 1000, // Convert meters to km
        passenger_ages: trip.passenger_ages,
        requested_at: trip.requested_at,
        accepted_at: trip.accepted_at,
        started_at: trip.started_at,
        pickup_address: trip.pickup_address,
        dropoff_address: trip.dropoff_address,
        stops: trip.stops,
      } as any);

      const estimatedFare = fareResult.total;

      if (trip.total_cost < estimatedFare) {
        await prisma.trip.update({
          where: { id: trip_id },
          data: { total_cost: estimatedFare },
        });
      }

      const { distance: xDistance, duration: xDuration } =
        await getDistanceAndTime(location.geo, trip.dropoff_address.geo);

      const closestNotification = tripNotificationMaps.find(
        notification => xDistance.value <= notification.distance,
      );

      const notification = closestNotification?.message;

      if (notification) {
        io.to(trip.passenger_id).emit(
          'trip:notification',
          socketResponse({
            message: notification,
            data: {
              distance: xDistance,
              duration: xDuration,
            },
            meta: { trip_id },
          }),
        );
      }

      return {
        message: "Trip's location updated successfully!",
        data: location,
        meta: { trip_id },
      };
    }, TripValidations.updateTripLocation),
  );
};

export default TripSocket;
