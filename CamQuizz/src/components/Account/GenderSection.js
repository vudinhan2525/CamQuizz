import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Picker } from '@react-native-picker/picker';

const GenderSection = ({
  title,
  value,
  onSave,
  icon,
  style
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedGender, setSelectedGender] = useState(value || 'Nam');

  const handleSave = () => {
    onSave(selectedGender);
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setSelectedGender(value);
    setIsExpanded(false);
  };

  if (isExpanded) {
    return (
      <View style={[styles.container, styles.borderTop, style]}>
        <View style={styles.headerContainer}>
          {icon}
          <Text style={styles.title}>{title}</Text>
        </View>
        
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedGender}
            onValueChange={(itemValue) => setSelectedGender(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Nam" value="Nam" />
            <Picker.Item label="Nữ" value="Nữ" />
            <Picker.Item label="Khác" value="Other" />
          </Picker>
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
          <Text style={styles.valueText}>{value}</Text>
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginVertical: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
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

export default GenderSection;
