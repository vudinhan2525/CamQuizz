import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import COLORS from '../../../constant/colors';
import { Ionicons } from '@expo/vector-icons';
import ReportQuizzService from '../../../services/ReportQuizzService';
import AsyncStorageService from '../../../services/AsyncStorageService';
import SCREENS from '../../index';

export const Quizz = () => {
  const navigation = useNavigation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalAttempts: 0,
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0
  });

  // Modal states
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [selectedAction, setSelectedAction] = useState('Keep');
  const [isProcessing, setIsProcessing] = useState(false);


  useEffect(() => {
    fetchReports();
    fetchStatistics();
  }, [filterStatus, searchQuery]);

  const fetchStatistics = async () => {
    try {
      // Check if user is authenticated before making API call
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('No token found, skipping statistics fetch');
        return;
      }

      const statisticsData = await ReportQuizzService.getStatistics();
      console.log('Statistics data:', statisticsData);

      setStats({
        totalQuizzes: statisticsData?.total_quizzes || 0,
        totalAttempts: statisticsData?.total_attempts || 0,
        totalReports: statisticsData?.total_reports || 0,
        pendingReports: statisticsData?.pending_reports || 0,
        resolvedReports: statisticsData?.resolved_reports || 0
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchReports = async (isLoadMore = false) => {
    try {
      // Check if user is authenticated before making API call
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('No token found, skipping reports fetch');
        setLoading(false);
        return;
      }

      if (!isLoadMore) {
        setLoading(true);
      }

      let apiStatus = null;
      if (filterStatus === 'Pending') {
        apiStatus = 'Pending';
      } else if (filterStatus === 'Processed') {
        apiStatus = 'Resolved';
      }

      const page = isLoadMore ? currentPage + 1 : 1;
      const { data, pagination } = await ReportQuizzService.getAllReports(
        searchQuery || null,
        apiStatus,
        page,
        10
      );

      console.log('Reports data:', data);
      console.log('Pagination:', pagination);

      if (isLoadMore) {
        setReports(prevReports => [...prevReports, ...data]);
        setCurrentPage(page);
      } else {
        setReports(data || []);
        setCurrentPage(1);
      }

      setHasMoreData(pagination && pagination.hasNextPage);

    } catch (error) {
      console.error('Error fetching reports:', error);
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        Alert.alert('Lỗi', 'Không thể tải danh sách báo cáo. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setReports([]);
    fetchReports();
  };

  const handleProcessReport = (report) => {
    setSelectedReport(report);
    setAdminNote('');
    setSelectedAction('Keep');
    setShowProcessModal(true);
  };

  const handleSubmitProcess = async () => {
    if (!selectedReport) return;

    try {
      setIsProcessing(true);

      const adminId = await AsyncStorageService.getUserId();

      const updateData = {
        status: 'Resolved',
        action: selectedAction,
        admin_note: adminNote.trim(),
        admin_id: adminId
      };

      console.log('Updating report:', selectedReport.id, updateData);
      await ReportQuizzService.updateReport(selectedReport.id, updateData);

      setReports(prevReports =>
        prevReports.map(report =>
          report.id === selectedReport.id
            ? { ...report, status: 'Resolved', action: selectedAction, admin_note: adminNote.trim() }
            : report
        )
      );

      Alert.alert('Thành công', 'Báo cáo đã được xử lý thành công');
      setShowProcessModal(false);
      setSelectedReport(null);
      setAdminNote('');
      setSelectedAction('Keep');

      fetchReports();
      fetchStatistics();

    } catch (error) {
      console.error('Error processing report:', error);
      Alert.alert('Lỗi', 'Không thể xử lý báo cáo. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewReportDetails = (report) => {
    navigation.navigate(SCREENS.QUIZ_REPORT_DETAIL, {
      quizId: report.quiz_id,
      quizName: report.quiz_name
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return COLORS.ORANGE;
      case 'Resolved':
        return COLORS.GREEN;
      default:
        return COLORS.GRAY_LIGHT;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Pending':
        return 'Chờ xử lý';
      case 'Resolved':
        return 'Đã xử lý';
      default:
        return status;
    }
  };

  const renderReportItem = ({ item }) => (
    <View style={styles.quizCard}>
      <TouchableOpacity
        style={styles.quizHeader}
        onPress={() => handleViewReportDetails(item)}
      >
        <View style={styles.quizImagePlaceholder}>
          <Ionicons name="document-text-outline" size={40} color={COLORS.BLUE} />
        </View>
        <View style={styles.quizInfo}>
          <Text style={styles.quizName}>{item.quiz_name || 'Quiz không xác định'}</Text>
          <Text style={styles.quizCreator}>Người báo cáo: {item.reporter_name || 'N/A'}</Text>
          <View style={styles.quizMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={COLORS.GRAY_TEXT} />
              <Text style={styles.metaText}>
                {new Date(item.created_at).toLocaleDateString('vi-VN')}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="alert-circle-outline" size={14} color={COLORS.GRAY_TEXT} />
              <Text style={styles.metaText}>{item.total_reports || 1} báo cáo</Text>
            </View>
          </View>
          <Text style={styles.reportMessage} numberOfLines={2}>
            Lý do: {item.message}
          </Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) }
        ]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.quizActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleViewReportDetails(item)}
        >
          <Ionicons name="eye-outline" size={20} color={COLORS.BLUE} />
          <Text style={styles.actionText}>Xem chi tiết</Text>
        </TouchableOpacity>

        {item.status === 'Pending' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.processButton]}
            onPress={() => handleProcessReport(item)}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.GREEN} />
            <Text style={[styles.actionText, styles.processText]}>Xử lý</Text>
          </TouchableOpacity>
        )}

        {item.status === 'Resolved' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.resolvedButton]}
            disabled={true}
          >
            <Ionicons name="checkmark-done-outline" size={20} color={COLORS.GRAY_TEXT} />
            <Text style={[styles.actionText, styles.resolvedText]}>Đã xử lý</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm báo cáo..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={20} color={COLORS.WHITE} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      {/* <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalQuizzes}</Text>
          <Text style={styles.statLabel}>Tổng số bài kiểm tra</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalAttempts}</Text>
          <Text style={styles.statLabel}>Tổng lượt thi</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalReports}</Text>
          <Text style={styles.statLabel}>Tổng báo cáo</Text>
        </View>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.pendingReports}</Text>
          <Text style={styles.statLabel}>Chờ xử lý</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.resolvedReports}</Text>
          <Text style={styles.statLabel}>Đã xử lý</Text>
        </View>
      </View> */}
      {/* Filter */}
      {/* <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Lọc theo trạng thái:</Text>
        <View style={styles.filterOptions}>
          
          
        
          <TouchableOpacity
            style={[styles.filterOption, filterStatus === 'Pending' && styles.activeFilterOption]}
            onPress={() => setFilterStatus('Pending')}
          >
            <Text style={[styles.filterText, filterStatus === 'Pending' && styles.activeFilterText]}>
              Chờ xử lý
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterOption, filterStatus === 'Processed' && styles.activeFilterOption]}
            onPress={() => setFilterStatus('Processed')}
          >
            <Text style={[styles.filterText, filterStatus === 'Processed' && styles.activeFilterText]}>
              Đã xử lý
            </Text>
          </TouchableOpacity>
        </View>
      </View> */}

      {/* Reports List */}
   
        <FlatList
          data={reports}
          ListHeaderComponent={
            <>
              {/* Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.totalQuizzes}</Text>
                  <Text style={styles.statLabel}>Tổng số bài kiểm tra</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.totalAttempts}</Text>
                  <Text style={styles.statLabel}>Tổng lượt thi</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.totalReports}</Text>
                  <Text style={styles.statLabel}>Tổng báo cáo</Text>
                </View>
              </View>
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.pendingReports}</Text>
                  <Text style={styles.statLabel}>Chờ xử lý</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.resolvedReports}</Text>
                  <Text style={styles.statLabel}>Đã xử lý</Text>
                </View>
              </View>
              {/* Filter */}
              <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Lọc theo trạng thái:</Text>
                <View style={styles.filterOptions}>



                  <TouchableOpacity
                    style={[styles.filterOption, filterStatus === 'Pending' && styles.activeFilterOption]}
                    onPress={() => setFilterStatus('Pending')}
                  >
                    <Text style={[styles.filterText, filterStatus === 'Pending' && styles.activeFilterText]}>
                      Chờ xử lý
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterOption, filterStatus === 'Processed' && styles.activeFilterOption]}
                    onPress={() => setFilterStatus('Processed')}
                  >
                    <Text style={[styles.filterText, filterStatus === 'Processed' && styles.activeFilterText]}>
                      Đã xử lý
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          }
          renderItem={renderReportItem}
          keyExtractor={item => item.created_at.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={60} color={COLORS.GRAY_LIGHT} />
              <Text style={styles.emptyText}>Không tìm thấy báo cáo nào</Text>
            </View>
          }
          onEndReached={() => {
            if (hasMoreData && !loading) {
              fetchReports(true);
            }
          }}
          onEndReachedThreshold={0.1}
        />
      

      {/* Process Report Modal */}
      <Modal
        visible={showProcessModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProcessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Xử lý báo cáo</Text>
              <TouchableOpacity onPress={() => setShowProcessModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.GRAY_TEXT} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Quiz: {selectedReport?.quizName}</Text>
              <Text style={styles.modalLabel}>Lý do báo cáo: {selectedReport?.message}</Text>

              <Text style={styles.modalLabel}>Hành động xử lý:</Text>
              <View style={styles.actionOptions}>
                <TouchableOpacity
                  style={[
                    styles.actionOption,
                    selectedAction === 'Keep' && styles.activeActionOption
                  ]}
                  onPress={() => setSelectedAction('Keep')}
                >
                  <Ionicons
                    name={selectedAction === 'Keep' ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={selectedAction === 'Keep' ? COLORS.BLUE : COLORS.GRAY_TEXT}
                  />
                  <Text style={[
                    styles.actionOptionText,
                    selectedAction === 'Keep' && styles.activeActionOptionText
                  ]}>
                    Giữ quiz
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionOption,
                    selectedAction === 'SoftDelete' && styles.activeActionOption
                  ]}
                  onPress={() => setSelectedAction('SoftDelete')}
                >
                  <Ionicons
                    name={selectedAction === 'SoftDelete' ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={selectedAction === 'SoftDelete' ? COLORS.BLUE : COLORS.GRAY_TEXT}
                  />
                  <Text style={[
                    styles.actionOptionText,
                    selectedAction === 'SoftDelete' && styles.activeActionOptionText
                  ]}>
                    Xóa quiz
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Ghi chú admin:</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="Nhập ghi chú xử lý..."
                value={adminNote}
                onChangeText={setAdminNote}
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowProcessModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmitProcess}
                disabled={isProcessing}
              >
                <Text style={styles.submitButtonText}>
                  {isProcessing ? 'Đang xử lý...' : 'Lưu'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT + '30',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: COLORS.GRAY_BG,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: COLORS.BLUE,
    height: 40,
    width: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    padding: 16,
    backgroundColor: COLORS.WHITE,
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: COLORS.BLACK,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: COLORS.GRAY_BG,
  },
  activeFilterOption: {
    backgroundColor: COLORS.BLUE,
  },
  filterText: {
    color: COLORS.BLACK,
  },
  activeFilterText: {
    color: COLORS.WHITE,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    paddingTop: 16,
    backgroundColor: COLORS.WHITE,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.BLUE_LIGHT,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.BLUE,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.BLACK,
    textAlign: 'center',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  quizCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: COLORS.BLUE,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.BLUE,
    overflow: 'hidden',
  },
  quizHeader: {
    flexDirection: 'row',
    padding: 12,
  },
  quizImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.GRAY_BG,
  },
  quizInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  quizName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 4,
  },
  quizCreator: {
    fontSize: 14,
    color: COLORS.GRAY_TEXT,
    marginBottom: 4,
  },
  quizMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.GRAY_TEXT,
    marginLeft: 4,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: '500',
  },
  quizActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_LIGHT + '30',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: COLORS.GRAY_LIGHT + '30',
  },
  actionText: {
    fontSize: 14,
    color: COLORS.BLUE,
    marginLeft: 4,
  },
  deleteButton: {
    borderRightWidth: 0,
  },
  deleteText: {
    color: COLORS.RED,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    color: COLORS.GRAY_TEXT,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.GRAY_TEXT,
    textAlign: 'center',
  },
  quizImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.GRAY_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportMessage: {
    fontSize: 12,
    color: COLORS.GRAY_TEXT,
    marginTop: 4,
    fontStyle: 'italic',
  },
  processButton: {
    borderRightWidth: 0,
  },
  processText: {
    color: COLORS.GREEN,
  },
  resolvedButton: {
    borderRightWidth: 0,
  },
  resolvedText: {
    color: COLORS.GRAY_TEXT,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  modalBody: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.BLACK,
    marginBottom: 8,
  },
  actionOptions: {
    marginBottom: 16,
  },
  actionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeActionOption: {
    backgroundColor: COLORS.BLUE_LIGHT,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  actionOptionText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.BLACK,
  },
  activeActionOptionText: {
    color: COLORS.BLUE,
    fontWeight: '500',
  },
  noteInput: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    backgroundColor: COLORS.WHITE,
    marginBottom: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.GRAY_BG,
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
  },
  submitButton: {
    backgroundColor: COLORS.BLUE,
  },
  cancelButtonText: {
    color: COLORS.GRAY_TEXT,
    fontWeight: '500',
  },
  submitButtonText: {
    color: COLORS.WHITE,
    fontWeight: '500',
  },
});
