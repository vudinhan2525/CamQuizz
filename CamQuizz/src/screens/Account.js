import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import ProfileSection from '../components/Account/ProfileSection';
import Toast from 'react-native-toast-message';
import COLORS from '../constant/colors';

export const Account = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      <View style={styles.header} />
      <ProfileSection />
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
});
