import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import UsersStackNavigation from './src/navigation';
import COLORS from './src/constant/colors';
import { createStackNavigator } from "@react-navigation/stack";
import { enableScreens } from 'react-native-screens';
enableScreens();

SplashScreen.preventAutoHideAsync();
const Stack = createStackNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.BG,
  },
};

const App = () => {
  useEffect(() => {
    const hideSplash = async () => {
      if (Platform.OS === 'android') {
        await SplashScreen.hideAsync();
      }
    };
    hideSplash();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.BG} />
      <NavigationContainer theme={MyTheme}>
        <UsersStackNavigation />
      </NavigationContainer>
    </SafeAreaView>


  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },
});

export default App;
