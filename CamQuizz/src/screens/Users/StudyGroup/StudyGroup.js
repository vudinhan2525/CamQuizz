import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Switch, Image, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Ionicons } from '@expo/vector-icons';
import { StudyGroupCard } from '../../../components/StudyGroupCard';
import COLORS from '../../../constant/colors';
import SCREENS from '../../../screens/index';
import GroupService from '../../../services/GroupService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export const StudyGroup = ({ navigation, route }) => {
  const [selectedGroupState, setSelectedGroupState] = useState('Active');
  const [selectedOwnership, setSelectedOwnership] = useState('all');
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editedGroupName, setEditedGroupName] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [updateCounter, setUpdateCounter] = useState(0); 
  const [forceRender, setForceRender] = useState(false); 

  const groupsRef = useRef(groups);
  const filteredGroupsRef = useRef(filteredGroups);

  const groupState = [
    { label: 'Đang hoạt động', value: 'Active' },
    { label: 'Đã lưu trữ', value: 'OnHold' },
    { label: 'Đã xóa', value: 'Deleted' },
  ];

  const ownershipState = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Nhóm của bạn', value: 'own' },
  ];

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Không thể lấy thông tin người dùng');
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (route.params?.refreshGroups && userId) {
      console.log('Refreshing groups after creating new group');
      fetchGroups();

      navigation.setParams({ refreshGroups: undefined });
    }
  }, [route.params?.refreshGroups, userId]);

  const fetchGroups = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      let response;
      if (selectedOwnership === 'own') {
        response = await GroupService.getMyGroups(userId);
        console.log('My groups response:', response);
      } else {
        response = await GroupService.getAllGroups();
        console.log('All groups response:', response);
      }

      console.log('Fetched groups at:', new Date().toISOString());

        console.log('API response structure:', JSON.stringify(response));

        let groupsData = [];

        if (response.data) {
          if (response.data.data && Array.isArray(response.data.data)) {
            groupsData = response.data.data;
          }
          else if (Array.isArray(response.data)) {
            groupsData = response.data;
          }
        }

        console.log('Extracted groups data:', groupsData);

        if (groupsData.length === 0) {
          console.log('No groups found');
          setGroups([]);
          return;
        }

        const formattedGroups = groupsData.map(group => {
          const ownerId = group.ownerId || group.owner_id;
          const isOwner = ownerId === userId || ownerId === parseInt(userId);

          let userRole = 'Guest';
          let userMemberStatus = null;

          if (isOwner) {
            userRole = 'Owner';
            userMemberStatus = 'Approved';
          } else if (group.members && Array.isArray(group.members)) {
            const userMember = group.members.find(member =>
              member.userId === userId || member.userId === parseInt(userId)
            );
            if (userMember) {
              userMemberStatus = userMember.status;
              userRole = userMember.status === 'Approved' ? 'Member' : 'Pending';
            }
          }

          console.log(`Group ${group.id} - Owner ID: ${ownerId}, User ID: ${userId}, Is Owner: ${isOwner}, Role: ${userRole}, Status: ${userMemberStatus}`);

          console.log('Raw group data from API:', JSON.stringify(group));

          return {
            id: group.id.toString(),
            name: group.name,
            leaderInfo: {
              leaderName: group.ownerName || 'Không xác định', 
              leaderAvatar: null, 
            },
            memberCount: group.approvedMembers || group.totalMembers || 0,
            status: group.status || 'Active',
            isOwn: isOwner,
            userRole: userRole,
            userMemberStatus: userMemberStatus,
            description: group.description || '',
            ownerId: ownerId
          };
        });

        console.log('Formatted groups:', formattedGroups);

        if (selectedOwnership === 'own') {
          console.log('Showing my groups (owned or member):', formattedGroups);

          if (formattedGroups.length === 0) {
            console.log('No groups found for this user');
          }

          setGroups(formattedGroups);
        } else {
          setGroups(formattedGroups);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);

        // Handle 401 errors specifically
        if (error.message && error.message.includes('Unauthorized')) {
          setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        } else {
          setError('Không thể tải danh sách nhóm học tập');
        }
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (userId) {
      console.log('Calling fetchGroups due to userId or selectedOwnership change');
      fetchGroups();
    }
  }, [userId, selectedOwnership]);

  useEffect(() => {
    if (groups.length > 0) {
      let result = [...groups];

      result = result.filter(group => group.status === selectedGroupState);

      console.log(`Filtered groups by status '${selectedGroupState}':`, result);
      setFilteredGroups(result);
    } else {
      setFilteredGroups([]);
    }
  }, [groups, selectedGroupState]);

  useEffect(() => {
    if (updateCounter > 0) {
      console.log(`UI update triggered (counter: ${updateCounter})`);
      console.log('Current groups:', groups.map(g => ({ id: g.id, name: g.name })));
      console.log('Current filteredGroups:', filteredGroups.map(g => ({ id: g.id, name: g.name })));
    }
  }, [updateCounter]);

  useFocusEffect(
    React.useCallback(() => {
      console.log('Screen focused - checking for local changes');

      const checkLocalChanges = async () => {
        try {
          const localChangesString = await AsyncStorage.getItem('localGroupChanges');
          if (localChangesString) {
            const localChanges = JSON.parse(localChangesString);
            console.log('Found local changes:', localChanges);

            if (groups.length > 0 && filteredGroups.length > 0) {
              const updatedGroups = groups.map(group => {
                const localChange = localChanges.find(change => change.id === group.id);
                if (localChange) {
                  console.log(`Applying local change to group ${group.id}: ${group.name} -> ${localChange.name}`);
                  return { ...group, name: localChange.name };
                }
                return group;
              });

              const updatedFilteredGroups = filteredGroups.map(group => {
                const localChange = localChanges.find(change => change.id === group.id);
                if (localChange) {
                  console.log(`Applying local change to filtered group ${group.id}: ${group.name} -> ${localChange.name}`);
                  return { ...group, name: localChange.name };
                }
                return group;
              });

              setGroups(updatedGroups);
              setFilteredGroups(updatedFilteredGroups);

              setUpdateCounter(prev => prev + 1);

              setForceRender(prev => !prev);
            }
          }
        } catch (error) {
          console.error('Error checking local changes:', error);
        }
      };

      checkLocalChanges();

      return () => {
      };
    }, [])
  );

  useEffect(() => {
    console.log('=== GROUPS CHANGED ===');
    console.log('New groups:', groups.map(g => ({ id: g.id, name: g.name })));

    groupsRef.current = groups;

    console.log('Có thay đổi không?', JSON.stringify(groupsRef.current) !== JSON.stringify(groups));
    console.log('=== END GROUPS CHANGED ===');
  }, [groups]);

  useEffect(() => {
    console.log('=== FILTERED GROUPS CHANGED ===');
    console.log('New filteredGroups:', filteredGroups.map(g => ({ id: g.id, name: g.name })));

    filteredGroupsRef.current = filteredGroups;

    console.log('Có thay đổi không?', JSON.stringify(filteredGroupsRef.current) !== JSON.stringify(filteredGroups));

    console.log('=== END FILTERED GROUPS CHANGED ===');
  }, [filteredGroups]);

  const handleMorePress = (group) => {
    console.log('Selected group for editing:', group);
    setSelectedGroup(group);
    setEditedGroupName(group.name);
    setShowSettingsModal(true);
  };

  const handleUpdateGroup = async () => {
    if (!editedGroupName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên nhóm');
      return;
    }

    try {
      setModalLoading(true);
      const updateData = {
        name: editedGroupName.trim(),
        description: selectedGroup.description || ''
      };

      console.log('Sending update data:', JSON.stringify(updateData));

      const response = await GroupService.updateGroup(selectedGroup.id, updateData);

      console.log('=== KIỂM TRA PHẢN HỒI TỪ SERVER ===');
      console.log('Update group response:', JSON.stringify(response, null, 2));

      if (!response) {
        console.log('CẢNH BÁO: Không nhận được phản hồi từ server');
      } else {
        console.log('Nhận được phản hồi từ server');

        if (response.id) {
          console.log('Phản hồi chứa ID nhóm:', response.id);
        } else {
          console.log('Phản hồi không chứa ID nhóm');
        }

        if (response.name) {
          console.log('Phản hồi chứa tên nhóm đã cập nhật:', response.name);

          if (response.name === editedGroupName.trim()) {
            console.log('Tên nhóm đã được cập nhật đúng');
          } else {
            console.log('Tên nhóm không được cập nhật đúng');
            console.log(`Tên nhóm mong muốn: "${editedGroupName.trim()}", tên nhóm nhận được: "${response.name}"`);
          }
        } else {
          console.log('Phản hồi không chứa tên nhóm');
        }
      }
      console.log('=== KẾT THÚC KIỂM TRA ===');

      const oldName = selectedGroup.name;
      const newName = editedGroupName.trim();

      console.log(`Tên nhóm: ${oldName} -> ${newName}`);

      if (oldName !== newName) {
        console.log('Tên nhóm đã thay đổi, cập nhật UI');
      } else {
        console.log('Tên nhóm không thay đổi');
      }

      Alert.alert('Thành công', 'Đã cập nhật tên nhóm thành công');

      const updatedSelectedGroup = {
        ...selectedGroup,
        name: editedGroupName.trim()
      };

      setSelectedGroup(updatedSelectedGroup);

      const updatedName = (response && response.name) || editedGroupName.trim();
      console.log('Tên nhóm sẽ được cập nhật trong UI:', updatedName);

      const updatedGroups = groups.map(group => {
        if (group.id === selectedGroup.id) {
          console.log(`Cập nhật nhóm trong groups: ID ${group.id}, tên cũ: "${group.name}", tên mới: "${updatedName}"`);
          return {
            ...group,
            name: updatedName
          };
        }
        return group;
      });

      const updatedFilteredGroups = filteredGroups.map(group => {
        if (group.id === selectedGroup.id) {
          console.log(`Cập nhật nhóm trong filteredGroups: ID ${group.id}, tên cũ: "${group.name}", tên mới: "${updatedName}"`);
          return {
            ...group,
            name: updatedName
          };
        }
        return group;
      });

      console.log('Cập nhật groups với:', updatedGroups.map(g => ({ id: g.id, name: g.name })));
      console.log('Cập nhật filteredGroups với:', updatedFilteredGroups.map(g => ({ id: g.id, name: g.name })));

      setGroups(updatedGroups);
      setFilteredGroups(updatedFilteredGroups);

      setUpdateCounter(prev => {
        console.log('Tăng updateCounter từ', prev, 'lên', prev + 1);
        return prev + 1;
      });

      setForceRender(prev => {
        console.log('Đảo ngược forceRender từ', prev, 'thành', !prev);
        return !prev;
      });

      setShowSettingsModal(false);
      setSelectedGroup(null);

      console.log(' Cập nhật UI thành công');
    } catch (error) {
      console.error('Lỗi khi cập nhật nhóm:', error);
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật nhóm. Vui lòng thử lại sau.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleArchiveGroup = async () => {
    try {
      setModalLoading(true);

      await GroupService.changeGroupStatus(selectedGroup.id, 'OnHold');

      Alert.alert('Thành công', 'Đã lưu trữ nhóm thành công');

      const brandNewGroups = JSON.parse(JSON.stringify(groups));

      const updatedBrandNewGroups = brandNewGroups.map(group => {
        if (group.id === selectedGroup.id) {
          group.status = 'OnHold';
        }
        return group;
      });

      setGroups(updatedBrandNewGroups);

      setUpdateCounter(prev => prev + 1);

      setForceRender(prev => !prev);

      setTimeout(() => {
        console.log('Tải lại danh sách nhóm từ server sau 2 giây');
        fetchGroups().catch(error => {
          console.log('Error refreshing groups after archive:', error);
        });
      }, 2000);

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

      await GroupService.changeGroupStatus(selectedGroup.id, 'Active');

      Alert.alert('Thành công', 'Đã khôi phục nhóm thành công');

      const brandNewGroups = JSON.parse(JSON.stringify(groups));

      const updatedBrandNewGroups = brandNewGroups.map(group => {
        if (group.id === selectedGroup.id) {
          group.status = 'Active';
        }
        return group;
      });

      setGroups(updatedBrandNewGroups);

      setUpdateCounter(prev => prev + 1);

      setForceRender(prev => !prev);

      setTimeout(() => {
        console.log('Tải lại danh sách nhóm từ server sau 2 giây');
        fetchGroups().catch(error => {
          console.log('Error refreshing groups after restore:', error);
        });
      }, 2000);

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

              await GroupService.deleteGroup(selectedGroup.id);

              Alert.alert('Thành công', 'Đã xóa nhóm thành công');

              const brandNewGroups = JSON.parse(JSON.stringify(groups));
              const brandNewFilteredGroups = JSON.parse(JSON.stringify(filteredGroups));

              const updatedBrandNewGroups = brandNewGroups.filter(group => group.id !== selectedGroup.id);
              const updatedBrandNewFilteredGroups = brandNewFilteredGroups.filter(group => group.id !== selectedGroup.id);

              setGroups(updatedBrandNewGroups);
              setFilteredGroups(updatedBrandNewFilteredGroups);

              setUpdateCounter(prev => prev + 1);

              setForceRender(prev => !prev);

              setTimeout(() => {
                console.log('Tải lại danh sách nhóm từ server sau 2 giây');
                fetchGroups().catch(error => {
                  console.log('Error refreshing groups after delete:', error);
                });
              }, 2000);

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

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.BLUE} />
            <Text style={styles.loadingText}>Đang tải nhóm học tập...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setUserId(null);
                const fetchUserId = async () => {
                  try {
                    const userData = await AsyncStorage.getItem('userData');
                    if (userData) {
                      const user = JSON.parse(userData);
                      setUserId(user.id);
                    }
                  } catch (error) {
                    console.error('Error fetching user data:', error);
                    setError('Không thể lấy thông tin người dùng');
                  }
                };
                fetchUserId();
              }}
            >
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : filteredGroups.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>
              {selectedOwnership === 'own'
                ? 'Bạn chưa tạo hoặc tham gia nhóm học tập nào'
                : `Không có nhóm học tập nào ở trạng thái "${
                    selectedGroupState === 'Active' ? 'Đang hoạt động' :
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
            key={`list-${updateCounter}-${forceRender ? 'true' : 'false'}`}
            style={styles.groupList}
            data={filteredGroups}
            extraData={[updateCounter, forceRender]}
            keyExtractor={(item) => `${item.id}-${updateCounter}-${forceRender ? 'true' : 'false'}-${item.name}`}
            renderItem={({ item: group }) => {
              // Log để kiểm tra dữ liệu của mỗi group trước khi render
              console.log(`FlatList rendering group: ${group.id}, name: ${group.name}, forceRender: ${forceRender}`);

              return (
                <StudyGroupCard
                  group={group}
                  onPressMore={() => handleMorePress(group)}
                  onPress={() => navigation.navigate(SCREENS.STUDY_GROUP_DETAIL, { group, isLeader: group.isOwn })}
                  isLeader={group.isOwn}
                />
              );
            }}
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
});
