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
  Switch,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import COLORS from '../../constant/colors';
import { Ionicons } from '@expo/vector-icons';

export const Package = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [editedPackage, setEditedPackage] = useState({
    name: '',
    price: 0,
    duration: 30,
    features: []
  });
  const [newFeature, setNewFeature] = useState('');

  // Mock data for development
  const mockPackages = [
    {
      id: 1,
      name: 'Gói Cơ Bản',
      price: 0,
      duration: 30, // days
      features: ['Tạo 5 bài kiểm tra', 'Tham gia không giới hạn', 'Xem báo cáo cơ bản'],
      isActive: true,
      isFeatured: false
    },
    {
      id: 2,
      name: 'Gói Nâng Cao',
      price: 99000,
      duration: 30,
      features: ['Tạo không giới hạn bài kiểm tra', 'Tham gia không giới hạn', 'Xem báo cáo chi tiết', 'Tạo nhóm học tập'],
      isActive: true,
      isFeatured: true
    },
    {
      id: 3,
      name: 'Gói Premium',
      price: 199000,
      duration: 30,
      features: ['Tất cả tính năng của gói Nâng Cao', 'Ưu tiên hỗ trợ', 'Xuất báo cáo PDF', 'Tùy chỉnh giao diện'],
      isActive: true,
      isFeatured: true
    },
    {
      id: 4,
      name: 'Gói Doanh Nghiệp',
      price: 499000,
      duration: 30,
      features: ['Tất cả tính năng của gói Premium', 'Quản lý nhóm', 'API tích hợp', 'Hỗ trợ 24/7'],
      isActive: false,
      isFeatured: false
    }
  ];

  useEffect(() => {
    fetchPackages();
  }, [searchQuery]);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      // Mock API response
      await new Promise(resolve => setTimeout(resolve, 500));

      // Filter mock data based on search query
      let filteredPackages = [...mockPackages];

      if (searchQuery) {
        filteredPackages = filteredPackages.filter(pkg =>
          pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setPackages(filteredPackages);
    } catch (error) {
      console.error('Error fetching packages:', error);
      Alert.alert('Error', 'Failed to load packages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchPackages();
  };

  const togglePackageStatus = (id) => {
    setPackages(prevPackages =>
      prevPackages.map(pkg =>
        pkg.id === id ? { ...pkg, isActive: !pkg.isActive } : pkg
      )
    );

    const pkg = packages.find(p => p.id === id);
    if (pkg) {
      Alert.alert('Success', `Gói ${pkg.name} đã được ${!pkg.isActive ? 'kích hoạt' : 'vô hiệu hóa'}`);
    }
  };

  const toggleFeatured = (id) => {
    setPackages(prevPackages =>
      prevPackages.map(pkg =>
        pkg.id === id ? { ...pkg, isFeatured: !pkg.isFeatured } : pkg
      )
    );

    const pkg = packages.find(p => p.id === id);
    if (pkg) {
      Alert.alert('Success', `Gói ${pkg.name} đã ${!pkg.isFeatured ? 'được' : 'bị hủy'} đánh dấu nổi bật`);
    }
  };

  const handleEditPackage = (pkg) => {
    setSelectedPackage(pkg);
    setEditedPackage({
      name: pkg.name,
      price: pkg.price,
      duration: pkg.duration,
      features: [...pkg.features]
    });
    setEditModalVisible(true);
  };

  const handleSavePackage = () => {
    if (!editedPackage.name.trim()) {
      Alert.alert('Lỗi', 'Tên gói không được để trống');
      return;
    }

    if (editedPackage.price < 0) {
      Alert.alert('Lỗi', 'Giá gói không được âm');
      return;
    }

    if (editedPackage.duration <= 0) {
      Alert.alert('Lỗi', 'Thời hạn gói phải lớn hơn 0');
      return;
    }

    if (editedPackage.features.length === 0) {
      Alert.alert('Lỗi', 'Gói phải có ít nhất một tính năng');
      return;
    }

    setPackages(prevPackages =>
      prevPackages.map(pkg =>
        pkg.id === selectedPackage.id ? {
          ...pkg,
          name: editedPackage.name,
          price: editedPackage.price,
          duration: editedPackage.duration,
          features: editedPackage.features
        } : pkg
      )
    );

    Alert.alert('Thành công', `Gói ${editedPackage.name} đã được cập nhật`);
    setEditModalVisible(false);
  };

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;

    setEditedPackage(prev => ({
      ...prev,
      features: [...prev.features, newFeature.trim()]
    }));

    setNewFeature('');
  };

  const handleRemoveFeature = (index) => {
    setEditedPackage(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const renderPackageItem = ({ item }) => (
    <View style={styles.packageCard}>
      <View style={styles.packageHeader}>
        <View>
          <Text style={styles.packageName}>{item.name}</Text>
          <Text style={styles.packagePrice}>
            {item.price === 0 ? 'Miễn phí' : `${item.price.toLocaleString('vi-VN')} VNĐ`}
          </Text>
        </View>
        <View style={styles.packageBadges}>
          {item.isFeatured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>Nổi bật</Text>
            </View>
          )}
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.isActive ? COLORS.GREEN : COLORS.ORANGE }
          ]}>
            <Text style={styles.statusText}>
              {item.isActive ? 'Hoạt động' : 'Vô hiệu'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.packageDetails}>
        <View style={styles.durationRow}>
          <Text style={styles.packageDuration}>Thời hạn: {item.duration} ngày</Text>
          <TouchableOpacity
            style={styles.editIconButton}
            onPress={() => handleEditPackage(item)}
          >
            <Ionicons name="create-outline" size={24} color={COLORS.BLUE} />
          </TouchableOpacity>
        </View>
        <Text style={styles.featuresTitle}>Tính năng:</Text>
        {item.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.BLUE} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <View style={styles.packageActions}>
        <View style={styles.actionRow}>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Trạng thái:</Text>
            <Switch
              value={item.isActive}
              onValueChange={() => togglePackageStatus(item.id)}
              trackColor={{ false: COLORS.GRAY_LIGHT, true: COLORS.GREEN }}
              thumbColor={COLORS.WHITE}
            />
          </View>

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Nổi bật:</Text>
            <Switch
              value={item.isFeatured}
              onValueChange={() => toggleFeatured(item.id)}
              trackColor={{ false: COLORS.GRAY_LIGHT, true: COLORS.BLUE }}
              thumbColor={COLORS.WHITE}
            />
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
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên gói:</Text>
              <TextInput
                style={styles.input}
                value={editedPackage.name}
                onChangeText={(text) => setEditedPackage(prev => ({ ...prev, name: text }))}
                placeholder="Nhập tên gói"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Giá (VNĐ):</Text>
              <TextInput
                style={styles.input}
                value={editedPackage.price.toString()}
                onChangeText={(text) => {
                  const numValue = text === '' ? 0 : parseInt(text.replace(/[^0-9]/g, ''), 10);
                  setEditedPackage(prev => ({ ...prev, price: isNaN(numValue) ? 0 : numValue }));
                }}
                keyboardType="numeric"
                placeholder="Nhập giá gói"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Thời hạn (ngày):</Text>
              <TextInput
                style={styles.input}
                value={editedPackage.duration.toString()}
                onChangeText={(text) => {
                  const numValue = text === '' ? 0 : parseInt(text.replace(/[^0-9]/g, ''), 10);
                  setEditedPackage(prev => ({ ...prev, duration: isNaN(numValue) ? 0 : numValue }));
                }}
                keyboardType="numeric"
                placeholder="Nhập thời hạn gói"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tính năng:</Text>
              {editedPackage.features.map((feature, index) => (
                <View key={index} style={styles.featureEditItem}>
                  <Text style={styles.featureEditText}>{feature}</Text>
                  <TouchableOpacity onPress={() => handleRemoveFeature(index)}>
                    <Ionicons name="close-circle" size={20} color={COLORS.RED} />
                  </TouchableOpacity>
                </View>
              ))}

              <View style={styles.addFeatureContainer}>
                <TextInput
                  style={styles.featureInput}
                  value={newFeature}
                  onChangeText={setNewFeature}
                  placeholder="Thêm tính năng mới"
                />
                <TouchableOpacity
                  style={styles.addFeatureButton}
                  onPress={handleAddFeature}
                >
                  <Ionicons name="add" size={20} color={COLORS.WHITE} />
                </TouchableOpacity>
              </View>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* <Text style={styles.title}>Quản lý gói dịch vụ</Text> */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm gói..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={20} color={COLORS.WHITE} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{packages.length}</Text>
          <Text style={styles.statLabel}>Tổng số gói</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {packages.filter(pkg => pkg.isActive).length}
          </Text>
          <Text style={styles.statLabel}>Gói đang hoạt động</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {packages.filter(pkg => pkg.isFeatured).length}
          </Text>
          <Text style={styles.statLabel}>Gói nổi bật</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.BLUE} />
        </View>
      ) : (
        <FlatList
          data={packages}
          renderItem={renderPackageItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube" size={60} color={COLORS.GRAY_LIGHT} />
              <Text style={styles.emptyText}>Không tìm thấy gói dịch vụ</Text>
            </View>
          }
        />
      )}

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
    marginBottom: 8,
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
  }
});
