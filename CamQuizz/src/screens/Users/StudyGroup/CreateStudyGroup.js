import React, { useState } from 'react';
import {ScrollView, View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constant/colors';

export const CreateStudyGroup = ({ navigation }) => {
  const [groupName, setGroupName] = useState('');
  const [email, setEmail] = useState('');
  const [emails, setEmails] = useState([]);

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

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      alert('Vui lòng nhập tên nhóm');
      return;
    }
    // Thêm logic tạo nhóm ở đây
    
    // Reset form và quay lại
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.BLACK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo nhóm học tập</Text>
        <TouchableOpacity 
        disabled={!groupName.trim()}
        style={groupName.trim() ? styles.saveButton : styles.saveButtonDisabled} 
        onPress={handleCreateGroup}>
          <Text style={styles.saveButton}>Lưu</Text>
        </TouchableOpacity>
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
    color: COLORS.BLUE,
    fontSize: 16,
    fontWeight: '500',
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