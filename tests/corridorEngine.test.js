import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getNextCheckpoint,
  isWithinCorridor,
  mapActiveCheckpoints
} from '../src/engine/corridorEngine.js';

const polyline = [
  { latitude: 40.0, longitude: -74.0 },
  { latitude: 40.0, longitude: -73.99 },
  { latitude: 40.0, longitude: -73.98 }
];

test('isWithinCorridor returns true when point is near route', () => {
  const nearPoint = { latitude: 40.00015, longitude: -73.995 };
  assert.equal(isWithinCorridor(nearPoint, polyline, 50), true);
});

test('mapActiveCheckpoints only keeps actively tracked and near-corridor customers', () => {
  const customers = [
    {
      customerId: 'a',
      isTracking: true,
      initials: 'AA',
      partySize: 1,
      location: { latitude: 40.00015, longitude: -73.995 }
    },
    {
      customerId: 'b',
      isTracking: false,
      initials: 'BB',
      partySize: 2,
      location: { latitude: 40.0, longitude: -73.992 }
    },
    {
      customerId: 'c',
      isTracking: true,
      initials: 'CC',
      partySize: 1,
      location: { latitude: 40.01, longitude: -73.995 }
    }
  ];

  const checkpoints = mapActiveCheckpoints({
    customers,
    polyline,
    thresholdMeters: 50
  });

  assert.equal(checkpoints.length, 1);
  assert.equal(checkpoints[0].customerId, 'a');
});

test('getNextCheckpoint returns the nearest checkpoint to driver', () => {
  const checkpoints = [
    {
      customerId: 'near',
      location: { latitude: 40.0, longitude: -73.999 }
    },
    {
      customerId: 'far',
      location: { latitude: 40.0, longitude: -73.985 }
    }
  ];

  const next = getNextCheckpoint({
    driverLocation: { latitude: 40.0, longitude: -74.0 },
    checkpoints
  });

  assert.equal(next.customerId, 'near');
  assert.ok(next.distanceFromDriverMeters > 0);
});
