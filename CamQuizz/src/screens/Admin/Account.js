import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Button
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../../constant/colors';
import { Ionicons } from 'react-native-vector-icons';
import { checkAuthStatus, logout, updateUserProfile } from '../../services/AuthService';

export const Account = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedUser, setEditedUser] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: new Date()
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    // Lấy thông tin người dùng khi component mount
    const getUserData = async () => {
      const data = await checkAuthStatus();
      setUserData(data);

      if (data) {
        setEditedUser({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          gender: data.gender || '',
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : new Date()
        });
      }
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

  const handleEditProfile = () => {
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    try {
      if (!userData || !userData.id) {
        Alert.alert('Lỗi', 'Không thể xác định người dùng');
        return;
      }

      const updateData = {
        firstName: editedUser.firstName,
        lastName: editedUser.lastName,
        gender: editedUser.gender,
        dateOfBirth: formatDateForAPI(editedUser.dateOfBirth)
      };

      await updateUserProfile(userData.id, updateData);

      // Cập nhật userData để hiển thị thông tin mới
      const updatedUserData = {
        ...userData,
        first_name: editedUser.firstName,
        last_name: editedUser.lastName,
        gender: editedUser.gender,
        dateOfBirth: editedUser.dateOfBirth
      };

      setUserData(updatedUserData);
      setEditModalVisible(false);
      Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin. Vui lòng thử lại.');
    }
  };

  const handleDateChange = () => {
    // Trong ứng dụng thực tế, bạn sẽ sử dụng DateTimePicker thực sự
    // Nhưng hiện tại, chúng ta sẽ sử dụng một cách tiếp cận đơn giản hơn

    // Tạo một ngày cố định trong quá khứ để mô phỏng việc chọn ngày
    const newDate = new Date(1990, 0, 1); // 1/1/1990
    setEditedUser(prev => ({ ...prev, dateOfBirth: newDate }));
    setShowDatePicker(false);

    Alert.alert(
      'Thông báo',
      'Đã chọn ngày: 01/01/1990\n\nLưu ý: Trong ứng dụng thực tế, bạn sẽ thấy một bộ chọn ngày tháng thực sự.'
    );
  };

  const formatDateForDisplay = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const formatDateForAPI = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const renderEditProfileModal = () => (
    <Modal
      visible={editModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setEditModalVisible(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chỉnh sửa thông tin cá nhân</Text>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Ionicons name="close" size={24} color={COLORS.BLACK} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Họ:</Text>
              <TextInput
                style={styles.input}
                value={editedUser.lastName}
                onChangeText={(text) => setEditedUser(prev => ({ ...prev, lastName: text }))}
                placeholder="Nhập họ của bạn"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên:</Text>
              <TextInput
                style={styles.input}
                value={editedUser.firstName}
                onChangeText={(text) => setEditedUser(prev => ({ ...prev, firstName: text }))}
                placeholder="Nhập tên của bạn"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Giới tính:</Text>
              <View style={styles.genderOptions}>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    editedUser.gender === 'Nam' && styles.activeGenderOption
                  ]}
                  onPress={() => setEditedUser(prev => ({ ...prev, gender: 'Nam' }))}
                >
                  <Text style={[
                    styles.genderText,
                    editedUser.gender === 'Nam' && styles.activeGenderText
                  ]}>Nam</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    editedUser.gender === 'Nữ' && styles.activeGenderOption
                  ]}
                  onPress={() => setEditedUser(prev => ({ ...prev, gender: 'Nữ' }))}
                >
                  <Text style={[
                    styles.genderText,
                    editedUser.gender === 'Nữ' && styles.activeGenderText
                  ]}>Nữ</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    editedUser.gender === 'Khác' && styles.activeGenderOption
                  ]}
                  onPress={() => setEditedUser(prev => ({ ...prev, gender: 'Khác' }))}
                >
                  <Text style={[
                    styles.genderText,
                    editedUser.gender === 'Khác' && styles.activeGenderText
                  ]}>Khác</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ngày sinh:</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {formatDateForDisplay(editedUser.dateOfBirth)}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={COLORS.BLUE} />
              </TouchableOpacity>

              {showDatePicker && (
                <View style={styles.datePickerButtons}>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={handleDateChange}
                  >
                    <Text style={styles.datePickerButtonText}>Chọn ngày</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.datePickerButton, styles.cancelButton]}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.datePickerButtonText}>Hủy</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProfile}
          >
            <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

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
        <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
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

      {renderEditProfileModal()}
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
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  modalBody: {
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.BLACK,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.LIGHT_GRAY,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  activeGenderOption: {
    backgroundColor: COLORS.BLUE,
  },
  genderText: {
    fontSize: 14,
    color: COLORS.BLACK,
  },
  activeGenderText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  dateInput: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: COLORS.BLACK,
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  datePickerButton: {
    backgroundColor: COLORS.BLUE,
    borderRadius: 8,
    padding: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.GRAY,
  },
  datePickerButtonText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: COLORS.BLUE,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '500',
  }
});
