import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../../constant/colors';

export const PackageManagement = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý gói / doanh thu</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BG,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
});