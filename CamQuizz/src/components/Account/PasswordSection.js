import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';

const PasswordSection = ({
  title,
  onSave,
  icon,
  style
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleSave = () => {
    if (!currentPassword || !newPassword) {
      Toast.show({
        type: 'error',
        text1: 'Vui lòng nhập đầy đủ thông tin',
        text2: 'Mật khẩu hiện tại và mật khẩu mới không được để trống'
      });
      return;
    }

    onSave({ currentPassword, newPassword });
    setIsExpanded(false);
    setCurrentPassword('');
    setNewPassword('');
  };

  const handleCancel = () => {
    setCurrentPassword('');
    setNewPassword('');
    setIsExpanded(false);
  };

  if (isExpanded) {
    return (
      <View style={[styles.container, styles.borderTop, style]}>
        <View style={styles.headerContainer}>
          {icon}
          <Text style={styles.title}>{title}</Text>
        </View>
        
        {/* Current Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Mật khẩu hiện tại</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              style={styles.input}
              secureTextEntry={!showCurrentPassword}
              placeholder="Nhập mật khẩu hiện tại"
              autoFocus
            />
            <Pressable onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
              <Icon name={showCurrentPassword ? "eye-off" : "eye"} size={20} color="#666" />
            </Pressable>
          </View>
        </View>
        
        {/* New Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Mật khẩu mới</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.input}
              secureTextEntry={!showNewPassword}
              placeholder="Nhập mật khẩu mới"
            />
            <Pressable onPress={() => setShowNewPassword(!showNewPassword)}>
              <Icon name={showNewPassword ? "eye-off" : "eye"} size={20} color="#666" />
            </Pressable>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <Pressable 
            style={[styles.button, styles.cancelButton]} 
            onPress={handleCancel}
          >
            <Icon name="x" size={16} color="#000" />
            <Text style={styles.buttonText}>Hủy</Text>
          </Pressable>
          <Pressable 
            style={[styles.button, styles.saveButton]} 
            onPress={handleSave}
          >
            <Icon name="check" size={16} color="#fff" />
            <Text style={[styles.buttonText, styles.saveButtonText]}>Lưu</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <Pressable 
      style={[styles.container, styles.borderTop, style]} 
      onPress={() => setIsExpanded(true)}
    >
      <View style={styles.rowContainer}>
        <View style={styles.headerContainer}>
          {icon}
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>********</Text>
          <Icon name="chevron-down" size={20} color="#666" />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainer: {
    marginVertical: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: 8,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  cancelButton: {
    backgroundColor: '#f1f1f1',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 14,
    color: '#000',
  },
  saveButtonText: {
    color: '#fff',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueText: {
    fontSize: 14,
    color: '#666',
  },
});

export default PasswordSection;
