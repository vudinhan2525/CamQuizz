import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ToachableOpacity
} from 'react-native';
import COLORS from '../../../constant/colors';
import { Ionicons } from '@expo/vector-icons';
import SCREENS from '../../index'
import PackageService from '../../../services/PackageService';

import Toast from 'react-native-toast-message';
export const Package = ({ navigation }) => {
  const [packages, setPackages] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [editedPackage, setEditedPackage] = useState({
    name: '',
    max_number_of_quizz: 0,
    max_number_of_attended: 0,
    price: 0,
    duration: 30,
  });
  const fetchPackages = async () => {
    try {
      // Simulate fetching packages from an API
      const packagesData = await PackageService.getAllPackages();
      console.log('Fetched packages:', packagesData);
      setPackages(packagesData);
    } catch (error) {
      console.error('Error fetching packages:', error);
      Alert.alert('Error', 'Không thể tải gói dịch vụ. Vui lòng thử lại sau.');
    }
  };
  React.useEffect(() => {
    fetchPackages();
  }, []);




  const handleEditPackage = (pkg) => {
    setSelectedPackage(pkg);
    setEditedPackage({
      name: pkg.name || '',
      price: pkg.price || 0,
      max_number_of_quizz: pkg.max_number_of_quizz || 0,
      max_number_of_attended: pkg.max_number_of_attended || 0,
    });
    setEditModalVisible(true);
  };

  const handleSavePackage = async () => {
    try {
      if (!editedPackage.name.trim()) {
        Alert.alert('Lỗi', 'Tên gói không được để trống');
        return;
      }

      if (editedPackage.price > 50000000 ||editedPackage.price< 1000 ) {
        Alert.alert('Lỗi', 'Giá gói không được từ 1000 đồng đến 50 triệu');
        return;
      }

      if (editedPackage.max_number_of_quizz <= 0) {
        Alert.alert('Lỗi', 'Số quiz tối đa phải lớn hơn 0');
        return;
      }

      if (editedPackage.max_number_of_attended <= 0) {
        Alert.alert('Lỗi', 'Số người tham gia tối đa phải lớn hơn 0');
        return;
      }
      const packageData = {
        id: selectedPackage.id,
        name: editedPackage.name,
        price: editedPackage.price,
        max_number_of_quizz: editedPackage.max_number_of_quizz,
        max_number_of_attended: editedPackage.max_number_of_attended,
        start_date: selectedPackage.start_date,
        end_date: selectedPackage.end_date,
      }
      // Call API to update package
      const updatePkt = await PackageService.updatePackage(selectedPackage.id, {
        id: selectedPackage.id,
        name: editedPackage.name,
        price: editedPackage.price,
        max_number_of_quizz: editedPackage.max_number_of_quizz,
        max_number_of_attended: editedPackage.max_number_of_attended,
        start_date: selectedPackage.start_date,
        end_date: selectedPackage.end_date,
      });
      console.log('Saving package data:', packageData);

      console.log('Updated package:', updatePkt);


      Alert.alert('Thành công', `Gói ${editedPackage.name} đã được cập nhật`);
      setEditModalVisible(false);

      // Refresh package list
      const updatedPackages = await PackageService.getAllPackages();
      console.log('Updated packages:', updatedPackages);
      setPackages(updatedPackages);

    } catch (error) {
      console.error('Error updating package:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật gói dịch vụ. Vui lòng thử lại sau.');
    }
  };



  const renderPackageItem = ({ item }) => (
    <View style={styles.packageCard}>
      <View style={styles.packageHeader}>
        <View>
          <Text style={styles.packageName}>{item.name}</Text>
          <Text style={styles.packagePrice}>
            {item.price === 0 ? 'Miễn phí' : `${item.price?.toLocaleString('vi-VN')} VNĐ`}
          </Text>
        </View>
        <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
          {item.price !== 0 && (
            <TouchableOpacity
              style={styles.editIconButton}
              onPress={() => handleDeletePackage(item.id, item.name)}

            >
              <Ionicons name="close" size={24} color={COLORS.RED} />
            </TouchableOpacity>)}
          <TouchableOpacity
            style={styles.editIconButton}
            onPress={() => handleEditPackage(item)}
          >
            <Ionicons name="create-outline" size={24} color={COLORS.BLUE} />
          </TouchableOpacity>

        </View>
      </View>

      <View style={styles.packageDetails}>
        <View style={styles.limitsContainer}>
          <View style={styles.limitItem}>
            <Text style={styles.limitLabel}>Số quiz tối đa:</Text>
            <Text style={styles.limitValue}>{item.max_number_of_quizz}</Text>
          </View>
          <View style={styles.limitItem}>
            <Text style={styles.limitLabel}>Số người tham gia tối đa:</Text>
            <Text style={styles.limitValue}>{item.max_number_of_attended}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderEditModal = () => (
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
            <Text style={styles.modalTitle}>Chỉnh sửa gói dịch vụ</Text>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Ionicons name="close" size={24} color={COLORS.BLACK} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {selectedPackage?.price !== 0 ? (<View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên gói:</Text>
              <TextInput
                style={styles.input}
                value={editedPackage.name}
                onChangeText={(text) => setEditedPackage(prev => ({ ...prev, name: text }))}
                placeholder="Nhập tên gói"
              />
            </View>) :
              (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Tên gói:</Text>
                  <TextInput
                    style={styles.input}
                    value={'Mặc định'}
                    placeholder="Nhập tên gói"
                    editable={false}
                  />
                </View>
              )}

            {selectedPackage?.price !== 0 && <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Giá (VNĐ):</Text>
              <TextInput
                style={styles.input}
                value={editedPackage.price?.toString()}
                onChangeText={(text) => {
                  const numValue = text === '' ? 0 : parseInt(text.replace(/[^0-9]/g, ''), 10);
                  setEditedPackage(prev => ({ ...prev, price: isNaN(numValue) ? 0 : numValue }));
                }}
                keyboardType="numeric"
                placeholder="Nhập giá gói"
                
              />
            </View>}



            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Số quiz tối đa:</Text>
              <TextInput
                style={styles.input}
                value={editedPackage.max_number_of_quizz?.toString()}
                onChangeText={(text) => {
                  const numValue = text === '' ? 0 : parseInt(text.replace(/[^0-9]/g, ''), 10);
                  setEditedPackage(prev => ({ ...prev, max_number_of_quizz: isNaN(numValue) ? 0 : numValue }));
                }}
                keyboardType="numeric"
                placeholder="Nhập số quiz tối đa"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Số người tham gia tối đa:</Text>
              <TextInput
                style={styles.input}
                value={editedPackage.max_number_of_attended?.toString()}
                onChangeText={(text) => {
                  const numValue = text === '' ? 0 : parseInt(text.replace(/[^0-9]/g, ''), 10);
                  setEditedPackage(prev => ({ ...prev, max_number_of_attended: isNaN(numValue) ? 0 : numValue }));
                }}
                keyboardType="numeric"
                placeholder="Nhập số người tham gia tối đa"
              />
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSavePackage}
          >
            <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  const handleCreatePackage = useCallback(() => {
    navigation.navigate(SCREENS.CREATE_PACKAGE);
  }, [navigation]);

  const handleViewRevenue = useCallback(() => {
    navigation.navigate(SCREENS.REVENUE);
  }, [navigation]);

  const handleDeletePackage = async (packageId, packageName) => {
    try {
      Alert.alert(
        'Xác nhận xóa',
        `Bạn có chắc chắn muốn xóa gói "${packageName}"?`,
        [
          {
            text: 'Hủy',
            style: 'cancel',
          },
          {
            text: 'Xóa',
            style: 'destructive',
            onPress: async () => {
              try {
                // Call API to delete package
                await PackageService.deletePackage(packageId);

                // Update local state
                setPackages(prevPackages =>
                  prevPackages.filter(pkg => pkg.id !== packageId)
                );

                // Refresh package list to ensure sync with server
                const updatedPackages = await PackageService.getAllPackages();
                setPackages(updatedPackages);

                Toast.show({
                  type: 'success',
                  text1: 'Thành công',
                  text2: `Đã xóa gói ${packageName}`,
                });
              } catch (error) {
                console.error('Error deleting package:', error);
                Toast.show({
                  type: 'error',
                  text1: 'Lỗi',
                  text2: 'Không thể xóa gói dịch vụ. Vui lòng thử lại sau.',
                });
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('Error handling delete:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
      });
    }
  };

  return (
    <View style={styles.container}>


      <View style={[styles.statsContainer, { flexDirection: 'row', justifyContent: 'space-between' }]}>
        <TouchableOpacity
          style={{ backgroundColor: COLORS.BLUE, padding: 8, borderRadius: 8, flex: 1, marginHorizontal: 4 }}
          onPress={handleCreatePackage}
        >
          <Text style={{ color: COLORS.WHITE, textAlign: 'center' }}>Tạo gói</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: COLORS.BLUE, padding: 8, borderRadius: 8, flex: 1, marginHorizontal: 4 }}
          onPress={handleViewRevenue}
        >
          <Text style={{ color: COLORS.WHITE, textAlign: 'center' }}>Xem báo cáo</Text>
        </TouchableOpacity>
      </View>



      <FlatList
        data={packages}
        ListHeaderComponent={<Text style={{ color: COLORS.BLUE, textAlign: 'left', marginBottom: 12 }}>{packages.length} <Text style={{ color: COLORS.BLACK }}>gói</Text></Text>}
        renderItem={renderPackageItem}
        keyExtractor={item => item.id?.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube" size={60} color={COLORS.GRAY_LIGHT} />
            <Text style={styles.emptyText}>Không tìm thấy gói dịch vụ</Text>
          </View>
        }
      />

      {renderEditModal()}
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
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.WHITE,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.BLUE_LIGHT,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.BLUE,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.BLACK,
    textAlign: 'center',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  packageCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT + '30',
    paddingBottom: 12,
  },
  packageName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 16,
    color: COLORS.BLUE,
    fontWeight: '500',
  },
  packageBadges: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  featuredBadge: {
    backgroundColor: COLORS.BLUE,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 4,
  },
  featuredText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: '500',
  },
  packageDetails: {
    marginBottom: 16,
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageDuration: {
    fontSize: 14,
    color: COLORS.BLACK,
  },
  editIconButton: {
    padding: 4,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.BLACK,
    marginBottom: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.BLACK,
    marginLeft: 8,
  },
  packageActions: {
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_LIGHT + '30',
    paddingTop: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 14,
    color: COLORS.BLACK,
    marginRight: 8,
  },
  editButton: {
    backgroundColor: COLORS.BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 8,
  },
  editButtonText: {
    color: COLORS.WHITE,
    marginLeft: 4,
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
    borderBottomColor: COLORS.GRAY_LIGHT + '30',
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
    backgroundColor: COLORS.GRAY_BG,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  featureEditItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.GRAY_BG,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  featureEditText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.BLACK,
  },
  addFeatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  featureInput: {
    flex: 1,
    backgroundColor: COLORS.GRAY_BG,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  addFeatureButton: {
    backgroundColor: COLORS.BLUE,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  limitsContainer: {
    marginTop: 12,
  },
  limitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  limitLabel: {
    fontSize: 14,
    color: COLORS.GRAY,
  },
  limitValue: {
    fontSize: 14,
    color: COLORS.BLACK,
    fontWeight: '500',
  },
});
export default Package;