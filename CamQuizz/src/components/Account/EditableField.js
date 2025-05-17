import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather'; 
import COLORS from '../../constant/colors';

const EditableField = ({
  value,
  onSave,
  style,
  label,
  placeholder = "Click to edit",
  icon = true,
  multiline = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <TextInput
          ref={inputRef}
          value={editValue}
          onChangeText={setEditValue}
          multiline={multiline}
          style={[
            styles.input,
            multiline && styles.multilineInput
          ]}
          placeholder={placeholder}
        />
        <View style={styles.buttonContainer}>
          <Pressable 
            style={[styles.button, styles.cancelButton]} 
            onPress={handleCancel}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </Pressable>
          <Pressable 
            style={[styles.button, styles.saveButton]} 
            onPress={handleSave}
          >
            <Text style={styles.buttonText}>Save</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <Pressable 
      onPress={() => setIsEditing(true)}
      style={[styles.viewMode, style]}
    >
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.contentContainer}>
        {value ? (
          <Text style={[styles.value, multiline && styles.multilineValue]}>
            {value}
          </Text>
        ) : (
          <Text style={styles.placeholder}>{placeholder}</Text>
        )}
        {icon && (
          <Pressable style={styles.iconButton}>
            <Icon name="edit-2" size={16} color={COLORS.BLUE} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
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
  viewMode: {
    padding: 8,
    borderRadius: 8,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    flex: 1,
    fontSize: 14,
  },
  multilineValue: {
    flexWrap: 'wrap',
  },
  placeholder: {
    color: '#666',
  },
  iconButton: {
    padding: 8,
  }
});

export default EditableField;