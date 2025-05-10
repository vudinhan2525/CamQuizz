import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Image, Modal, TextInput, Alert } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Ionicons } from '@expo/vector-icons';
import { StudyGroupCard } from '../../../components/StudyGroupCard';
import COLORS from '../../../constant/colors';
import SCREENS from '../../../screens/index';

export const StudyGroup = ({ navigation, currentUser }) => {
  const [selectedGroupState, setSelectedGroupState] = useState('active');
  const [selectedOwnership, setSelectedOwnership] = useState('all');
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editedGroupName, setEditedGroupName] = useState('');
  
  const groups = [{
    id: '1',
    name: 'Nhóm học Toán 12A1',
    leaderInfo:{
      leaderName: 'Nguyễn Văn A',
      leaderAvatar: null,
    },
    memberCount: 30,
    status: 'active',
    isOwn: true
  },{
    id: '2', 
    name: 'Nhóm học Lý 11A2',
    leaderInfo:{
      leaderName: 'Nguyễn Văn B',
      leaderAvatar: null,
    },
    memberCount: 25,
    status: 'active',
    isOwn: false
  },{
    id: '3',
    name: 'Nhóm học Hóa 10A3',
    leaderInfo:{
      leaderName: 'Nguyễn Văn A',
      leaderAvatar: null,
    },
    memberCount: 20,
    status: 'archived',
    isOwn: true
  },{
    id: '4',
    name: 'Nhóm học Sinh 12A4', 
    leaderInfo:{
      leaderName: 'Nguyễn Văn A',
      leaderAvatar: null,
    },
    memberCount: 15,
    status: 'deleted',
    isOwn: true
  },{
    id: '5',
    name: 'Nhóm học Anh văn 11A5',
    leaderInfo:{
      leaderName: 'Nguyễn Văn A',
      leaderAvatar: null,
    },
    memberCount: 35,
    status: 'active',
    isOwn: true
  }];

  const groupState = [
    { label: 'Đang hoạt động', value: 'active' },
    { label: 'Đã lưu trữ', value: 'archived' },
    { label: 'Đã xóa', value: 'deleted' },
  ];

  const ownershipState = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Nhóm của bạn', value: 'own' },
  ];

  useEffect(() => {
    let result = [...groups];
    
    // Filter by status
    result = result.filter(group => group.status === selectedGroupState);
    
    // Filter by ownership
    if (selectedOwnership === 'own') {
      result = result.filter(group => group.isOwn);
    }
    
    setFilteredGroups(result);
  }, [selectedGroupState, selectedOwnership]);

  const handleMorePress = (group) => {
    setSelectedGroup(group);
    setEditedGroupName(group.name);
    setShowSettingsModal(true);
  };

  const handleUpdateGroup = () => {
    // Xử lý cập nhật thông tin nhóm
    if (!editedGroupName.trim()) {
      alert('Vui lòng nhập tên nhóm');
      return;
    }
    // API call để update group
    setShowSettingsModal(false);
  };

  const handleArchiveGroup = () => {
    // API call để archive group
    setShowSettingsModal(false);
  };

  const handleRestoreGroup = () => {
    // API call để restore group
    setShowSettingsModal(false);
  };

  const handleDeleteGroup = () => {
    // Hiển thị confirm dialog trước khi xóa
    Alert.alert(
      'Xóa nhóm',
      'Bạn có chắc chắn muốn xóa nhóm này?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          onPress: () => {
            // API call để delete group
            setShowSettingsModal(false);
          },
          style: 'destructive',
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
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
            placeholder="Phạm vi"
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

        <ScrollView 
          style={styles.groupList}
          showsVerticalScrollIndicator={false}
        >
          {filteredGroups.map(group => (
            <StudyGroupCard
              key={group.id}
              group={group}
              onPressMore={() => handleMorePress(group)}
              onPress={() => navigation.navigate(SCREENS.STUDY_GROUP_DETAIL, { group, isLeader: group.isOwn })}
              isLeader={group.isOwn}
            />
          ))}
        </ScrollView>
      </View>

      <Modal
        visible={showSettingsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cài đặt nhóm</Text>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
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
                    { color: selectedGroup?.status === 'active' ? COLORS.GREEN : COLORS.GRAY }
                  ]}>
                    {selectedGroup?.status === 'active' ? 'Đang hoạt động' : 'Đã lưu trữ'}
                  </Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.updateButton]}
                  onPress={handleUpdateGroup}
                >
                  <Text style={styles.actionButtonText}>Cập nhật tên nhóm</Text>
                </TouchableOpacity>

                {selectedGroup?.status === 'active' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.archiveButton]}
                    onPress={handleArchiveGroup}
                  >
                    <Text style={styles.actionButtonText}>Lưu trữ nhóm</Text>
                  </TouchableOpacity>
                )}

                {selectedGroup?.status === 'archived' && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.restoreButton]}
                      onPress={handleRestoreGroup}
                    >
                      <Text style={styles.actionButtonText}>Khôi phục nhóm</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={handleDeleteGroup}
                    >
                      <Text style={styles.deleteButtonText}>Xóa nhóm</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    borderBottomColor: COLORS.GRAY_LIGHT,
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
});
