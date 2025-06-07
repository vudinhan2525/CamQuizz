import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import COLORS from '../../constant/colors';
import { Ionicons } from '@expo/vector-icons';
import UserService from '../../services/UserService';

export const User = () => {
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [availableRoles, setAvailableRoles] = useState(['All', 'User', 'Admin']); 

  const [showAllUsers, setShowAllUsers] = useState({
    'All': false,
    'Admin': false,
    'Student': false,
    'User': false,
    'Teacher': false,
  });

  const [roleUsersData, setRoleUsersData] = useState({
    'All': [],
    'Admin': [],
    'Student': [],
    'User': [],
    'Teacher': [],
  });

  useEffect(() => {
    fetchUsersForRole(filterRole);
  }, []);

  useEffect(() => {
    setShowAllUsers(prev => ({
      ...prev,
      [filterRole]: false
    }));
    fetchUsersForRole(filterRole);
  }, [searchQuery]);

  useEffect(() => {
    const currentRoleData = roleUsersData[filterRole];
    if (!currentRoleData || currentRoleData.length === 0) {
      fetchUsersForRole(filterRole);
    } else {
      const isShowingAll = showAllUsers[filterRole];
      const displayData = isShowingAll ? currentRoleData : currentRoleData.slice(0, 5);
      setFilteredUsers(displayData);
    }
  }, [filterRole]);

  const fetchUsersForRole = async (role, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await UserService.getAllUsers(searchQuery || null, 1000, 1); 
      console.log('Full response for role', role, ':', response);

      const usersData = response.items || response.data || response.users || (Array.isArray(response) ? response : []);

      console.log('Processed users data for role', role, ':', usersData);

      if (role === 'All') {
        const roles = new Set(['All']);
        usersData.forEach(user => {
          if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
            user.roles.forEach(userRole => {
              // Handle both string and object role formats
              const roleName = typeof userRole === 'string' ? userRole : userRole.name || userRole.roleName || userRole;
              if (roleName) {
                roles.add(roleName);
              }
            });
          }
        });
        setAvailableRoles(Array.from(roles));
      }

      let filteredData = usersData;
      if (role !== 'All') {
        filteredData = usersData.filter(user => {
          if (!user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
            return false;
          }
          return user.roles.some(userRole => {
            const roleName = typeof userRole === 'string' ? userRole : userRole.name || userRole.roleName || userRole;
            return roleName && roleName.toLowerCase() === role.toLowerCase();
          });
        });
      }

      setRoleUsersData(prev => ({
        ...prev,
        [role]: filteredData
      }));

      setShowAllUsers(prev => ({
        ...prev,
        [role]: false
      }));

      const displayData = filteredData.slice(0, 5);
      setFilteredUsers(displayData);

    } catch (error) {
      console.error('Error fetching users for role', role, ':', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách người dùng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (loading) return;

    const allUsersForRole = roleUsersData[filterRole] || [];
    setFilteredUsers(allUsersForRole);
    setShowAllUsers(prev => ({
      ...prev,
      [filterRole]: true
    }));
  };

  const handleSearch = () => {
    setShowAllUsers(prev => ({
      ...prev,
      [filterRole]: false
    }));
    fetchUsersForRole(filterRole, true);
  };

  const handleRefresh = () => {
    setShowAllUsers(prev => ({
      ...prev,
      [filterRole]: false
    }));
    fetchUsersForRole(filterRole, true);
  };

  const handleBanUser = async (userId, currentBanStatus) => {
    const newBanStatus = !currentBanStatus;

    Alert.alert(
      'Xác nhận',
      `Bạn có chắc chắn muốn ${newBanStatus ? 'khóa' : 'mở khóa'} người dùng này?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Before ban request:', { userId, currentBanStatus, newBanStatus });

              const response = await UserService.updateUserBanStatus(userId, newBanStatus);
              console.log('Ban request successful:', response);
              setRoleUsersData(prevData => {
                const updatedData = { ...prevData };
                Object.keys(updatedData).forEach(role => {
                  updatedData[role] = updatedData[role].map(user =>
                    user.id === userId ? {
                      ...user,
                      is_banned: newBanStatus,
                      isBanned: newBanStatus 
                    } : user
                  );
                });
                return updatedData;
              });

              // Update filtered users display
              setFilteredUsers(prevUsers =>
                prevUsers.map(user =>
                  user.id === userId ? {
                    ...user,
                    is_banned: newBanStatus,
                    isBanned: newBanStatus
                  } : user
                )
              );

              Alert.alert('Thành công', `Người dùng đã được ${newBanStatus ? 'khóa' : 'mở khóa'} thành công`);

              setTimeout(() => {
                fetchUsersForRole(filterRole, true);
              }, 1000);

            } catch (error) {
              console.error('Lỗi khi cập nhật trạng thái người dùng:', error);
              Alert.alert('Lỗi', 'Không thể cập nhật trạng thái người dùng. Vui lòng thử lại.');
            }
          }
        }
      ]
    );
  };

  const renderUserItem = ({ item }) => {
    const firstName = item.first_name || item.firstName || '';
    const lastName = item.last_name || item.lastName || '';
    const email = item.email || '';
    const gender = item.gender || '';
    const createdAt = item.created_at || item.createdAt || new Date().toISOString();
    const isBanned = item.is_banned !== undefined ? item.is_banned : (item.isBanned || false);
    const roles = item.roles || [];

    const isActive = !isBanned;
    const userRole = roles && roles.length > 0 ? roles[0] : 'User';

    return (
      <View style={styles.userCard}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {firstName.charAt(0)}{lastName.charAt(0)}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{firstName} {lastName}</Text>
            <Text style={styles.userEmail}>{email}</Text>
            <View style={styles.userMeta}>
              <Text style={styles.userGender}>{gender}</Text>
              <Text style={styles.userDate}>
                {new Date(createdAt).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.userStatus}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: isActive ? COLORS.GREEN : COLORS.ORANGE }
          ]}>
            <Text style={styles.statusText}>
              {isActive ? 'Hoạt động' : 'Bị khóa'}
            </Text>
          </View>
          <Text style={styles.roleText}>{userRole}</Text>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: isActive ? COLORS.ORANGE : COLORS.GREEN }
            ]}
            onPress={() => handleBanUser(item.id, isBanned)}
          >
            <Ionicons
              name={isActive ? 'ban' : 'checkmark-circle'}
              size={16}
              color={COLORS.WHITE}
            />
            <Text style={styles.actionButtonText}>
              {isActive ? 'Khóa' : 'Mở khóa'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm người dùng..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={20} color={COLORS.WHITE} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Lọc theo vai trò:</Text>
        <View style={styles.filterOptions}>
          {availableRoles.map((role) => {
            const roleDisplayNames = {
              'All': 'Tất cả',
              'User': 'Người dùng',
              'Admin': 'Quản trị viên',
              'Student': 'Học sinh',
              'Teacher': 'Giáo viên'
            };

            return (
              <TouchableOpacity
                key={role}
                style={[styles.filterOption, filterRole === role && styles.activeFilterOption]}
                onPress={() => setFilterRole(role)}
              >
                <Text style={[styles.filterText, filterRole === role && styles.activeFilterText]}>
                  {roleDisplayNames[role] || role}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.BLUE} />
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.BLUE]}
              tintColor={COLORS.BLUE}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people" size={60} color={COLORS.GRAY_LIGHT} />
              <Text style={styles.emptyText}>
                {searchQuery || filterRole !== 'All'
                  ? 'Không tìm thấy người dùng phù hợp'
                  : 'Chưa có người dùng nào'
                }
              </Text>
            </View>
          }
          ListFooterComponent={
            !showAllUsers[filterRole] && filteredUsers.length >= 5 && !loading ? (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={handleLoadMore}
              >
                <Text style={styles.loadMoreText}>Tải thêm</Text>
              </TouchableOpacity>
            ) : loading && filteredUsers.length > 0 ? (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color={COLORS.BLUE} />
                <Text style={styles.loadingMoreText}>Đang tải...</Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT + '30',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: COLORS.GRAY_BG,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: COLORS.BLUE,
    height: 40,
    width: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    padding: 16,
    backgroundColor: COLORS.WHITE,
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: COLORS.BLACK,
  },
  filterOptions: {
    flexDirection: 'row',
  },
  filterOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: COLORS.GRAY_BG,
  },
  activeFilterOption: {
    backgroundColor: COLORS.BLUE,
  },
  filterText: {
    color: COLORS.BLACK,
  },
  activeFilterText: {
    color: COLORS.WHITE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  userCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: COLORS.BLUE,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.BLUE + '30',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.GRAY_TEXT,
    marginBottom: 4,
  },
  userMeta: {
    flexDirection: 'row',
  },
  userGender: {
    fontSize: 12,
    color: COLORS.GRAY_TEXT,
    marginRight: 8,
  },
  userDate: {
    fontSize: 12,
    color: COLORS.GRAY_TEXT,
  },
  userStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: '500',
  },
  roleText: {
    fontSize: 12,
    color: COLORS.BLUE,
    fontWeight: '500',
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    minWidth: 80,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    color: COLORS.GRAY_TEXT,
    textAlign: 'center',
  },
  loadMoreButton: {
    backgroundColor: COLORS.BLUE,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  loadMoreText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '500',
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.GRAY_TEXT,
  }
});
