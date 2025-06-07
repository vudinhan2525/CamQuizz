import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import ProfileAvatar from '../../components/Account/ProfileAvatar';
import EditableSection from '../../components/Account/EditableSection';
import PasswordSection from '../../components/Account/PasswordSection';
import GenderSection from '../../components/Account/GenderSection';
import DateOfBirthSection from '../../components/Account/DateOfBirthSection';
import { logout, checkAuthStatus, updateUserProfile, changePassword } from '../../services/AuthService';
import COLORS from '../../constant/colors';

const AdminAccount = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState({
    name: '',
    gender: 'Other',
    email: '',
    id: null,
    first_name: '',
    last_name: '',
    dateOfBirth: '',
    roles: [],
  });

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await checkAuthStatus();

        if (userData) {
          // Backend trả về snake_case format
          setProfile({
            id: userData.id,
            name: `${userData.first_name} ${userData.last_name}`,
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            gender: userData.gender || 'Other',
            dateOfBirth: userData.date_of_birth || userData.dateOfBirth || '',
            roles: userData.roles || [],
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Toast.show({
          type: 'error',
          text1: 'Không thể tải thông tin người dùng',
          text2: 'Vui lòng thử lại sau'
        });
      }
    };

    fetchUserData();
  }, []);

  // Update profile function
  const updateProfile = async (field, value) => {
    if (!profile.id) {
      Toast.show({
        type: 'error',
        text1: 'Không thể cập nhật',
        text2: 'Không tìm thấy thông tin người dùng'
      });
      return;
    }

    try {
      let updateData = {};

      if (field === 'name') {
        const nameParts = value.trim().split(' ');
        const firstName = nameParts.pop() || '';
        const lastName = nameParts.join(' ') || '';

        updateData = {
          FirstName: firstName,
          LastName: lastName
        };
      } else if (field === 'gender') {
        updateData = { Gender: value };
      } else if (field === 'dateOfBirth') {
        updateData = { DateOfBirth: value };
      }

      if (Object.keys(updateData).length > 0) {
        try {
          await updateUserProfile(profile.id, updateData);

          // Refresh user data from server after successful update
          const refreshedUserData = await checkAuthStatus();

          if (refreshedUserData) {
            // Backend trả về snake_case format
            const newProfile = {
              id: refreshedUserData.id,
              email: refreshedUserData.email,
              first_name: refreshedUserData.first_name,
              last_name: refreshedUserData.last_name,
              name: `${refreshedUserData.first_name} ${refreshedUserData.last_name}`,
              gender: refreshedUserData.gender || 'Other',
              dateOfBirth: refreshedUserData.date_of_birth || refreshedUserData.dateOfBirth || '',
              roles: refreshedUserData.roles || []
            };

            setProfile(newProfile);
          }

          Toast.show({
            type: 'success',
            text1: 'Cập nhật tên thành công'
          });
        } catch (error) {
          console.error('Error updating profile:', error);
          Toast.show({
            type: 'error',
            text1: 'Cập nhật thất bại',
            text2: error.message || 'Vui lòng thử lại sau'
          });
        }
      }
    } catch (error) {
      console.error('Error in updateProfile:', error);
      Toast.show({
        type: 'error',
        text1: 'Có lỗi xảy ra',
        text2: 'Vui lòng thử lại sau'
      });
    }
  };

  // Handle change password
  const handleChangePassword = async ({ currentPassword, newPassword }) => {
    try {
      const result = await changePassword(currentPassword, newPassword);

      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: result.message || 'Đổi mật khẩu thành công'
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      Toast.show({
        type: 'error',
        text1: 'Đổi mật khẩu thất bại',
        text2: error.message || 'Vui lòng kiểm tra lại mật khẩu hiện tại'
      });
    }
  };

  // Handle logout
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
              console.log('Admin logged out successfully');
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
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.profileInfo}>
            <ProfileAvatar name={profile.name} size="lg" />
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>{profile.name}</Text>
              <Text style={styles.infoText}>Giới tính: {profile.gender}</Text>
              <Text style={styles.infoText}>Ngày sinh: {profile.dateOfBirth || 'Chưa có thông tin'}</Text>
              <Text style={styles.infoText}>Role: Admin</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Editable Sections */}
      <View style={styles.sections}>
        <View style={styles.viewOnlySection}>
          <View style={styles.sectionHeader}>
            <Icon name="mail" size={16} color="#666" />
            <Text style={styles.sectionTitle}>E-mail</Text>
            <Text style={styles.sectionValue}>{profile.email}</Text>
          </View>
        </View>

        <EditableSection
          title="Tên tài khoản"
          value={profile.name}
          onSave={(value) => updateProfile('name', value)}
          icon={<Icon name="user" size={16} color="#666" />}
        />

        <GenderSection
          title="Giới tính"
          value={profile.gender}
          onSave={(value) => updateProfile('gender', value)}
          icon={<Icon name="users" size={16} color="#666" />}
        />

        <DateOfBirthSection
          title="Ngày sinh"
          value={profile.dateOfBirth}
          onSave={(value) => updateProfile('dateOfBirth', value)}
          icon={<Icon name="calendar" size={16} color="#666" />}
        />

        <PasswordSection
          title="Mật khẩu"
          onSave={handleChangePassword}
          icon={<Icon name="lock" size={16} color="#666" />}
        />
      </View>

      {/* Logout Button */}
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </Pressable>

      <Toast />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
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
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  profileInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  textContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  sections: {
    marginTop: 24,
  },
  viewOnlySection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  sectionValue: {
    fontSize: 14,
    color: '#666',
    marginLeft: 24,
  },
  logoutButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 24,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export { AdminAccount as Account };
