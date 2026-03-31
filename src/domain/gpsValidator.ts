// ============================================================
// GPS Validator — Pure Domain Logic
// ============================================================
// Validates GPS proximity to property coordinates using the
// Haversine formula. Zero framework imports.
// ============================================================

import { GPSCoordinate } from '../types/index.js';

const EARTH_RADIUS_METERS = 6_371_000;

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculates the distance in meters between two GPS coordinates
 * using the Haversine formula.
 */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

/**
 * Validates whether a GPS coordinate is within an acceptable distance
 * of the property location.
 */
export function validateGPSProximity(
  gps: GPSCoordinate,
  propertyLat: number,
  propertyLng: number,
  maxDistanceMeters: number = 500
): { isValid: boolean; distanceMeters: number } {
  const distanceMeters = haversineDistance(
    gps.latitude, gps.longitude,
    propertyLat, propertyLng
  );
  return {
    isValid: distanceMeters <= maxDistanceMeters,
    distanceMeters: Math.round(distanceMeters),
  };
}
