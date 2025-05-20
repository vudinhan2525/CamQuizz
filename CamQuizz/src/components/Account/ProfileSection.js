import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import ProfileAvatar from './ProfileAvatar';
import EditableSection from './EditableSection';
import PasswordSection from './PasswordSection';
import GenderSection from './GenderSection';
import DateOfBirthSection from './DateOfBirthSection';
import { logout, checkAuthStatus, updateUserProfile } from '../../services/AuthService';
import COLORS from '../../constant/colors';

const ProfileSection = () => {
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
          setProfile({
            id: userData.id,
            name: `${userData.first_name} ${userData.last_name}`,
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            gender: userData.gender || 'Other',
            dateOfBirth: userData.dateOfBirth || userData.date_of_birth || '',
            roles: userData.roles || [],
          });

          console.log('Profile data set:', {
            gender: userData.gender,
            dateOfBirth: userData.dateOfBirth,
            date_of_birth: userData.date_of_birth
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

  const updateProfile = async (field, value) => {
    try {
      if (field === 'name') {
        // Split the name into first name and last name
        const nameParts = value.trim().split(' ');
        const lastName = nameParts.pop(); // Last word is the last name
        const firstName = nameParts.join(' '); // Rest is the first name

        if (!firstName || !lastName) {
          Toast.show({
            type: 'error',
            text1: 'Tên không hợp lệ',
            text2: 'Vui lòng nhập cả họ và tên'
          });
          return;
        }

        // Update the profile state
        setProfile(prev => ({
          ...prev,
          [field]: value,
          first_name: firstName,
          last_name: lastName
        }));

        // Call API to update user profile
        if (profile.id) {
          const updateData = {
            FirstName: firstName,
            LastName: lastName
          };

          await updateUserProfile(profile.id, updateData);

          Toast.show({
            type: 'success',
            text1: 'Cập nhật tên thành công'
          });
        }
      } else if (field === 'gender') {
        // Update gender
        setProfile(prev => ({ ...prev, gender: value }));

        // Call API to update user profile
        if (profile.id) {
          const updateData = {
            Gender: value  // Note: Using PascalCase for API
          };

          await updateUserProfile(profile.id, updateData);

          Toast.show({
            type: 'success',
            text1: 'Cập nhật giới tính thành công'
          });
        }
      } else if (field === 'dateOfBirth') {
        // Update date of birth
        setProfile(prev => ({ ...prev, dateOfBirth: value }));

        // Call API to update user profile
        if (profile.id) {
          const updateData = {
            DateOfBirth: value // Format: YYYY-MM-DD, using PascalCase for API
          };

          await updateUserProfile(profile.id, updateData);

          Toast.show({
            type: 'success',
            text1: 'Cập nhật ngày sinh thành công'
          });
        }
      } else {
        // For other fields, just update the state
        setProfile(prev => ({ ...prev, [field]: value }));

        Toast.show({
          type: 'success',
          text1: `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Không thể cập nhật thông tin',
        text2: error.message || 'Vui lòng thử lại sau'
      });
    }
  };

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
            console.log('Navigating to Root after logout');

            // Đảm bảo reset toàn bộ stack điều hướng
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
              <Text style={styles.infoText}>Role: {profile.roles && profile.roles.length > 0 ? profile.roles[0] : 'User'}</Text>
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
          onSave={({ currentPassword, newPassword }) => {
            // This will be implemented later when the API is available
            Toast.show({
              type: 'info',
              text1: 'Chức năng đang phát triển',
              text2: 'Tính năng thay đổi mật khẩu sẽ được cập nhật sau'
            });
            console.log('Password change requested:', { currentPassword, newPassword });
          }}
          icon={<Icon name="lock" size={16} color="#666" />}
        />
      </View>


      {/* Logout Button */}
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </Pressable>

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
    editButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      padding: 8,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: '#e5e5e5',
    },
    editButtonText: {
      color: '#007AFF',
      fontSize: 14,
    },
    gradeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 16,
      paddingHorizontal: 16,
    },
    addSubjectButton: {
      margin: 16,
      padding: 8,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: '#e5e5e5',
      alignItems: 'center',
    },
    addSubjectText: {
      color: '#007AFF',
      fontSize: 16,
    },
    studentModeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: '#e5e5e5',
    },
    studentModeText: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
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
    supportSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: '#e5e5e5',
    },
    supportHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    supportText: {
      fontSize: 16,
      fontWeight: '500',
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
    navbar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: '#e5e5e5',
    },
    navItem: {
      alignItems: 'center',
      flex: 1,
    },
    navIcon: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: '#f1f1f1',
      marginBottom: 4,
    },
    activeNavIcon: {
      backgroundColor: '#007AFF',
    },
    navLabel: {
      fontSize: 12,
    },
    activeNavLabel: {
      fontWeight: '500',
    },
  });

  export default ProfileSection;
