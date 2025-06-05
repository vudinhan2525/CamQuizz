import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constant/colors';
import GroupService from '../../../services/GroupService';
import StudyGroupService from '../../../services/StudyGroupService';
const tmpURL = 'https://genk.mediacdn.vn/2018/9/6/baroibeo-15362268453481952312749.jpg';

const GroupMembers = ({ navigation, route }) => {
  const { group, isLeader } = route.params;

  // State management
  const [inviteEmail, setInviteEmail] = useState('');
  const [members, setMembers] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadMembersData();
  }, [group.id]);

  const loadMembersData = async () => {
    if (!group.id) {
      console.warn('No group ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(`Loading members for group ID: ${group.id}`);

      // Gọi API để lấy members
      await loadMembers();

    } catch (error) {
      console.error('Error loading members data:', error);
      Alert.alert(
        'Lỗi',
        'Không thể tải danh sách thành viên. Vui lòng thử lại.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };
  const handleRemoveMember = async (memberId) => {
    if (!isLeader) {
      Alert.alert('Thông báo', 'Chỉ trưởng nhóm mới có thể xóa thành viên');
      return;
    }
    try {
      Alert.alert(
        'Xác nhận',
        'Bạn có chắc chắn muốn xóa thành viên này khỏi nhóm?',
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Xóa',
            style: 'destructive',
            onPress: () => removeMember(memberId)
          }
        ]
      );
    } catch (error) {
      console.error('Error confirming member removal:', error);
      Alert.alert(
        'Lỗi',
        'Không thể xác nhận xóa thành viên. Vui lòng thử lại sau.',
        [{ text: 'OK' }]
      );
    }
  };
  const removeMember = async (memberId) => {
    try {
+      await StudyGroupService.removeMember(group.id, memberId, group.owner_id);
      Alert.alert('Thành công', 'Đã xóa thành viên khỏi nhóm');
      await loadMembersData();
    } catch (error) {
      console.error('Error removing member:', error);
      Alert.alert(
        'Lỗi',
        'Không thể xóa thành viên. Vui lòng thử lại sau.',
        [{ text: 'OK' }]
      );
    }
  };

  const loadMembers = async () => {
    try {
      console.log(`Fetching members for group ${group.id}`);

      // Gọi cả hai API song song
      const [membersResponse, pendingResponse] = await Promise.all([
        GroupService.getMembersByGroupId(group.id),
        GroupService.getPendingMembersByGroupId(group.id)
      ]);

      console.log('Members response:', membersResponse);
      console.log('Pending members response:', pendingResponse);

      // Xử lý dữ liệu approved members
      let membersData = [];
      if (membersResponse && membersResponse.data) {
        membersData = Array.isArray(membersResponse.data) ? membersResponse.data : [membersResponse.data];
      } else if (Array.isArray(membersResponse)) {
        membersData = membersResponse;
      }

      // Xử lý dữ liệu pending members
      let pendingData = [];
      if (pendingResponse && pendingResponse.data) {
        pendingData = Array.isArray(pendingResponse.data) ? pendingResponse.data : [pendingResponse.data];
      } else if (Array.isArray(pendingResponse)) {
        pendingData = pendingResponse;
      }
      console.log("owner", group.owner_id);
      // Transform approved members
      const transformedMembers = membersData.map((item, index) => ({
        id: item.userId || item.id || index.toString(),
        name: `${item.display_name}`.trim() ,
        email: item.email || 'No email',
        role: item.userId === group.ownerId ? 'Leader' : 'Member',
        status: item.status || 'Approved',
        joinedAt: item.joinedAt || new Date().toISOString(),
        avatar: item.avatar || tmpURL,
        isOwner: item.user_id === group.owner_id,
        user_id: item.user_id

      }));

      // Transform pending members
      const transformedPendingMembers = pendingData.map((item, index) => ({
        id: item.user_id || item.id || `pending_${index}`,
        name: `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.name || 'Unknown User',
        email: item.email || 'No email',
        role: 'Pending',
        status: 'Pending',
        joinedAt: item.joinedAt || new Date().toISOString(),
        avatar: item.avatar || tmpURL,
        isOwner: false,
        user_id: item.user_id
      }));

      setMembers(transformedMembers);
      setPendingMembers(transformedPendingMembers);

      console.log(`Loaded ${transformedMembers.length} approved members and ${transformedPendingMembers.length} pending members`);

    } catch (error) {
      console.error('Error loading members:', error);

      // Nếu lỗi 404 hoặc không có members, set empty array
      if (error.message.includes('not found') || error.message.includes('no members')) {
        setMembers([]);
        setPendingMembers([]);
        console.log('No members found for this group');
      } else {
        throw error; // Re-throw other errors
      }
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email để mời');
      return;
    }
    if(members.some(member => member.email === inviteEmail.trim())) {
      Alert.alert('Thông báo', 'Email này đã là thành viên của nhóm');
      return;
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      Alert.alert('Lỗi', 'Vui lòng nhập email hợp lệ');
      return;
    }

    try {
      setInviting(true);
      console.log(`Inviting ${inviteEmail} to group ${group.id}`);

      await GroupService.inviteMemberByEmail(group.id, inviteEmail);

      Alert.alert(
        'Thành công',
        `Đã gửi lời mời đến ${inviteEmail}`,
        [{ text: 'OK' }]
      );

      // Clear email input
      setInviteEmail('');

      // Reload members data to show new pending member
      await loadMembersData();

    } catch (error) {
      console.error('Error inviting member:', error);
      Alert.alert(
        'Thông báo',
        'Hệ thống không tồn tại tài khoản với email này',
        [{ text: 'OK' }]
      );
    } finally {
      setInviting(false);
    }
  };

  const renderPendingMember = ({ item }) => (
    <View style={styles.pendingMemberItem}>
      <Image
        style={styles.avatar}
        source={{ uri: item.avatar }}
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
        source={{ uri: item.avatar }}
      />
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberRole}>
          {item.isOwner ? 'Chủ nhóm' : 'Thành viên'}
        </Text>
        <Text style={styles.memberEmail}>{item.email}</Text>
        <Text style={styles.joinedDate}>
          Tham gia: {new Date(item.joinedAt).toLocaleDateString('vi-VN')}
        </Text>
      </View>
      {isLeader && !item.isOwner && (
        <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveMember(item.user_id)}>
          <Ionicons name="trash-outline" size={24} color={COLORS.RED} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmptyMembers = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color={COLORS.GRAY} />
      <Text style={styles.emptyTitle}>Chưa có thành viên nào</Text>
      <Text style={styles.emptySubtitle}>
        {isLeader
          ? 'Hãy mời thành viên đầu tiên vào nhóm!'
          : 'Nhóm này chưa có thành viên nào khác.'
        }
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.BLACK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{group.name}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.BLUE} />
          <Text style={styles.loadingText}>Đang tải danh sách thành viên...</Text>
        </View>
      </View>
    );
  }

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
            <TouchableOpacity
              style={[styles.inviteButton, inviting && styles.inviteButtonDisabled]}
              onPress={handleInvite}
              disabled={inviting}
            >
              <Text style={styles.inviteButtonText}>
                {inviting ? 'Đang mời...' : 'Mời'}
              </Text>
            </TouchableOpacity>
          </View>
          {pendingMembers.length > 0 && (
            <FlatList
              horizontal
              data={pendingMembers}
              renderItem={renderPendingMember}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.pendingList}
              showsHorizontalScrollIndicator={false}
            />
          )}
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
          contentContainerStyle={members.length === 0 ? styles.emptyContent : styles.membersList}
          ListEmptyComponent={renderEmptyMembers}
          showsVerticalScrollIndicator={false}
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
  inviteButtonDisabled: {
    backgroundColor: COLORS.GRAY,
    opacity: 0.6,
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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.GRAY,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  joinedDate: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginTop: 2,
  },
  noPendingText: {
    fontSize: 14,
    color: COLORS.GRAY,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
});

export default GroupMembers;