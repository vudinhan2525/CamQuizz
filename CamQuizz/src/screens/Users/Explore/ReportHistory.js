import { StyleSheet, Text, View, TouchableOpacity, FlatList, Modal } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons';
import COLORS  from '../../../constant/colors';

const FILTER_OPTIONS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'resolved', label: 'Đã xử lý' },
  { id: 'pending', label: 'Chờ xử lý' }
];

const ReportHistory = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Mock data - replace with actual API data
  const reports = [
    {
      id: 1,
      quizName: 'Kiểm tra React Native',
      reportTime: '2024-03-15 10:30',
      status: 'pending',
      reason: 'Nội dung không phù hợp'
    },
    {
      id: 2,
      quizName: 'Kiểm tra JavaScript',
      reportTime: '2024-03-14 15:45',
      status: 'resolved',
      reason: 'Câu hỏi sai'
    },
  ];

  const filteredReports = reports.filter(report => {
    if (selectedFilter === 'all') return true;
    return report.status === selectedFilter;
  });

  const handleReportPress = (report) => {
    setSelectedReport(report);
    setModalVisible(true);
  };

  const renderReportItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.reportItem}
      onPress={() => handleReportPress(item)}
    >
      <Text style={styles.quizName}>{item.quizName}</Text>
      <Text style={styles.reportTime}>{item.reportTime}</Text>
      <Text style={[
        styles.status,
        { color: item.status === 'resolved' ? COLORS.GREEN : COLORS.ORANGE }
      ]}>
        {item.status === 'resolved' ? 'Đã xử lý' : 'Chờ xử lý'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Lịch sử báo cáo</Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={COLORS.BLUE} />
        </TouchableOpacity>
      </View>

      {/* Filter Options */}
      <View style={styles.filterContainer}>
        {FILTER_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.filterOption,
              selectedFilter === option.id && styles.filterOptionSelected
            ]}
            onPress={() => setSelectedFilter(option.id)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === option.id && styles.filterTextSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reports List */}
      <FlatList
        data={filteredReports}
        renderItem={renderReportItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />

      {/* Report Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chi tiết báo cáo</Text>
            {selectedReport && (
              <>
                <Text style={styles.modalQuizName}>{selectedReport.quizName}</Text>
                <Text style={styles.modalTime}>Thời gian: {selectedReport.reportTime}</Text>
                <Text style={styles.modalReason}>Lý do: {selectedReport.reason}</Text>
              </>
            )}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ReportHistory;

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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.BLUE,
  },
  closeButton: {
    padding: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
  },
  filterOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.WHITE,
    borderWidth:1,
    borderColor: COLORS.GRAY_LIGHT,
  },
  filterOptionSelected: {
    backgroundColor: COLORS.BLUE,
  },
  filterText: {
    color: COLORS.BLACK,
  },
  filterTextSelected: {
    color: COLORS.WHITE,
  },
  listContainer: {
    padding: 16,
  },
  reportItem: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: COLORS.WHITE,
    marginBottom: 12,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quizName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reportTime: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalQuizName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  modalTime: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginBottom: 8,
  },
  modalReason: {
    fontSize: 14,
    marginBottom: 16,
  },
  modalCloseButton: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.BLUE,
    borderRadius: 8,
  },
  modalCloseText: {
    color: COLORS.WHITE,
    fontWeight: '500',
  },
});