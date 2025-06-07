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
  const [stateCurrent, setStateCurrent] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [error, setError] = useState(null);
  
const handleFetchUsers = async (isLoadMore = false) => {
    try {
      setError(null);
      if (!isLoadMore) {
        setLoading(true);
      }

      const {data, pagination} = await UserService.getAllUsers(searchQuery || null, 10, stateCurrent);

      console.log('API Response - Data:', data);
      console.log('API Response - Pagination:', pagination);

      if (data && Array.isArray(data)) {
        if (isLoadMore) {
          // Append new data for load more
          setFilteredUsers(prevUsers => [...prevUsers, ...data]);
        } else {
          // Replace data for new search or initial load
          setFilteredUsers(data);
        }

        // Check if there's more data
        setHasMoreData(pagination && pagination.hasNextPage);
      } else {
        console.warn('Invalid data format received:', data);
        setFilteredUsers([]);
        setHasMoreData(false);
      }

    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Không thể tải danh sách người dùng. Vui lòng thử lại.');

      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }

      Alert.alert('Lỗi', 'Không thể tải danh sách người dùng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
}

useEffect(() => {
    if (stateCurrent === 1) {
      handleFetchUsers();
    } else {
      handleFetchUsers(true); // Load more
    }
  }, [stateCurrent]);

  const handleRefresh = () => {
    setRefreshing(true);
    setStateCurrent(1);
    setFilteredUsers([]);
    handleFetchUsers();
  };

  const handleLoadMore = () => {
    if (loading || !hasMoreData) return;

    setStateCurrent(prevPage => prevPage + 1);
  };

  const handleSearch = () => {
    setStateCurrent(1);
    setFilteredUsers([]);
    handleFetchUsers();
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

              // Refresh data after a short delay
              setTimeout(() => {
                handleRefresh();
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
    const userRole = item.role || item.user_role || 'User'; // Get user role from item data

    const isActive = !isBanned;

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
          <Text style={styles.roleText}>{userRole === 'Admin' ? 'Quản trị viên' : 'Người dùng'}</Text>
          {userRole !== 'Admin' && isActive && (
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
               'Khóa'
            </Text>
          </TouchableOpacity> )}
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
            onSubmitEditing={handleFetchUsers}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={20} color={COLORS.WHITE} />
          </TouchableOpacity>
        </View>
      </View>

      {loading && filteredUsers.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.BLUE} />
          <Text style={styles.loadingText}>Đang tải danh sách người dùng...</Text>
        </View>
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={60} color={COLORS.ORANGE} />
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
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
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={60} color={COLORS.GRAY_LIGHT} />
              <Text style={styles.emptyText}>Không tìm thấy người dùng nào</Text>
            </View>
          }
          ListFooterComponent={
            hasMoreData && filteredUsers.length > 0 ? (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={handleLoadMore}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={COLORS.WHITE} />
                ) : (
                  <Text style={styles.loadMoreText}>Tải thêm</Text>
                )}
              </TouchableOpacity>
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
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.GRAY_TEXT,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.BLUE,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  retryButtonText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '500',
  }
});
