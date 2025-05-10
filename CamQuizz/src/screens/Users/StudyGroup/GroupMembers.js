import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constant/colors';
const tmpURL = 'https://genk.mediacdn.vn/2018/9/6/baroibeo-15362268453481952312749.jpg';
const GroupMembers = ({ navigation, route }) => {
  const { group, isLeader } = route.params;
  const [inviteEmail, setInviteEmail] = useState('');

  const pendingMembers = [
    { id: '1', name: 'Pending User 1', email: 'user1@example.com' },
    { id: '2', name: 'Pending User 2', email: 'user2@example.com' },
  ];
  const members = [
    { id: '1', name: 'User 1', role: 'Leader' },
    { id: '2', name: 'User 2', role: 'Member' },
    { id: '3', name: 'User 3', role: 'Member' },
  ];
  const renderPendingMember = ({ item }) => (
    <View style={styles.pendingMemberItem}>
      <Image
        style={styles.avatar}
        source={{ uri: tmpURL }}
      />
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberEmail}>{item.email}</Text>
      </View>
      {isLeader && (
        <TouchableOpacity style={styles.cancelButton}>
          <Ionicons name="close" size={24} color={COLORS.RED} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderMember = ({ item }) => (
    <View style={styles.memberItem}>
      <Image
        style={styles.avatar}
        source={{ uri: tmpURL }}
      />
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberRole}>
          {item.id === '1' ? 'Chủ nhóm' : 'Thành viên'}
        </Text>
      </View>
      {isLeader && item.id !== '1' && (
        <TouchableOpacity style={styles.removeButton}>
          <Ionicons name="trash-outline" size={24} color={COLORS.RED} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.BLACK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{group.name}</Text>
      </View>

      {isLeader && (
        <View style={styles.inviteSection}>
          <Text style={styles.sectionTitle}>
            Thành viên đã mời ({pendingMembers.length})
          </Text>
          <View style={styles.inviteInput}>
            <TextInput
              style={styles.input}
              value={inviteEmail}
              onChangeText={setInviteEmail}
              placeholder="Nhập email để mời"
            />
            <TouchableOpacity style={styles.inviteButton}>
              <Text style={styles.inviteButtonText}>Mời</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={pendingMembers}
            renderItem={renderPendingMember}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.pendingList}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      <View style={styles.membersSection}>
        <Text style={styles.sectionTitle}>
          Danh sách thành viên ({members.length})
        </Text>
        <FlatList
          data={members}
          renderItem={renderMember}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.membersList}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    color: COLORS.BLACK,
  },
  inviteSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  inviteInput: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  inviteButton: {
    backgroundColor: COLORS.BLUE,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  inviteButtonText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  pendingList: {
    paddingVertical: 8,
  },
  pendingMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
    width: 200,
    borderWidth: 1,
    borderColor: COLORS.GRAY_BG,
  },
  membersSection: {
    flex: 1,
    padding: 16,
  },
  membersList: {
    paddingVertical: 8,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.GRAY_BG,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberEmail: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
  },
  memberRole: {
    fontSize: 14,
    color: COLORS.BLUE,
  },
  cancelButton: {
    padding: 4,
  },
  removeButton: {
    padding: 4,
  },
});

export default GroupMembers;