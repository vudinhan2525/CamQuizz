import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import EditableField from './EditableField';
import ProfileAvatar from './ProfileAvatar';
import EditableSection from './EditableSection';
import { Switch } from 'react-native';
import { logout } from '../../services/AuthService';

const ProfileSection = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState({
    name: 'Nguyen Van A',
    description: 'Other',
    email: '123456@gmail.com',
  });

  const updateProfile = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    Toast.show({
      type: 'success',
      text1: `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`
    });
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
              <EditableField 
                value={profile.name} 
                // onSave={(value) => updateProfile('name', value)}
                style={styles.nameText}
                icon={false}
              />
              <EditableField 
                value={profile.description} 
                onSave={(value) => updateProfile('description', value)}
              />
              <EditableField 
                value={profile.email} 
                // onSave={(value) => updateProfile('email', value)}
                icon={false}
              />
            </View>
          </View>
        </View>

        {/* <View style={styles.gradeContainer}>
          <Icon name="award" size={20} color="#666" />
          <EditableField 
            value={profile.grade} 
            onSave={(value) => updateProfile('grade', value)}
            icon={false}
          />
        </View>

        <Pressable style={styles.addSubjectButton}>
          <Text style={styles.addSubjectText}>+ Thêm môn học</Text>
        </Pressable>

        <View style={styles.studentModeContainer}>
          <View style={styles.studentModeText}>
            <Icon name="repeat" size={20} color="#666" />
            <Text>Chuyển sang chế độ sinh viên</Text>
          </View>
          <Switch
            value={profile.isStudent}
            onValueChange={(value) => updateProfile('isStudent', value)}
          />
        </View> */}
      </View>

      {/* Editable Sections */}
      <View style={styles.sections}>
        <EditableSection
          title="E-mail"
          value={profile.email}
          onSave={(value) => updateProfile('email', value)}
          icon={<Icon name="mail" size={16} color="#666" />}
        />
        
        <EditableSection
          title="Tên tài khoản"
          value={profile.name}
          onSave={(value) => updateProfile('name', value)}
          icon={<Icon name="user" size={16} color="#666" />}
        />
        
        <EditableSection
          title="Mật khẩu"
          value="********"
          onSave={() => Toast.show({
            type: 'success',
            text1: 'Password updated successfully'
          })}
          icon={<Icon name="lock" size={16} color="#666" />}
        />
        
      </View>

      {/* Support Section */}
      <Pressable style={styles.supportSection}>
        <View style={styles.supportHeader}>
          <Icon name="help-circle" size={16} color="#666" />
          <Text style={styles.supportText}>Hỗ trợ</Text>
        </View>
        <Icon name="chevron-down" size={16} color="#666" />
      </Pressable>

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
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
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
