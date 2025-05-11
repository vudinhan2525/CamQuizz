import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TestCard from '../../components/Report/TestCard';
import TestFilter from '../../components/Report/TestFilter';
import { getCurrentUserTests, getOrganizationTests, getCandidateAttemptedTests } from '../../components/data/MocTests';
import COLORS from '../../constant/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const Report = ({ navigation }) => {
  const [activeView, setActiveView] = useState('author');
  const [searchFilter, setSearchFilter] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedView, setSelectedView] = useState('author');
  const insets = useSafeAreaInsets();

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

  // Cấu hình nhãn tùy chỉnh cho từng loại báo cáo
  const getCustomLabels = () => {
    switch (activeView) {
      case 'author':
        return {
          viewReport: 'Xem báo cáo chi tiết',
          attempts: 'Số lượt làm bài',
          questions: 'Số câu hỏi',
          passRate: 'Tỉ lệ vượt qua'
        };
      case 'organization':
        return {
          viewReport: 'Xem báo cáo tổ chức',
          attempts: 'Số lượt làm bài',
          questions: 'Số câu hỏi',
          passRate: 'Tỉ lệ đạt'
        };
      case 'candidate':
        return {
          viewReport: 'Xem lịch sử làm bài',
          attempts: 'Số lần làm',
          questions: 'Số câu hỏi',
          passRate: 'Kết quả'
        };
      default:
        return {};
    }
  };

  const shouldShowBadges = activeView === 'author' || activeView === 'organization';

  const options = [
    { label: 'Tác giả', value: 'author' },
    { label: 'Người tổ chức', value: 'organization' },
    { label: 'Bài làm cũ', value: 'candidate' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 80 } // Thêm padding bottom để tránh bị che bởi bottom tab
        ]}
      >
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Chọn kiểu báo cáo</Text>

          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.dropdownButtonText}>
              {options.find(opt => opt.value === selectedView)?.label}
            </Text>
            <Ionicons name="options-outline" size={22} color={COLORS.GRAY} />
          </TouchableOpacity>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Chọn kiểu báo cáo</Text>
                
                {/* Danh sách tùy chọn */}
                {options.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.optionItem}
                    onPress={() => {
                      setSelectedView(option.value);
                      setActiveView(option.value)
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.optionText}>{option.label}</Text>

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

        {/* <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <TestFilter
              tests={allTests}
              onSelect={handleFilterSelect}
              placeholder={"Tìm kiếm bài thi"}
            />
          </View>
          {searchFilter && (
            <TouchableOpacity 
              onPress={handleClearFilter} 
              style={styles.refreshButton}
            >
              <Ionicons name="refresh" size={16} color={COLORS.BLUE} />
              <Text style={styles.refreshText}>Làm mới</Text>
            </TouchableOpacity>
          )}
        </View> */}

        <View style={styles.testListContainer}>
          {filteredTests.length > 0 ? (
            filteredTests.map((test) => (
              <TestCard 
                key={test.id} 
                test={test} 
                onViewReport={handleViewReport} 
                reportType={activeView}
                showBadges={shouldShowBadges}
                customLabels={getCustomLabels()}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color="#aaa" />
              <Text style={styles.emptyStateText}>Không tìm thấy bài kiểm tra trong mục này</Text>
              {searchFilter && (
                <TouchableOpacity onPress={handleClearFilter}>
                  <Text style={styles.emptyStateAction}>Làm mới và thử lại</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
    fontSize: 16,
  },
  dropdownButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BLUE,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButtonText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 30,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  optionText: {
    fontSize: 16,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchContainer: {
    width: 250,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  refreshText: {
    marginLeft: 4,
    color: COLORS.BLUE,
  },
  testListContainer: {
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
  },
  emptyStateAction: {
    color: COLORS.BLUE,
    marginTop: 8,
    fontWeight: '500',
  },
});