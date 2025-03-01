import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {Platform} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import UsersStackNavigation from './src/navigation';
import COLORS from './src/constant/colors';
import { enableScreens } from 'react-native-screens';
import { View,Text } from 'react-native';
enableScreens();
const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.BG,
  },
};

const App = () => {
  console.log('App');
  useEffect(() => {
    if (Platform.OS === 'android') SplashScreen.hide();
  }, []);

  return (
    <NavigationContainer theme={MyTheme}>
      <UsersStackNavigation />
    </NavigationContainer>

  );
};

export default App;