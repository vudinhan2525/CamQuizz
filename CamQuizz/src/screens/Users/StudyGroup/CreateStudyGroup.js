import React, { useState, useEffect } from 'react';
import {ScrollView, View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constant/colors';
import GroupService from '../../../services/GroupService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CreateStudyGroup = ({ navigation }) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  // Fetch user ID from AsyncStorage
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Lỗi', 'Không thể lấy thông tin người dùng');
      }
    };

    fetchUserId();
  }, []);

  const handleAddEmail = () => {
    if (email.trim()) {
      setEmails([...emails, email.trim()]);
      setEmail('');
    }
  };

  const handleRemoveEmail = (index) => {
    const newEmails = emails.filter((_, i) => i !== index);
    setEmails(newEmails);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên nhóm');
      return;
    }

    if (!userId) {
      Alert.alert('Lỗi', 'Không thể xác định người dùng. Vui lòng đăng nhập lại.');
      return;
    }

    setLoading(true);

    try {
      const groupData = {
        name: groupName.trim(),
        description: description.trim(),
        ownerId: userId
      };

      const response = await GroupService.createGroup(groupData);

      console.log('Nhóm đã được tạo:', response);

      if (emails.length > 0) {
        console.log('Mời thành viên với email:', emails);
      }

      Alert.alert(
        'Thành công',
        'Nhóm học tập đã được tạo thành công',
        [{
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          }
        }]
      );
    } catch (error) {
      console.error('Lỗi khi tạo nhóm:', error);

      // Hiển thị thông báo lỗi chi tiết hơn
      let errorMessage = error.message || 'Không thể tạo nhóm học tập. Vui lòng thử lại sau.';

      // Hiển thị thông báo lỗi dựa trên thông tin từ API
      // Thông báo lỗi đã được xử lý chi tiết trong GroupService.js
      console.log('Error message from API:', errorMessage);

      console.log('Hiển thị thông báo lỗi:', errorMessage);

      Alert.alert(
        'Lỗi',
        errorMessage,
        [
          {
            text: 'OK',
            onPress: () => console.log('Error alert closed')
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.BLACK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo nhóm học tập</Text>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.BLUE} />
        ) : (
          <TouchableOpacity
            disabled={!groupName.trim() || loading}
            style={groupName.trim() && !loading ? styles.saveButton : styles.saveButtonDisabled}
            onPress={handleCreateGroup}>
            <Text style={styles.saveButtonText}>Lưu</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tên nhóm học tập</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên nhóm học tập"
            value={groupName}
            onChangeText={setGroupName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mô tả</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Nhập mô tả về nhóm học tập (không bắt buộc)"
            value={description}
            onChangeText={setDescription}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mời thành viên</Text>
          <View style={styles.emailInputContainer}>
            <TextInput
              style={styles.emailInput}
              placeholder="Nhập email thành viên"
              value={email}
              onChangeText={setEmail}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddEmail}
            >
              <Text style={styles.addButtonText}>Mời</Text>
            </TouchableOpacity>
          </View>
        </View>

        {emails.length > 0 && (
          <View style={styles.emailList}>
            {emails.map((item, index) => (
              <View key={index} style={styles.emailItem}>
                <Text style={styles.emailText}>{item}</Text>
                <TouchableOpacity onPress={() => handleRemoveEmail(index)}>
                  <Ionicons name="close-circle" size={20} color={COLORS.BLUE} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <View style={{ height: 20 }} />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  saveButton: {
    padding: 8,
    borderRadius: 4,
  },
  saveButtonText: {
    color: COLORS.BLUE,
    fontSize: 16,
    fontWeight: '500',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.BLUE,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  emailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emailInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: COLORS.BLUE,
    padding: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  emailList: {
    marginBottom: 16,
  },
  emailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BLUE_LIGHT,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: COLORS.BLUE,
  },
  emailText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.BLUE,
  },
  saveButtonDisabled:{
    opacity:0.5,
  }
});