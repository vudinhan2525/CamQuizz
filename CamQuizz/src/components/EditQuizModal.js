import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal,Image, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Dropdown } from 'react-native-element-dropdown';
import COLORS from '../constant/colors';
import GenreService from '../services/GenreService';

const EditQuizModal = ({ visible, quiz, onClose, onSave, onDelete }) => {
  const [quizData, setQuizData] = useState({
    id: '',
    name: '',
    image: '',
    genreId: null,
    status: 'Public'
  });
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const statusOptions = [
    { label: 'Công khai', value: 'Public' },
    { label: 'Riêng tư', value: 'Private' },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await GenreService.getAllGenres();
        const categoriesData = response.data.map(item => ({
          label: item.name,
          value: item.id,
        }));
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        Alert.alert('Lỗi', 'Không thể tải danh sách chủ đề');
      }
    };

    if (visible) {
      fetchCategories();
    }
  }, [visible]);

  useEffect(() => {
    if (quiz && visible) {
      setQuizData({
        id: quiz.id,
        name: quiz.name || '',
        image: quiz.image || '',
        genreId: quiz.genre_id || quiz.genreId || null,
        status: quiz.status || 'Public'
      });
      setImageUri(quiz.image ? { uri: quiz.image } : null);
    }
  }, [quiz, visible]);

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Ứng dụng cần quyền truy cập thư viện ảnh!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri({ uri: result.assets[0].uri });
      setQuizData(prev => ({
        ...prev,
        image: result.assets[0].uri
      }));
    }
  };

  const handleRemoveImage = () => {
    setImageUri(null);
    setQuizData(prev => ({
      ...prev,
      image: ''
    }));
  };

  const handleSave = async () => {
    if (!quizData.name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên bài kiểm tra');
      return;
    }

    if (!quizData.genreId) {
      Alert.alert('Lỗi', 'Vui lòng chọn chủ đề');
      return;
    }

    setLoading(true);
    try {
      await onSave(quizData);
      onClose();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật bài kiểm tra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa bài kiểm tra "${quizData.name}"?`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            if (onDelete) {
              onDelete(quizData.id);
              onClose();
            }
          },
        },
      ],
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.BLACK} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chỉnh sửa bài kiểm tra</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={handleDelete}
                disabled={loading}
                style={styles.deleteButton}
              >
                <Text style={[
                  styles.deleteButtonText,
                  loading && styles.saveButtonDisabled
                ]}>
                  Xóa
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={loading || !quizData.name.trim() || !quizData.genreId}
                style={styles.saveButtonContainer}
              >
                <Text style={[
                  styles.saveButton,
                  (loading || !quizData.name.trim() || !quizData.genreId) && styles.saveButtonDisabled
                ]}>
                  {loading ? 'Đang lưu...' : 'Lưu'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.content}>
            {/* Image Section */}
            <View style={styles.imageSection}>
              <Text style={styles.sectionTitle}>Hình ảnh</Text>
              <TouchableOpacity style={styles.imageCard} onPress={handleImagePicker}>
                {imageUri ? (
                  <>
                    <Image source={imageUri} style={styles.image} />
                    <View style={styles.imageActions}>
                      <TouchableOpacity onPress={handleRemoveImage} style={styles.actionButton}>
                        <Ionicons name="trash-outline" size={20} color={COLORS.RED} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleImagePicker} style={styles.actionButton}>
                        <Ionicons name="create-outline" size={20} color={COLORS.BLUE} />
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={40} color={COLORS.GRAY_DARK} />
                    <Text style={styles.imagePlaceholderText}>Chọn hình ảnh</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Quiz Info Section */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Thông tin bài kiểm tra</Text>
              
              {/* Quiz Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tên bài kiểm tra <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập tên bài kiểm tra"
                  value={quizData.name}
                  onChangeText={(text) => setQuizData(prev => ({ ...prev, name: text }))}
                />
              </View>

              {/* Category */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Chủ đề <Text style={styles.required}>*</Text></Text>
                <Dropdown
                  style={styles.dropdown}
                  data={categories}
                  labelField="label"
                  valueField="value"
                  placeholder="Chọn chủ đề"
                  value={quizData.genreId}
                  onChange={(item) => setQuizData(prev => ({ ...prev, genreId: item.value }))}
                  renderLeftIcon={() => (
                    <Ionicons name="library-outline" size={20} color={COLORS.GRAY_DARK} style={{ marginRight: 8 }} />
                  )}
                />
              </View>

              {/* Status */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Trạng thái</Text>
                <Dropdown
                  style={styles.dropdown}
                  data={statusOptions}
                  labelField="label"
                  valueField="value"
                  placeholder="Chọn trạng thái"
                  value={quizData.status}
                  onChange={(item) => setQuizData(prev => ({ ...prev, status: item.value }))}
                  renderLeftIcon={() => (
                    <Ionicons 
                      name={quizData.status === 'Public' ? 'globe-outline' : 'lock-closed-outline'} 
                      size={20} 
                      color={COLORS.GRAY_DARK} 
                      style={{ marginRight: 8 }} 
                    />
                  )}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    flex: 1,
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: COLORS.RED + '10',
  },
  deleteButtonText: {
    fontSize: 16,
    color: COLORS.RED,
    fontWeight: '600',
  },
  saveButtonContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: COLORS.BLUE + '10',
  },
  saveButton: {
    fontSize: 16,
    color: COLORS.BLUE,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    color: COLORS.GRAY_LIGHT,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginTop: 20,
    marginBottom: 12,
  },
  imageSection: {
    marginBottom: 20,
  },
  imageCard: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.GRAY_BG,
    minHeight: 150,
  },
  image: {
    width: '100%',
    height: 150,
  },
  imageActions: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 150,
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: COLORS.GRAY_DARK,
    fontSize: 14,
  },
  infoSection: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.BLACK,
    marginBottom: 8,
  },
  required: {
    color: COLORS.RED,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: COLORS.WHITE,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: COLORS.WHITE,
  },
});

export default EditQuizModal;
