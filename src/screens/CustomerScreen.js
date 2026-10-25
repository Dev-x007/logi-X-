import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import {
  DEFAULT_PROXIMITY_THRESHOLD_METERS,
  FIXED_CORRIDOR_POLYLINE,
  ROUTE_ID
} from '../config/corridorRoute.js';
import { isWithinCorridor } from '../engine/corridorEngine.js';
import { streamCustomerLocation } from '../services/realtimeStore.js';

const customerProfile = {
  customerId: 'customer-1',
  initials: 'DX',
  partySize: 1
};

const mockedCustomerLocation = {
  latitude: 40.7458,
  longitude: -73.9852,
  bearing: 72
};

export function CustomerScreen() {
  const [isBroadcasting, setBroadcasting] = useState(false);
  const [stopper, setStopper] = useState(null);

  const nearCorridor = useMemo(
    () =>
      isWithinCorridor(
        mockedCustomerLocation,
        FIXED_CORRIDOR_POLYLINE,
        DEFAULT_PROXIMITY_THRESHOLD_METERS
      ),
    []
  );

  const toggleBroadcast = () => {
    if (isBroadcasting) {
      stopper?.();
      setStopper(null);
      setBroadcasting(false);
      return;
    }

    const stop = streamCustomerLocation({
      customerId: customerProfile.customerId,
      routeId: ROUTE_ID,
      getLocationPayload: () => ({
        ...mockedCustomerLocation,
        initials: customerProfile.initials,
        partySize: customerProfile.partySize
      })
    });

    setStopper(() => stop);
    setBroadcasting(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          🟢 Broadcasting location to drivers along this route
        </Text>
      </View>

      <View style={styles.mapPane}>
        <Text style={styles.heading}>Route Viewer Map</Text>
        <Text style={styles.detail}>Fixed line and live driver marker shown here.</Text>
        <View style={styles.pulsingRingOuter}>
          <View style={styles.pulsingRingInner} />
        </View>
        <Text style={styles.detail}>
          You are {nearCorridor ? 'inside' : 'outside'} the {DEFAULT_PROXIMITY_THRESHOLD_METERS}m corridor zone.
        </Text>
      </View>

      <View style={styles.bottomSheet}>
        <Text style={styles.sheetTitle}>Live Status</Text>
        <Text style={styles.sheetText}>Driver: Jordan Hale</Text>
        <Text style={styles.sheetText}>Vehicle: Toyota Hiace</Text>
        <Text style={styles.sheetText}>Plate: KTR-984A</Text>
        <Pressable style={styles.broadcastButton} onPress={toggleBroadcast}>
          <Text style={styles.buttonText}>{isBroadcasting ? 'Stop sharing' : 'Start sharing'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  statusBar: {
    backgroundColor: '#DCFCE7',
    margin: 16,
    padding: 12,
    borderRadius: 12
  },
  statusText: {
    color: '#166534',
    fontWeight: '600'
  },
  mapPane: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A'
  },
  detail: {
    marginTop: 8,
    color: '#475569',
    textAlign: 'center'
  },
  pulsingRingOuter: {
    marginTop: 18,
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)'
  },
  pulsingRingInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#10B981'
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    gap: 4
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A'
  },
  sheetText: {
    color: '#334155'
  },
  broadcastButton: {
    marginTop: 12,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center'
  },
  buttonText: {
    color: '#EFF6FF',
    fontWeight: '700'
  }
});
