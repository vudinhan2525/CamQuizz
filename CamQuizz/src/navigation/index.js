import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import { useIsKeyboardVisible } from '../hooks/useIsKeyboardVisible';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SCREENS from '../screens';
import { Library } from '../screens/Users/Library';
import { Report } from '../screens/Users/Report';
import { Explore } from '../screens/Users/Explore/Explore';
import { Account } from '../screens/Account';
import { StudyGroup } from '../screens/Users/StudyGroup';
import { ExploreSearch } from '../screens/Users/Explore/ExploreSearch';
import { FlashcardSetDetail } from '../screens/Users/FlashCard/FlashcardSetDetail';
import FlashCardPage from '../screens/Users/FlashCard/FlashCardPage';
import SharedQuizz from '../screens/Users/Library/SharedQuizz';
import { ReportDetail } from '../components/Report/ReportDetail';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function UsersStackNavigation() {
    return (
        <Stack.Navigator initialRouteName={SCREENS.USER_TAB}>
            <Stack.Screen
                name={SCREENS.USER_TAB}
                component={UserTabNavigator}
                options={{ headerShown: false }}
            />

            
             
        </Stack.Navigator>
    );
}

function ExploreStack() {
    return (
        <Stack.Navigator initialRouteName={SCREENS.EXPLORE}>
            <Stack.Screen
                name={SCREENS.EXPLORE}
                component={Explore}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.EXPLORE_SEARCH}
                component={ExploreSearch}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}

function LibraryStack() {
    return (
        <Stack.Navigator initialRouteName={SCREENS.LIBRARY}>
            <Stack.Screen
                name={SCREENS.LIBRARY}
                component={Library}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.FlashCardPage}
                component={FlashCardPage}
                options={{ title: 'Thẻ học bài' }}
            />
            <Stack.Screen   
            name={SCREENS.SharedQuizz}
            component={SharedQuizz}
            options={{ title: 'Được chia sẻ' }}
            />
            <Stack.Screen
                name={SCREENS.FLASHCARD_SET_DETAIL}
                component={FlashcardSetDetail}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}

function ReportStack() {
    return (
        <Stack.Navigator initialRouteName={SCREENS.REPORT}>
            <Stack.Screen
                name={SCREENS.REPORT}
                component={Report}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="ReportDetail"
                component={ReportDetail}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}

const UserTabNavigator = () => {
    const { colors } = useTheme();
    const isKeyboardVisible = useIsKeyboardVisible();
    return (
        <Tab.Navigator
            initialRouteName={SCREENS.EXPLORE_TAB}
            screenOptions={{
                tabBarActiveTintColor: colors.BLUE,
                tabBarInactiveTintColor: colors.BLACK,
                tabBarStyle: {
                    display: isKeyboardVisible ? 'none' : 'flex',
                },
            }}
        >
            <Tab.Screen
                name={SCREENS.EXPLORE_TAB}
                component={ExploreStack}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
                    ),
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name={SCREENS.LIBRARY}
                component={LibraryStack}
                options={{
                   
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons name={focused ? 'library' : 'library-outline'} size={size} color={color} />
                    ),
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name={SCREENS.REPORT}
                component={ReportStack}
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