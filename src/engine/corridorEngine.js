const EARTH_RADIUS_METERS = 6371000;

const toRadians = (value) => (value * Math.PI) / 180;

export function haversineDistanceMeters(a, b) {
  const lat1 = toRadians(a.latitude);
  const lon1 = toRadians(a.longitude);
  const lat2 = toRadians(b.latitude);
  const lon2 = toRadians(b.longitude);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function projectToMeters(point, anchor) {
  const latRad = toRadians(point.latitude);
  const lonRad = toRadians(point.longitude);
  const anchorLatRad = toRadians(anchor.latitude);
  const anchorLonRad = toRadians(anchor.longitude);

  return {
    x: (lonRad - anchorLonRad) * Math.cos(anchorLatRad) * EARTH_RADIUS_METERS,
    y: (latRad - anchorLatRad) * EARTH_RADIUS_METERS
  };
}

function pointToSegmentDistanceMeters(point, segmentStart, segmentEnd) {
  const anchor = segmentStart;
  const p = projectToMeters(point, anchor);
  const a = { x: 0, y: 0 };
  const b = projectToMeters(segmentEnd, anchor);

  const abX = b.x - a.x;
  const abY = b.y - a.y;
  const abSquared = abX * abX + abY * abY;

  if (abSquared === 0) {
    return Math.hypot(p.x - a.x, p.y - a.y);
  }

  const apX = p.x - a.x;
  const apY = p.y - a.y;
  const t = Math.max(0, Math.min(1, (apX * abX + apY * abY) / abSquared));

  const closestX = a.x + t * abX;
  const closestY = a.y + t * abY;

  return Math.hypot(p.x - closestX, p.y - closestY);
}

function cumulativeSegmentLengths(polyline) {
  const totals = [0];
  for (let i = 1; i < polyline.length; i += 1) {
    totals[i] = totals[i - 1] + haversineDistanceMeters(polyline[i - 1], polyline[i]);
  }
  return totals;
}

function distanceAlongPolyline(point, polyline) {
  if (polyline.length < 2) return 0;

  const segmentStarts = cumulativeSegmentLengths(polyline);
  let best = { distanceToSegment: Number.POSITIVE_INFINITY, along: 0 };

  for (let i = 0; i < polyline.length - 1; i += 1) {
    const start = polyline[i];
    const end = polyline[i + 1];

    const anchor = start;
    const p = projectToMeters(point, anchor);
    const b = projectToMeters(end, anchor);

    const abX = b.x;
    const abY = b.y;
    const abSquared = abX * abX + abY * abY;
    const t = abSquared === 0 ? 0 : Math.max(0, Math.min(1, (p.x * abX + p.y * abY) / abSquared));

    const closestX = t * abX;
    const closestY = t * abY;
    const distanceToSegment = Math.hypot(p.x - closestX, p.y - closestY);

    if (distanceToSegment < best.distanceToSegment) {
      const segmentLength = haversineDistanceMeters(start, end);
      best = {
        distanceToSegment,
        along: segmentStarts[i] + segmentLength * t
      };
    }
  }

  return best.along;
}

export function isWithinCorridor(point, polyline, thresholdMeters) {
  if (!point || polyline.length < 2) return false;

  let minDistance = Number.POSITIVE_INFINITY;
  for (let i = 0; i < polyline.length - 1; i += 1) {
    const distance = pointToSegmentDistanceMeters(point, polyline[i], polyline[i + 1]);
    minDistance = Math.min(minDistance, distance);
  }

  return minDistance <= thresholdMeters;
}

export function mapActiveCheckpoints({ customers, polyline, thresholdMeters }) {
  return customers
    .filter((customer) => customer.isTracking)
    .filter((customer) => isWithinCorridor(customer.location, polyline, thresholdMeters))
    .map((customer) => ({
      ...customer,
      routeProgressMeters: distanceAlongPolyline(customer.location, polyline)
    }))
    .sort((a, b) => a.routeProgressMeters - b.routeProgressMeters);
}

export function getNextCheckpoint({ driverLocation, checkpoints }) {
  if (!checkpoints.length) {
    return null;
  }

  return checkpoints
    .map((checkpoint) => ({
      ...checkpoint,
      distanceFromDriverMeters: haversineDistanceMeters(driverLocation, checkpoint.location)
    }))
    .sort((a, b) => a.distanceFromDriverMeters - b.distanceFromDriverMeters)[0];
}
