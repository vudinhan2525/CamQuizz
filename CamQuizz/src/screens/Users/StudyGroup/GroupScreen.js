// GroupScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constant/colors';
import DetailGroupTab from './DetailGroupTab';

const sampleGroupData = {
  id: '1',
  name: 'Nhóm học Toán 12A1',
  memberCount: 30,
  tests: [
    { name: 'Bài kiểm tra 1', completed: 3 },
    { name: 'Bài kiểm tra 2', completed: 5 },
  ],
  members: [
    { id: '1', name: 'Nguyễn Văn A' },
    { id: '2', name: 'Trần Thị B' },
    { id: '3', name: 'Lê Văn C' },
  ],
};



const GroupScreen = ({ navigation }) => {
  const group = sampleGroupData;
  const isLeader = true;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.BLACK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{group.name}</Text>
      </View>
      <DetailGroupTab group={group} isLeader={isLeader} />
    </View>
  );
};

export default GroupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    color: COLORS.BLACK,
  },
});