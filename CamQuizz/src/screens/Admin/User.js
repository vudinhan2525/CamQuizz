import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import COLORS from '../../constant/colors';
import { Ionicons } from '@expo/vector-icons';

export const User = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('All');

  // Mock data for development
  const mockUsers = [
    {
      id: 1,
      firstName: 'Nguyễn',
      lastName: 'Văn A',
      email: 'nguyenvana@gmail.com',
      gender: 'Nam',
      roles: ['User'],
      createdAt: '2023-10-15T08:30:00Z',
      status: 'Active'
    },
    {
      id: 2,
      firstName: 'Trần',
      lastName: 'Thị B',
      email: 'tranthib@gmail.com',
      gender: 'Nữ',
      roles: ['User'],
      createdAt: '2023-11-20T10:15:00Z',
      status: 'Active'
    },
    {
      id: 3,
      firstName: 'Lê',
      lastName: 'Văn C',
      email: 'levanc@gmail.com',
      gender: 'Nam',
      roles: ['Admin'],
      createdAt: '2023-09-05T14:45:00Z',
      status: 'Active'
    },
    {
      id: 4,
      firstName: 'Phạm',
      lastName: 'Thị D',
      email: 'phamthid@gmail.com',
      gender: 'Nữ',
      roles: ['User'],
      createdAt: '2023-12-10T09:20:00Z',
      status: 'Inactive'
    },
    {
      id: 5,
      firstName: 'Hoàng',
      lastName: 'Văn E',
      email: 'hoangvane@gmail.com',
      gender: 'Nam',
      roles: ['User'],
      createdAt: '2024-01-25T11:30:00Z',
      status: 'Active'
    }
  ];

  useEffect(() => {
    fetchUsers();
  }, [filterRole, searchQuery]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Mock API response
      await new Promise(resolve => setTimeout(resolve, 500));

      // Filter mock data based on search query and role
      let filteredUsers = [...mockUsers];

      if (searchQuery) {
        filteredUsers = filteredUsers.filter(user =>
          user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (filterRole !== 'All') {
        filteredUsers = filteredUsers.filter(user =>
          user.roles.includes(filterRole)
        );
      }

      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchUsers();
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );

      Alert.alert('Success', `Trạng thái người dùng đã được cập nhật thành ${newStatus}`);
    } catch (error) {
      console.error('Error updating user status:', error);
      Alert.alert('Error', 'Không thể cập nhật trạng thái người dùng. Vui lòng thử lại.');
    }
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => handleStatusChange(item.id, item.status === 'Active' ? 'Inactive' : 'Active')}
    >
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.firstName.charAt(0)}{item.lastName.charAt(0)}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <View style={styles.userMeta}>
            <Text style={styles.userGender}>{item.gender}</Text>
            <Text style={styles.userDate}>
              {new Date(item.createdAt).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.userStatus}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'Active' ? COLORS.GREEN : COLORS.ORANGE }
        ]}>
          <Text style={styles.statusText}>
            {item.status === 'Active' ? 'Hoạt động' : 'Tạm khóa'}
          </Text>
        </View>
        <Text style={styles.roleText}>{item.roles[0]}</Text>
      </View>
    </TouchableOpacity>
  );

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
          <TouchableOpacity
            style={[styles.filterOption, filterRole === 'All' && styles.activeFilterOption]}
            onPress={() => setFilterRole('All')}
          >
            <Text style={[styles.filterText, filterRole === 'All' && styles.activeFilterText]}>
              Tất cả
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterOption, filterRole === 'User' && styles.activeFilterOption]}
            onPress={() => setFilterRole('User')}
          >
            <Text style={[styles.filterText, filterRole === 'User' && styles.activeFilterText]}>
              Người dùng
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterOption, filterRole === 'Admin' && styles.activeFilterOption]}
            onPress={() => setFilterRole('Admin')}
          >
            <Text style={[styles.filterText, filterRole === 'Admin' && styles.activeFilterText]}>
              Quản trị viên
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.BLUE} />
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people" size={60} color={COLORS.GRAY_LIGHT} />
              <Text style={styles.emptyText}>Không tìm thấy người dùng</Text>
            </View>
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
    alignItems: 'center',
    shadowColor: COLORS.BLUE,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.BLUE,
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
  }
});
