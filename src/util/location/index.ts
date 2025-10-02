export {
  /**
   * Calculates the straight-line distance between two geographic points in meters.
   * Uses the Haversine formula.
   *
   * @param startCoords - Starting point `[longitude, latitude]`
   * @param endCoords - Target point `[longitude, latitude]`
   * @returns Distance in meters
   *
   * @example
   * const driver = [90.4880, 23.7852];
   * const dropoff = [90.4016, 23.7786];
   * console.log(getDistance(driver, dropoff)); // ~9982 meters
   */
  _getDistance as getDistance,
  type _TLocation as TLocationGeo,
} from './_/getDistance';
