import React, { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { CustomerScreen } from './src/screens/CustomerScreen.js';
import { DriverScreen } from './src/screens/DriverScreen.js';

export default function App() {
  const [role, setRole] = useState('customer');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.roleSwitcher}>
        <Pressable
          style={[styles.roleButton, role === 'customer' && styles.activeRoleButton]}
          onPress={() => setRole('customer')}
        >
          <Text style={styles.roleText}>Customer UI</Text>
        </Pressable>
        <Pressable
          style={[styles.roleButton, role === 'driver' && styles.activeRoleButton]}
          onPress={() => setRole('driver')}
        >
          <Text style={styles.roleText}>Driver UI</Text>
        </Pressable>
      </View>
      <View style={styles.screenHost}>{role === 'customer' ? <CustomerScreen /> : <DriverScreen />}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1120'
  },
  roleSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    padding: 8,
    gap: 8
  },
  roleButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 10,
    alignItems: 'center'
  },
  activeRoleButton: {
    backgroundColor: '#1D4ED8'
  },
  roleText: {
    color: '#E2E8F0',
    fontWeight: '700'
  },
  screenHost: {
    flex: 1
  }
});
