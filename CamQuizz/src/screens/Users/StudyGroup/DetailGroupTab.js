import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import COLORS from '../../../constant/colors';
import Tests from './Tests';
import Members from './Members';
import { useNavigationState } from '@react-navigation/native';
    
const Tab = createMaterialTopTabNavigator();

const DetailGroupTab = ({ group, isLeader }) => {

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.BLUE,
        tabBarInactiveTintColor: COLORS.GRAY,
        tabBarIndicatorStyle: { backgroundColor: COLORS.BLUE },
        tabBarStyle: { backgroundColor: COLORS.WHITE },
        lazy: true,
      }}
      initialRouteName="Tests"
    >
      <Tab.Screen 
        name="Tests" 
        options={{ title: 'Bài kiểm tra' }} 
        component={Tests} 
        initialParams={{ groupId: group.id }}
      />
      <Tab.Screen 
        name="Members" 
        options={{ title: 'Thành viên' }} 
        component={Members} 
        initialParams={{ groupId: group.id, isLeader }}
      />
    </Tab.Navigator>
  );
};

export default DetailGroupTab;
