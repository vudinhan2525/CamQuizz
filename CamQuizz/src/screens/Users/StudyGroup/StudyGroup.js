import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Switch, Image, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import { Ionicons } from '@expo/vector-icons';
import { StudyGroupCard } from '../../../components/StudyGroupCard';
import COLORS from '../../../constant/colors';
import SCREENS from '../../../screens/index';
import AsyncStorageService from '../../../services/AsyncStorageService';
import StudyGroupService from '../../../services/StudyGroupService';
import Toast from 'react-native-toast-message';
export const StudyGroup = ({ navigation, route }) => {
  const [selectedGroupState, setSelectedGroupState] = useState('Active');
  const [selectedOwnership, setSelectedOwnership] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editedGroupName, setEditedGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const groupState = [
    { label: 'Đang hoạt động', value: 'Active' },
    { label: 'Đã lưu trữ', value: 'OnHold' },
  ];

  const ownershipState = [
    { label: 'Vai trò thành viên', value: false },
    { label: 'Vai trò chủ nhóm', value: true },
  ];
  const fetchMyGroups = async () => {
    try {
      const userId = await AsyncStorageService.getUserId();
      setUserId(userId);
      console.log('data send to server:', userId, selectedGroupState, selectedOwnership);
      const groupsData = await StudyGroupService.getGroups(userId, selectedGroupState, selectedOwnership);
      setGroups(formatGroups(groupsData));
      setLoading(false);
    }
    catch (error) {
      console.error('Error fetching my groups:', error);
    }
  }
  useEffect(() => {

    fetchMyGroups();
  }, []);

  const formatGroups = (groupsData) => {
    return groupsData.map(group => {
      const owner = group.members?.find(member => member.user_id === group.owner_id);

      return {
        id: group.id,
        name: group.name,
        owner_id: group.owner_id,
        description: group.description || '',
        isOwn: selectedOwnership && group.owner_id === userId,
        status: group.status || 'Active',
        leaderInfo: {
          leaderAvatar: owner?.Avatar || null,
          leaderName: owner ? `${owner.first_name} ${owner.last_name}` : 'Chủ nhóm',
        },
        memberCount: group.members.length
      };
    });
  };
  const handleMorePress = (group) => {
    setSelectedGroup(group);
    setEditedGroupName(group.name);
    setShowSettingsModal(true);
  };



  const handleUpdateGroup = async () => {
    if (!editedGroupName.trim()) {
      Alert.alert('Lỗi', 'Tên nhóm không được để trống');
      return;
    }
    const groupData = {
      name: editedGroupName,
      description: selectedGroup.description || '',
    };
    try {
      setModalLoading(true);

      const updatedGroup = await StudyGroupService.updateGroup(selectedGroup.id, groupData);

      Alert.alert('Thành công', 'Đã cập nhật tên nhóm thành công');

      const brandNewGroups = JSON.parse(JSON.stringify(groups));

      const updatedBrandNewGroups = brandNewGroups.map(group => {
        if (group.id === selectedGroup.id) {
          group.name = updatedGroup.name;
        }
        return group;
      });

      setGroups(updatedBrandNewGroups);
      setShowSettingsModal(false);
      setSelectedGroup(null);
    } catch (error) {
      console.error('Lỗi khi cập nhật tên nhóm:', error);
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật tên nhóm. Vui lòng thử lại sau.');
    } finally {
      setModalLoading(false);
    }
  }


  const handleArchiveGroup = async () => {
    try {
      setModalLoading(true);

      await StudyGroupService.changeGroupStatus(selectedGroup.id, 'OnHold');

      Alert.alert('Thành công', 'Đã lưu trữ nhóm thành công');

      const brandNewGroups = JSON.parse(JSON.stringify(groups));

      const updatedBrandNewGroups = brandNewGroups.map(group => {
        if (group.id === selectedGroup.id) {
          group.status = 'OnHold';
        }
        return group;
      });
      setGroups(updatedBrandNewGroups);
      setShowSettingsModal(false);
      setSelectedGroup(null);
    } catch (error) {
      console.error('Lỗi khi lưu trữ nhóm:', error);
      Alert.alert('Lỗi', error.message || 'Không thể lưu trữ nhóm. Vui lòng thử lại sau.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleRestoreGroup = async () => {
    try {
      setModalLoading(true);

      await StudyGroupService.changeGroupStatus(selectedGroup.id, 'Active');

      Alert.alert('Thành công', 'Đã khôi phục nhóm thành công');

      const brandNewGroups = JSON.parse(JSON.stringify(groups));

      const updatedBrandNewGroups = brandNewGroups.map(group => {
        if (group.id === selectedGroup.id) {
          group.status = 'Active';
        }
        return group;
      });

      setGroups(updatedBrandNewGroups);


      setShowSettingsModal(false);
      setSelectedGroup(null);
    } catch (error) {
      console.error('Lỗi khi khôi phục nhóm:', error);
      Alert.alert('Lỗi', error.message || 'Không thể khôi phục nhóm. Vui lòng thử lại sau.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Xóa nhóm',
      'Bạn có chắc chắn muốn xóa nhóm này? Hành động này không thể hoàn tác.',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          onPress: async () => {
            try {
              setModalLoading(true);

              await StudyGroup.deleteGroup(selectedGroup.id);

              Alert.alert('Thành công', 'Đã xóa nhóm thành công');

              const brandNewGroups = JSON.parse(JSON.stringify(groups));
              const updatedBrandNewGroups = brandNewGroups.filter(group => group.id !== selectedGroup.id);
              setGroups(updatedBrandNewGroups);
              setShowSettingsModal(false);
              setSelectedGroup(null);
            } catch (error) {
              console.error('Lỗi khi xóa nhóm:', error);
              Alert.alert('Lỗi', error.message || 'Không thể xóa nhóm. Vui lòng thử lại sau.');
            } finally {
              setModalLoading(false);
            }
          },
          style: 'destructive',
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nhóm học tập</Text>
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          <Dropdown
            style={styles.dropdown}
            data={ownershipState}
            labelField="label"
            valueField="value"
            value={selectedOwnership}
            onChange={(item) => setSelectedOwnership(item.value)}
            placeholder="Vai trò"
          />
          <Dropdown
            style={styles.dropdown}
            data={groupState}
            labelField="label"
            valueField="value"
            value={selectedGroupState}
            onChange={(item) => setSelectedGroupState(item.value)}
            placeholder="Trạng thái"
          />
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => fetchMyGroups()}
          >
            <Text style={styles.update}>Áp dụng</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.buttonCreateGroup}
          onPress={() => navigation.navigate(SCREENS.CREATE_STUDY_GROUP)}
        >
          <Ionicons name="create-outline" size={24} color={COLORS.WHITE} />
          <Text style={styles.buttonCreateGroupText}>Tạo nhóm học tập</Text>
        </TouchableOpacity>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.BLUE} />
            <Text style={styles.loadingText}>Đang tải nhóm học tập...</Text>
          </View>
        ) : groups?.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>
              {selectedOwnership === true
                ? 'Bạn chưa tạo hoặc tham gia nhóm học tập nào'
                : `Không có nhóm học tập nào ở trạng thái "${selectedGroupState === 'Active' ? 'Đang hoạt động' :
                  selectedGroupState === 'OnHold' ? 'Đã lưu trữ' : 'Đã xóa'
                }"`
              }
            </Text>
            <TouchableOpacity
              style={styles.createEmptyButton}
              onPress={() => navigation.navigate(SCREENS.CREATE_STUDY_GROUP)}
            >
              <Text style={styles.createEmptyButtonText}>Tạo nhóm mới</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            style={styles.groupList}
            data={groups}
            keyExtractor={(item) => item.id}
            renderItem={({ item: group }) => (
              <StudyGroupCard
                group={group}
                onPressMore={() => handleMorePress(group)}
                onPress={() => {
                  if (!selectedOwnership && group.status === 'OnHold')
                    Toast.show({
                      type: 'info',
                      text1: 'Thông tin',
                      text2: 'Bạn không thể truy cập nhóm đã lưu trữ với vai trò thành viên',
                      visibilityTime: 2000,
                    });
                  else
                  { 
                    console.log("lead",userId === group.owner_id)
                    navigation.navigate(SCREENS.STUDY_GROUP_DETAIL, { group, isLeader: userId === group.owner_id })
                  }
                }}
                isLeader={group.isOwn}
              />
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <Modal
        visible={showSettingsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowSettingsModal(false);
          setSelectedGroup(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cài đặt nhóm</Text>
              <TouchableOpacity onPress={() => {
                setShowSettingsModal(false);
                setSelectedGroup(null);
              }}>
                <Ionicons name="close" size={24} color={COLORS.BLACK} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Tên nhóm</Text>
                <TextInput
                  style={styles.input}
                  value={editedGroupName}
                  onChangeText={setEditedGroupName}
                  placeholder="Nhập tên nhóm"
                />
              </View>

              <View style={styles.statusContainer}>
                <Text style={styles.statusLabel}>Trạng thái hiện tại:</Text>
                <View style={styles.statusBadge}>
                  <Text style={[
                    styles.statusText,
                    { color: selectedGroup?.status === 'Active' ? COLORS.GREEN : COLORS.GRAY }
                  ]}>
                    {selectedGroup?.status === 'Active' ? 'Đang hoạt động' : 'Đã lưu trữ'}
                  </Text>
                </View>
              </View>

              {modalLoading ? (
                <View style={styles.modalLoadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.BLUE} />
                  <Text style={styles.modalLoadingText}>Đang xử lý...</Text>
                </View>
              ) : (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.updateButton]}
                    onPress={handleUpdateGroup}
                    disabled={modalLoading}
                  >
                    <Text style={styles.actionButtonText}>Cập nhật tên nhóm</Text>
                  </TouchableOpacity>

                  {selectedGroup?.status === 'Active' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.archiveButton]}
                      onPress={handleArchiveGroup}
                      disabled={modalLoading}
                    >
                      <Text style={styles.actionButtonText}>Lưu trữ nhóm</Text>
                    </TouchableOpacity>
                  )}

                  {selectedGroup?.status === 'OnHold' && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.restoreButton]}
                        onPress={handleRestoreGroup}
                        disabled={modalLoading}
                      >
                        <Text style={styles.actionButtonText}>Khôi phục nhóm</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={handleDeleteGroup}
                        disabled={modalLoading}
                      >
                        <Text style={styles.deleteButtonText}>Xóa nhóm</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  dropdown: {
    flex: 1,
    height: 40,
    borderColor: COLORS.GRAY_LIGHT,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.GRAY_BG,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  buttonCreateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.BLUE_LIGHT,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: COLORS.BLUE,
  },
  buttonCreateGroupText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.BLUE,
    borderRadius: 4,
    padding: 10,
  },
  emailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emailInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 4,
    padding: 10,
  },
  addButton: {
    backgroundColor: COLORS.BLUE,
    padding: 10,
    borderRadius: 4,
    marginLeft: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emailList: {
    marginBottom: 16,
  },
  emailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emailText: {
    flex: 1,
  },
  closeButton: {
    marginLeft: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: COLORS.GRAY,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: COLORS.BLUE,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  groupList: {
    flex: 1,
  },
  filterContainer: {
    padding: 16,

  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  leaderFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leaderFilterText: {
    fontSize: 14,
    color: COLORS.BLACK,
    fontWeight: '500',
  },
  leaderBadge: {
    backgroundColor: COLORS.BLUE + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  leaderBadgeText: {
    color: COLORS.BLUE,
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLUE
  },
  modalContent: {
    padding: 16,
    gap: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.BLACK,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: COLORS.BLACK,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: COLORS.GRAY_LIGHT + '20',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    gap: 12,
    backgroundColor: COLORS.GRAY_BG,
  },
  actionButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '500',
  },
  updateButton: {
    backgroundColor: COLORS.BLUE,
  },
  archiveButton: {
    backgroundColor: COLORS.ORANGE,
  },
  restoreButton: {
    backgroundColor: COLORS.GREEN,
  },
  deleteButton: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.RED,
  },
  deleteButtonText: {
    color: COLORS.RED,
    fontSize: 16,
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.GRAY,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.RED,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.GRAY,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.BLUE,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '500',
  },
  createEmptyButton: {
    backgroundColor: COLORS.BLUE,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  createEmptyButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '500',
  },
  modalLoadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalLoadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.GRAY,
    textAlign: 'center',
  },
  update: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: COLORS.BLUE,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});
