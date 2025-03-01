import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons
    from 'react-native-vector-icons/MaterialCommunityIcons';
import SCREENS from '../screens';
import { Library } from '../screens/Users/Library';
import { Report } from '../screens/Users/Report';
import { Explore } from '../screens/Users/Explore'
import { Account } from '../screens/Account'
import { StudyGroup } from '../screens/Users/StudyGroup'
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function UsersStackNavigation() {
    console.log('UsersStackNavigation')
    return (
        <Stack.Navigator initialRouteName={SCREENS.EXPLORE}>
            <Stack.Screen
                name={SCREENS.EXPLORE}
                component={UserTabNavigator}
                options={{ headerShown: false }} />
            <Stack.Screen
                name={SCREENS.REPORT}
                component={UserTabNavigator}
                options={{ headerShown: false }} />
            <Stack.Screen
                name={SCREENS.LIBRARY}
                component={UserTabNavigator}
                options={{ headerShown: false }} />
            <Stack.Screen
                name={SCREENS.ACCOUNT}
                component={UserTabNavigator}
                options={{ headerShown: false }} />
            <Stack.Screen
                name={SCREENS.STUDYGROUP}
                component={UserTabNavigator}
                options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}

const UserTabNavigator = () => {
    console.log('UserTabNavigator')
    const { colors } = useTheme();
    return (
        <Tab.Navigator
            initialRouteName={SCREENS.EXPLORE}
            screenOptions={{
                tabBarActiveTintColor: colors.BLUE,
                tabBarInactiveTintColor: colors.BLACK,
            }}
        >
            <Tab.Screen
                name={SCREENS.EXPLORE}
                component={Explore}
                options={{
                    title: 'Khám phá',
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name={SCREENS.LIBRARY}
                component={Library}
                options={{
                    title: 'Thư viện',
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons name={focused ? 'library' : 'library-outline'} size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name={SCREENS.REPORT}
                component={Report}
                options={{
                    title: 'Báo cáo',
                    tabBarIcon: ({ color, size }) => (
                        <Entypo name="line-graph" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name={SCREENS.STUDYGROUP}
                component={StudyGroup}
                options={{
                    title: 'Nhóm học tập',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="account-group-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name={SCREENS.ACCOUNT}
                component={Account}
                options={{
                    title: 'Tài khoản',
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default UsersStackNavigation;