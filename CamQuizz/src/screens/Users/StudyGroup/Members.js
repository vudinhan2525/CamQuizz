import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constant/colors';
import { useEffect } from 'react';
const Members = ({ route }) => {
  useEffect(() => {
    console.log('Members mounted', route.params);
  }, [route.params]);
  const { groupId, isLeader } = route.params;

  // Fetch or use group data based on groupId
  // For now, using sample data
  const group = {
    id: groupId,
    members: [
      { id: '1', name: 'Nguyễn Văn A' },
      { id: '2', name: 'Trần Thị B' },
      { id: '3', name: 'Lê Văn C' },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      {group.members.map((member, index) => (
        <View key={index} style={styles.memberItem}>
          <Text style={styles.memberName}>{member.name}</Text>
          {isLeader && (
            <View style={styles.memberActions}>
              <TouchableOpacity onPress={() => console.log(`Remove member ${member.id}`)}>
                <Ionicons name="remove-circle" size={24} color={COLORS.RED} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => console.log(`Cancel invite for ${member.id}`)}>
                <Ionicons name="close-circle" size={24} color={COLORS.GRAY} />
              </TouchableOpacity>
            </View>
          )}
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
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
  },
  memberName: {
    fontSize: 16,
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
});

export default Members;