import { CUSTOMER_BROADCAST_INTERVAL_MS } from '../config/corridorRoute.js';

const routeSubscribers = new Map();
const activeCustomersByRoute = new Map();
const activeBroadcasts = new Map();

function notifyRoute(routeId) {
  const callbacks = routeSubscribers.get(routeId) || [];
  const active = Array.from(activeCustomersByRoute.get(routeId)?.values() || []);
  callbacks.forEach((cb) => cb(active));
}

export function subscribeToRoute(routeId, callback) {
  const callbacks = routeSubscribers.get(routeId) || [];
  routeSubscribers.set(routeId, [...callbacks, callback]);

  callback(Array.from(activeCustomersByRoute.get(routeId)?.values() || []));

  return () => {
    const current = routeSubscribers.get(routeId) || [];
    routeSubscribers.set(
      routeId,
      current.filter((cb) => cb !== callback)
    );
  };
}

export function streamCustomerLocation({
  customerId,
  routeId,
  getLocationPayload
}) {
  stopCustomerTracking(customerId);

  const publish = () => {
    const payload = getLocationPayload();
    const routeMap = activeCustomersByRoute.get(routeId) || new Map();
    routeMap.set(customerId, {
      customerId,
      routeId,
      isTracking: true,
      location: {
        latitude: payload.latitude,
        longitude: payload.longitude,
        bearing: payload.bearing
      },
      initials: payload.initials,
      partySize: payload.partySize || 1
    });
    activeCustomersByRoute.set(routeId, routeMap);
    notifyRoute(routeId);
  };

  publish();

  const intervalId = setInterval(publish, CUSTOMER_BROADCAST_INTERVAL_MS);
  activeBroadcasts.set(customerId, { routeId, intervalId });

  return () => stopCustomerTracking(customerId);
}

export function stopCustomerTracking(customerId) {
  const active = activeBroadcasts.get(customerId);
  if (!active) return;

  clearInterval(active.intervalId);
  activeBroadcasts.delete(customerId);

  const routeMap = activeCustomersByRoute.get(active.routeId);
  if (routeMap) {
    routeMap.delete(customerId);
    activeCustomersByRoute.set(active.routeId, routeMap);
    notifyRoute(active.routeId);
  }
}

export function markPassengerBoarded(customerId) {
  stopCustomerTracking(customerId);
}

export function markPassengerMissed(customerId) {
  stopCustomerTracking(customerId);
}
