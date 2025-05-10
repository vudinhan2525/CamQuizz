import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import COLORS from '../../../constant/colors';

const Tests = ({ route }) => {

  const { groupId } = route.params;

  // Fetch or use group data based on groupId
  // For now, using sample data
  const group = {
    id: groupId,
    tests: [
      { name: 'Bài kiểm tra 1', completed: 3 },
      { name: 'Bài kiểm tra 2', completed: 5 },
    ],
    memberCount: 30,
  };

  return (
    <ScrollView style={styles.container}>
      {group.tests.map((test, index) => (
        <View key={index} style={styles.testItem}>
          <Text style={styles.testName}>{test.name}</Text>
          <Text style={styles.testStatus}>
            {test.completed}/{group.memberCount} đã làm
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.WHITE,
  },
  testItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  testStatus: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
  },
});

export default Tests;