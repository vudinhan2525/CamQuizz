import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TestCard from '../../components/Report/TestCard';
import TestFilter from '../../components/Report/TestFilter';
import { getCurrentUserTests, getOrganizationTests, getCandidateAttemptedTests } from '../../components/data/MocTests';
import COLORS from '../../constant/colors';

export const Report = ({ navigation }) => {
  const [activeView, setActiveView] = useState('author');
  const [searchFilter, setSearchFilter] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedView, setSelectedView] = useState('author');

  const getTests = () => {
    switch (activeView) {
      case 'author':
        return getCurrentUserTests();
      case 'organization':
        return getOrganizationTests();
      case 'candidate':
        return getCandidateAttemptedTests();
      default:
        return [];
    }
  };

  const allTests = useMemo(() => getTests(), [activeView]);

  const filteredTests = useMemo(() => {
    if (!searchFilter) return allTests;
    return allTests.filter(test => test.id === searchFilter.id);
  }, [allTests, searchFilter]);

  const handleViewReport = (test) => {
    // Navigate to ReportDetail screen with test data and view type
    navigation.navigate('ReportDetail', {
      test: test,
      viewType: activeView
    });
  };

  const handleFilterSelect = (test) => {
    setSearchFilter(test);
  };

  const handleClearFilter = () => {
    setSearchFilter(null);
  };

  const handleViewChange = (value) => {
    setActiveView(value);
    setSearchFilter(null);
  };

  const options = [
    { label: 'Tác giả', value: 'author' },
    { label: 'Người tổ chức', value: 'organization' },
    { label: 'Bài làm cũ', value: 'candidate' }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 16 }}>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ marginBottom: 8, fontWeight: 'bold' }}>Chọn kiểu báo cáo</Text>

          <TouchableOpacity 
            style={{
              backgroundColor: '#fff',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: COLORS.BLUE,
              padding: 12,
              flexDirection: 'row',  
              alignItems: 'center',   
              justifyContent: 'space-between' 
            }}
            onPress={() => setModalVisible(true)}
          >
            <Text style={{ fontSize: 16 }}>
              {options.find(opt => opt.value === selectedView)?.label}
            </Text>
            <Ionicons name="options-outline" size={22} color={COLORS.GRAY} />
          </TouchableOpacity>

                      {/* Modal hiển thị ở phía dưới */}
                      <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={{
                flex: 1,
                justifyContent: 'flex-end',
                backgroundColor: 'rgba(0,0,0,0.5)'
              }}>
                <View style={{
                  backgroundColor: '#fff',
                  width: '100%',
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                  padding: 16,
                  paddingBottom: 30,
                }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Chọn kiểu báo cáo</Text>
                  

                  {/* Danh sách tùy chọn */}
                  {options.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: '#ddd'
                      }}
                      onPress={() => {
                        setSelectedView(option.value);
                        setActiveView(option.value)
                        setModalVisible(false);
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>{option.label}</Text>

                      {/* Checkbox nằm bên phải */}
                      <Ionicons 
                        name={selectedView === option.value ? "radio-button-on" : "radio-button-off"} 
                        size={20} 
                        color={selectedView === option.value ? COLORS.BLUE : "#ccc"} 
                      />
                    </TouchableOpacity>
                  ))}

                </View>
              </View>
            </Modal>
          </View>

        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 250 }}>
              <TestFilter
                tests={allTests}
                onSelect={handleFilterSelect}
                placeholder={"Tìm kiếm bài thi"}
              />
            </View>
            {searchFilter && (
              <TouchableOpacity onPress={handleClearFilter} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                <Ionicons name="refresh" size={16} color={COLORS.BLUE} />
                <Text>Làm mới</Text>
              </TouchableOpacity>
            )}
          </View>

          <View>
            {filteredTests.length > 0 ? (
              filteredTests.map((test) => (
                <TestCard key={test.id} test={test} onViewReport={handleViewReport} />
              ))
            ) : (
              <View style={{ alignItems: 'center', padding: 20 }}>
                <Ionicons name="document-text-outline" size={48} color="#aaa" />
                <Text>Không tìm thấy bài kiểm tra trong mục này</Text>
                {searchFilter && (
                  <TouchableOpacity variant="link" onPress={handleClearFilter}>
                    Làm mới và thử lại
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};