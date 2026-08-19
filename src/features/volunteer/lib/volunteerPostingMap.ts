import type {
  VolunteerPostingLocation,
  VolunteerPostingMapBounds,
  VolunteerPostingMapItem,
} from "@/features/volunteer/types/volunteer.types";

const BOUNDS_PRECISION = 6;

function normalizeCoordinate(value: number) {
  const precision = 10 ** BOUNDS_PRECISION;

  return Math.round(value * precision) / precision;
}

export function normalizeVolunteerPostingMapBounds(
  bounds: VolunteerPostingMapBounds,
): VolunteerPostingMapBounds {
  return {
    swLat: normalizeCoordinate(bounds.swLat),
    swLng: normalizeCoordinate(bounds.swLng),
    neLat: normalizeCoordinate(bounds.neLat),
    neLng: normalizeCoordinate(bounds.neLng),
  };
}

export function isSameVolunteerPostingMapBounds(
  left: VolunteerPostingMapBounds,
  right: VolunteerPostingMapBounds,
) {
  return (
    left.swLat === right.swLat &&
    left.swLng === right.swLng &&
    left.neLat === right.neLat &&
    left.neLng === right.neLng
  );
}

function isValidCoordinate(
  location: VolunteerPostingLocation,
): location is VolunteerPostingLocation & {
  latitude: number;
  longitude: number;
} {
  if (location.latitude === null || location.longitude === null) {
    return false;
  }

  return (
    Number.isFinite(location.latitude) &&
    Number.isFinite(location.longitude) &&
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    location.longitude >= -180 &&
    location.longitude <= 180
  );
}

function isLocationInBounds(
  location: VolunteerPostingLocation,
  bounds: VolunteerPostingMapBounds,
) {
  return (
    isValidCoordinate(location) &&
    location.latitude >= bounds.swLat &&
    location.latitude <= bounds.neLat &&
    location.longitude >= bounds.swLng &&
    location.longitude <= bounds.neLng
  );
}

export function getRepresentativeVolunteerPostingLocation(
  posting: VolunteerPostingMapItem,
  bounds: VolunteerPostingMapBounds,
) {
  return posting.locations
    .filter((location) => isLocationInBounds(location, bounds))
    .sort((left, right) => left.locationSeq - right.locationSeq)[0];
}
