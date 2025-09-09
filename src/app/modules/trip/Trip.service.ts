
export const TripServices = {
  async create(tripData: TTrip) {
    return Trip.create(tripData);
  },
};
