import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import COLORS from '../../../constant/colors';
import PackageService from '../../../services/PackageService';

const CreatePackage = ({ navigation }) => {
  const [packageData, setPackageData] = useState({
    name: '',
    price: '',
    max_number_of_quizz: '',
    max_number_of_attended: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    try {
      if (!packageData.name.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Vui lòng nhập tên gói'
        });
        return;
      }

      // Thêm validation cho price
      if (parseInt(packageData.price) < 0) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Giá gói không được âm'
        });
        return;
      }

      if (!packageData.max_number_of_quizz || packageData.max_number_of_quizz <= 0) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Số quiz tối đa phải lớn hơn 0'
        });
        return;
      }

      if (!packageData.max_number_of_attended || packageData.max_number_of_attended <= 0) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Số người tham gia tối đa phải lớn hơn 0'
        });
        return;
      }

      setIsCreating(true);

      const createData = {
        name: packageData.name,
        price: parseInt(packageData.price) || 0,
        max_number_of_quizz: parseInt(packageData.max_number_of_quizz),
        max_number_of_attended: parseInt(packageData.max_number_of_attended),
      };

      await PackageService.createPackage(createData);
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đã tạo gói dịch vụ mới',
        visibilityTime: 1000,
        onHide: () => navigation.goBack()
      });
    } catch (error) {
      console.error('Error creating package:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể tạo gói dịch vụ. Vui lòng thử lại sau.'
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.BLUE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo gói</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Tên gói:</Text>
          <TextInput
            style={styles.input}
            value={packageData.name}
            onChangeText={(text) => setPackageData(prev => ({ ...prev, name: text }))}
            placeholder="Nhập tên gói"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Giá (VNĐ):</Text>
          <TextInput
            style={styles.input}
            value={packageData.price}
            onChangeText={(text) => {
              const numericValue = text.replace(/[^0-9]/g, '');
              // Kiểm tra và chỉ set giá trị nếu là số dương hoặc rỗng
              if (numericValue === '' || parseInt(numericValue) > 0) {
                setPackageData(prev => ({ ...prev, price: numericValue }));
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Lỗi',
                  text2: 'Giá gói phải lớn hơn 0'
                });
              }
            }}
            keyboardType="numeric"
            placeholder="Nhập giá gói"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Số quiz tối đa:</Text>
          <TextInput
            style={styles.input}
            value={packageData.max_number_of_quizz}
            onChangeText={(text) => {
              const numericValue = text.replace(/[^0-9]/g, '');
              setPackageData(prev => ({ ...prev, max_number_of_quizz: numericValue }));
            }}
            keyboardType="numeric"
            placeholder="Nhập số quiz tối đa"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Số người tham gia tối đa:</Text>
          <TextInput
            style={styles.input}
            value={packageData.max_number_of_attended}
            onChangeText={(text) => {
              const numericValue = text.replace(/[^0-9]/g, '');
              setPackageData(prev => ({ ...prev, max_number_of_attended: numericValue }));
            }}
            keyboardType="numeric"
            placeholder="Nhập số người tham gia tối đa"
          />
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.createButton,
            (isCreating) && styles.createButtonDisabled
          ]}
          onPress={handleCreate}
          disabled={isCreating}
        >
          <Text style={styles.createButtonText}>
            {isCreating ? 'Đang tạo...' : 'Tạo gói'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.BLUE,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
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
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_BG,
  },
  createButton: {
    backgroundColor: COLORS.BLUE,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CreatePackage;