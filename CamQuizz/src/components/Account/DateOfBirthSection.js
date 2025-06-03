import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const DateOfBirthSection = ({
  title,
  value,
  onSave,
  icon,
  style
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dateInput, setDateInput] = useState(formatDateForDisplay(value));

  // Format input as user types to add / automatically
  const handleDateInputChange = (text) => {
    // Remove any non-numeric characters
    let numericText = text.replace(/[^0-9]/g, '');

    // Format with / characters
    if (numericText.length > 0) {
      // Add first / after day (2 digits)
      if (numericText.length > 2) {
        numericText = numericText.slice(0, 2) + '/' + numericText.slice(2);
      }

      // Add second / after month (2 more digits)
      if (numericText.length > 5) {
        numericText = numericText.slice(0, 5) + '/' + numericText.slice(5);
      }

      // Limit to 10 characters (DD/MM/YYYY)
      if (numericText.length > 10) {
        numericText = numericText.slice(0, 10);
      }
    }

    setDateInput(numericText);
  };

  const handleSave = () => {
    // Validate date format (DD/MM/YYYY)
    if (isValidDateFormat(dateInput)) {
      const formattedDate = formatDateForAPI(dateInput);
      onSave(formattedDate);
      setIsExpanded(false);
    } else {
      // Show error or handle invalid date
      alert('Vui lòng nhập ngày theo định dạng DD/MM/YYYY');
    }
  };

  const handleCancel = () => {
    setDateInput(formatDateForDisplay(value));
    setIsExpanded(false);
  };

  // Format date from API to display format (DD/MM/YYYY)
  function formatDateForDisplay(dateString) {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formatting date for display:', error);
      return '';
    }
  }

  // Format date from display format (DD/MM/YYYY) to API format (YYYY-MM-DD)
  function formatDateForAPI(dateString) {
    if (!dateString) return '';

    try {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date for API:', error);
      return '';
    }
  }

  // Validate date format (DD/MM/YYYY)
  function isValidDateFormat(dateString) {
    if (!dateString) return false;

    // Check format
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(dateString)) {
      // If it doesn't match the format, check if we can fix it
      if (dateString.length === 8) {
        // If it's 8 digits (DDMMYYYY), try to format it
        const day = dateString.substring(0, 2);
        const month = dateString.substring(2, 4);
        const year = dateString.substring(4, 8);
        dateString = `${day}/${month}/${year}`;
        setDateInput(dateString);
      } else {
        return false;
      }
    }

    // Extract day, month, year
    const parts = dateString.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    // Check ranges
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > new Date().getFullYear()) return false;

    // Check valid date (accounting for leap years, etc.)
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  if (isExpanded) {
    return (
      <View style={[styles.container, styles.borderTop, style]}>
        <View style={styles.headerContainer}>
          {icon}
          <Text style={styles.title}>{title}</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            value={dateInput}
            onChangeText={handleDateInputChange}
            style={styles.input}
            placeholder="DD/MM/YYYY"
            keyboardType="numeric"
            maxLength={10}
            autoFocus
          />
          <Text style={styles.helperText}>Định dạng: DD/MM/YYYY (Ví dụ: 01/01/2000)</Text>
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
          <Text style={styles.valueText}>{formatDateForDisplay(value) || 'Chưa cập nhật'}</Text>
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginLeft: 2,
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

export default DateOfBirthSection;
