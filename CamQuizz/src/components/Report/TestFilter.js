import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

const TestFilter = ({ tests, onSelect, placeholder = 'Search tests' }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTests = tests.filter((test) =>
    test.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (test) => {
    setValue(test.title);
    onSelect(test);
    setOpen(false);
  };

  return (
    <View style={{ width: '100%', maxWidth: 400 }}>
      <TouchableOpacity
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          padding: 12,
          borderRadius: 8,
          justifyContent: 'space-between',
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#fff',
        }}
        onPress={() => setOpen(true)}
      >
        <Text>{value || placeholder}</Text>
        <Ionicons name="search" size={24} color="#555" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: '90%',
              backgroundColor: 'white',
              borderRadius: 8,
              padding: 16,
            }}
          >
            <TextInput
              placeholder={placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                padding: 8,
                borderRadius: 8,
                marginBottom: 8,
                backgroundColor: '#fff'
              }}
            />
            {filteredTests.length === 0 ? (
              <Text style={{ textAlign: 'center', color: 'gray' }}>No test found.</Text>
            ) : (
              <FlatList
                data={filteredTests}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    style={{
                      padding: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: '#eee',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View>
                      <Text>{item.title}</Text>
                      <Text style={{ fontSize: 12, color: 'gray' }}>{item.description}</Text>
                    </View>
                    {value === item.title && (
                      <Ionicons name="checkmark-circle-sharp" size={20} color="#007bff" />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity
              onPress={() => setOpen(false)}
              style={{
                marginTop: 10,
                backgroundColor: '#007bff',
                padding: 10,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TestFilter;
