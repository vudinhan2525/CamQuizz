import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
import { Platform, StatusBar, StyleSheet, ActivityIndicator, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { AuthStackNavigator, UsersStackNavigation, AdminStackNavigation } from './src/navigation';
import COLORS from './src/constant/colors';
import { createStackNavigator } from "@react-navigation/stack";
import { enableScreens } from 'react-native-screens';
import { checkAuthStatus } from './src/services/AuthService';
import { useFocusEffect } from '@react-navigation/native';
import { HubConnectionProvider } from "./src/contexts/SignalRContext";
import Toast from 'react-native-toast-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Hàm kiểm tra trạng thái đăng nhập
  const checkLoginStatus = async () => {
    try {
      const userData = await checkAuthStatus();

      if (userData && userData.token) {
        console.log('User is logged in:', userData.roles);
        setUserToken(userData.token);

        // Kiểm tra roles một cách an toàn
        const roles = userData.roles || [];
        const isAdmin = Array.isArray(roles) && roles.includes('Admin');

        setUserRole(isAdmin ? 'Admin' : 'User');
        console.log('User role set to:', isAdmin ? 'Admin' : 'User');
      } else {
        console.log('No user logged in');
        setUserToken(null);
        setUserRole(null);
      }
    } catch (e) {
      console.error('Failed to load user token', e);
      setUserToken(null);
      setUserRole(null);
    } finally {
      setIsLoading(false);
      if (Platform.OS === 'android') {
        await SplashScreen.hideAsync();
      }
    }
  };

  // Kiểm tra khi ứng dụng khởi động
  useEffect(() => {
    checkLoginStatus();
  }, []);

  // Tạo một listener để kiểm tra trạng thái đăng nhập mỗi khi Root được focus
  const RootNavigator = () => {
    useFocusEffect(
      useCallback(() => {
        console.log('Root navigator focused, checking login status');
        checkLoginStatus();
        return () => { };
      }, [])
    );

    return (
      <HubConnectionProvider>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {userToken == null ? (
            // Không có token, hiển thị màn hình đăng nhập
            <Stack.Screen name="AuthStack" component={AuthStackNavigator} />
          ) : userRole === 'Admin' ? (
            // Có token và là Admin
            <Stack.Screen name="AdminStack" component={AdminStackNavigation} />
          ) : (
            // Có token và là User
            <Stack.Screen name="UserStack" component={UsersStackNavigation} />
          )}
        </Stack.Navigator>
      </HubConnectionProvider>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.BLUE} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={MyTheme}>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="Root"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Root" component={RootNavigator} />
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BG,
  },
});

export default App;
