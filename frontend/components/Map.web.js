import React from 'react';
import { View, Text } from 'react-native';

const MapView = ({ children, style }) => (
  <View style={[style, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0', borderWidth: 1, borderColor: '#cbd5e1' }]}>
    <Text style={{ color: '#475569', fontWeight: 'bold' }}>Map view is not supported on Web</Text>
    <Text style={{ color: '#64748B', fontSize: 12, marginTop: 4 }}>Please use an iOS or Android device/simulator</Text>
  </View>
);

const Circle = () => null;
const Marker = () => null;

export { MapView as default, Circle, Marker };
