import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import {
  DEFAULT_PROXIMITY_THRESHOLD_METERS,
  FIXED_CORRIDOR_POLYLINE,
  ROUTE_ID
} from '../config/corridorRoute.js';
import { getNextCheckpoint, mapActiveCheckpoints } from '../engine/corridorEngine.js';
import {
  markPassengerBoarded,
  markPassengerMissed,
  subscribeToRoute
} from '../services/realtimeStore.js';

const mockedDriverLocation = {
  latitude: 40.7435,
  longitude: -73.9878,
  bearing: 63
};

export function DriverScreen() {
  const [activeCustomers, setActiveCustomers] = useState([]);

  useEffect(() => subscribeToRoute(ROUTE_ID, setActiveCustomers), []);

  const checkpoints = useMemo(
    () =>
      mapActiveCheckpoints({
        customers: activeCustomers,
        polyline: FIXED_CORRIDOR_POLYLINE,
        thresholdMeters: DEFAULT_PROXIMITY_THRESHOLD_METERS
      }),
    [activeCustomers]
  );

  const nextCheckpoint = useMemo(
    () => getNextCheckpoint({ driverLocation: mockedDriverLocation, checkpoints }),
    [checkpoints]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.telemetry}>
        <Text style={styles.telemetryLabel}>NEXT CHECKPOINT</Text>
        <Text style={styles.telemetryValue}>
          {nextCheckpoint ? `${Math.round(nextCheckpoint.distanceFromDriverMeters)}m` : '--'}
        </Text>
        <Text style={styles.telemetryEta}>
          ETA {nextCheckpoint ? `${Math.max(1, Math.round(nextCheckpoint.distanceFromDriverMeters / 120))} min` : '--'}
        </Text>
      </View>

      <View style={styles.mapPane}>
        <Text style={styles.mapTitle}>Corridor Navigation Layer (70%)</Text>
        {checkpoints.length === 0 ? (
          <Text style={styles.emptyText}>No active passengers on corridor.</Text>
        ) : (
          checkpoints.map((checkpoint) => (
            <View key={checkpoint.customerId} style={styles.checkpointChip}>
              <Text style={styles.checkpointText}>
                {checkpoint.initials} • party {checkpoint.partySize}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.controlSheet}>
        <Text style={styles.controlTitle}>Sequential Boarding</Text>
        <Text style={styles.controlMeta}>
          {nextCheckpoint ? `Serving ${nextCheckpoint.initials}` : 'No pending checkpoint'}
        </Text>
        <View style={styles.controlsRow}>
          <Pressable
            disabled={!nextCheckpoint}
            onPress={() => nextCheckpoint && markPassengerBoarded(nextCheckpoint.customerId)}
            style={[styles.actionButton, styles.boardedButton, !nextCheckpoint && styles.disabledButton]}
          >
            <Text style={styles.actionText}>Boarded</Text>
          </Pressable>
          <Pressable
            disabled={!nextCheckpoint}
            onPress={() => nextCheckpoint && markPassengerMissed(nextCheckpoint.customerId)}
            style={[styles.actionButton, styles.missedButton, !nextCheckpoint && styles.disabledButton]}
          >
            <Text style={styles.actionText}>Missed</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617'
  },
  telemetry: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#0F172A'
  },
  telemetryLabel: {
    color: '#22D3EE',
    fontWeight: '700',
    letterSpacing: 1
  },
  telemetryValue: {
    marginTop: 8,
    color: '#F97316',
    fontSize: 42,
    fontWeight: '800'
  },
  telemetryEta: {
    color: '#E2E8F0',
    fontSize: 18,
    fontWeight: '600'
  },
  mapPane: {
    flex: 0.7,
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#155E75',
    backgroundColor: '#082F49',
    padding: 16
  },
  mapTitle: {
    color: '#CFFAFE',
    fontWeight: '700',
    marginBottom: 8
  },
  emptyText: {
    color: '#E2E8F0'
  },
  checkpointChip: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: '#164E63',
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 8
  },
  checkpointText: {
    color: '#ECFEFF',
    fontWeight: '700'
  },
  controlSheet: {
    marginTop: 12,
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 20
  },
  controlTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700'
  },
  controlMeta: {
    color: '#94A3B8',
    marginTop: 4,
    marginBottom: 10
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 10
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  boardedButton: {
    backgroundColor: '#0E7490'
  },
  missedButton: {
    backgroundColor: '#9A3412'
  },
  disabledButton: {
    opacity: 0.5
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '700'
  }
});
