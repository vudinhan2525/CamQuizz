import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import COLORS from '../constant/colors';
import { useIsKeyboardVisible } from '../hooks/useIsKeyboardVisible';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SCREENS from '../screens';
import { Library } from '../screens/Users/Library';
import { Report } from '../screens/Users/Report';
import { Explore } from '../screens/Users/Explore/Explore';
import { Account } from '../screens/Account';
import { StudyGroup } from '../screens/Users/StudyGroup/StudyGroup';
import { ExploreSearch } from '../screens/Users/Explore/ExploreSearch';
import QuizCreation from '../screens/Users/Quiz/QuizCreation';
import CreateQuestion from '../screens/Users/Quiz/CreateQuestion';
import { FlashcardSetDetail } from '../screens/Users/FlashCard/FlashcardSetDetail';
import { CreateStudyGroup } from '../screens/Users/StudyGroup/CreateStudyGroup';
import GroupScreen from '../screens/Users/StudyGroup/GroupScreen';
import  GroupMembers from '../screens/Users/StudyGroup/GroupMembers';
import  GroupMessage  from '../screens/Users/StudyGroup/GroupMessage';
import FlashCardPage from '../screens/Users/FlashCard/FlashCardPage';
import SharedQuizz from '../screens/Users/Library/SharedQuizz';
import { ReportDetail } from '../components/Report/ReportDetail';
import FlashcardStudy from '../screens/Users/FlashCard/FlashCardStudy';
import Lobby from '../screens/Users/QuizPlay/Lobby';
import QuestionPlay from '../screens/Users/QuizPlay/QuestionPlay';
import EndQuiz from '../screens/Users/QuizPlay/EndQuiz';
import QuizReport from '../screens/Users/QuizPlay/QuizReport';
import QuizDetail from '../screens/Users/QuizPlay/QuizDetail';

import QuestionPlaySetting from '../screens/Users/QuizPlay/QuestionPlaySetting';
import Ranking from '../screens/Users/QuizPlay/Ranking';

import { QuizzManagement } from '../screens/Admin/QuizzManagement';
import { PackageManagement } from '../screens/Admin/PackageManagement';
import { UserManagement } from '../screens/Admin/UserManagement';
import { AdminAccount } from '../screens/Admin/AdminAccount';

import { Login } from '../screens/Auth/Login';
import { Signup } from '../screens/Auth/Signup';
import SelectQuizForFlashcard from '../screens/Users/FlashCard/SelectQuizForFlashcard';
import SelectQuestionsForFlashcard from '../screens/Users/FlashCard/SelectQuestionsForFlashcard';
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


// Auth Stack
function AuthStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={SCREENS.LOGIN}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name={SCREENS.LOGIN} component={Login} />
      <Stack.Screen name={SCREENS.SIGNUP} component={Signup} />
    </Stack.Navigator>
  );
}


function UsersStackNavigation() {
    return (
        <Stack.Navigator initialRouteName={SCREENS.USER_TAB}>
            <Stack.Screen
                name={SCREENS.USER_TAB}
                component={UserTabNavigator}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.QUIZ_CREATION}
                component={QuizCreation}
                options={{headerShown:false}}/>
            <Stack.Screen 
                name={SCREENS.QUESTION_SETTING} 
                component={CreateQuestion}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.SELECT_QUIZ_FOR_FLASHCARD}
                component={SelectQuizForFlashcard}
            />
            <Stack.Screen
                name={SCREENS.SELECT_QUESTIONS_FOR_FLASHCARD}
                component={SelectQuestionsForFlashcard}
            />
            <Stack.Screen
                name={SCREENS.FLASHCARD_SET_DETAIL}
                component={FlashcardSetDetail}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.FLASHCARD_STUDY}
                component={FlashcardStudy}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.CREATE_STUDY_GROUP}
                component={CreateStudyGroup}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.STUDY_GROUP_DETAIL}
                component={GroupScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.GROUP_MEMBERS}
                component={GroupMembers}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.GROUP_MESSAGE}
                component={GroupMessage}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.QUIZ_DETAIL}
                component={QuizDetail}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.LOBBY}
                component={Lobby}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.QUESTION_PLAY}
                component={QuestionPlay}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.ENDQUIZ}
                component={EndQuiz}
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name={SCREENS.QUIZ_REPORT}
                component={QuizReport}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.RANKING}
                component={Ranking}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.QUESTION_PLAY_SETTING}
                component={QuestionPlaySetting}
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
                    headerShown: false,
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

function AdminTabNavigator() {
    const { colors } = useTheme();
    const isKeyboardVisible = useIsKeyboardVisible();
    return (
        <Tab.Navigator
            initialRouteName={SCREENS.ADMIN_QUIZZES}
            screenOptions={{
                tabBarActiveTintColor: colors.BLUE,
                tabBarInactiveTintColor: colors.BLACK,
                tabBarStyle: {
                    display: isKeyboardVisible ? 'none' : 'flex',
                },
                headerStyle: {
                    backgroundColor: COLORS.BLUE,
                },
                headerTintColor: COLORS.WHITE,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerShown: true, 
            }}
        >
            <Tab.Screen
                name={SCREENS.ADMIN_QUIZZES}
                component={QuizzManagement}
                options={{
                    title: 'Quản lý quizz',
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons name={focused ? 'list' : 'list-outline'} size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name={SCREENS.ADMIN_PACKAGES}
                component={PackageManagement}
                options={{
                    title: 'Quản lý gói',
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons name={focused ? 'cash' : 'cash-outline'} size={size} color={color} />
                    ),
                    // headerShown đã được đặt thành true trong screenOptions
                }}
            />
            <Tab.Screen
                name={SCREENS.ADMIN_USERS}
                component={UserManagement}
                options={{
                    title: 'Quản lý người dùng',
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons name={focused ? 'people' : 'people-outline'} size={size} color={color} />
                    ),
                    // headerShown đã được đặt thành true trong screenOptions
                }}
            />
            <Tab.Screen
                name={SCREENS.ADMIN_ACCOUNT}
                component={AdminAccount}
                options={{
                    title: 'Tài khoản',
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
                    ),
                    // headerShown đã được đặt thành true trong screenOptions
                }}
            />
        </Tab.Navigator>
    );
}


function AdminStackNavigation() {
    return (
        <Stack.Navigator initialRouteName={SCREENS.ADMIN_TAB}>
            <Stack.Screen
                name={SCREENS.ADMIN_TAB}
                component={AdminTabNavigator}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}


export { AuthStackNavigator, UsersStackNavigation, AdminStackNavigation };
