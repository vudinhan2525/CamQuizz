import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../../constant/colors';
import { Ionicons } from 'react-native-vector-icons';
import { checkAuthStatus, logout } from '../../services/AuthService';

export const AdminAccount = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Lấy thông tin người dùng khi component mount
    const getUserData = async () => {
      const data = await checkAuthStatus();
      setUserData(data);
    };

    getUserData();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          onPress: async () => {
            try {
              await logout();
              
              // Thêm log để kiểm tra
              console.log('Admin logged out successfully');
              
              // Chuyển về màn hình đăng nhập bằng cách reset đến Root
              navigation.reset({
                index: 0,
                routes: [{ name: 'Root' }],
              });
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={require('../../../assets/icon.png')}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {userData ? `${userData.first_name} ${userData.last_name}` : 'Admin'}
          </Text>
          <Text style={styles.userEmail}>{userData?.email || 'admin@example.com'}</Text>
          <Text style={styles.userRole}>Quản trị viên</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="person-outline" size={24} color={COLORS.BLUE} />
          <Text style={styles.menuText}>Thông tin cá nhân</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.GRAY} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="shield-outline" size={24} color={COLORS.BLUE} />
          <Text style={styles.menuText}>Quyền quản trị</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.GRAY} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={24} color={COLORS.BLUE} />
          <Text style={styles.menuText}>Cài đặt hệ thống</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.GRAY} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.RED} />
          <Text style={[styles.menuText, { color: COLORS.RED }]}>Đăng xuất</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.GRAY} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  userInfo: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginTop: 5,
  },
  userRole: {
    fontSize: 14,
    color: COLORS.BLUE,
    marginTop: 5,
    fontWeight: 'bold',
  },
  menuContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  menuText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: COLORS.BLACK,
  },
});
