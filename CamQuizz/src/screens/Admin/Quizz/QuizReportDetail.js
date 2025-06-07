import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import COLORS from '../../../constant/colors';
import { Ionicons } from '@expo/vector-icons';
import ReportQuizzService from '../../../services/ReportQuizzService';

export const QuizReportDetail = ({ route, navigation }) => {
  const { quizId, quizName } = route.params;
  const insets = useSafeAreaInsets();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [quizInfo, setQuizInfo] = useState({
    name: quizName || 'Quiz không xác định',
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async (isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setLoading(true);
      }

      const page = isLoadMore ? currentPage + 1 : 1;
      const { data, pagination } = await ReportQuizzService.getReportsForQuiz(
        quizId,
        page,
        10
      );

      console.log('Quiz reports data:', data);
      console.log('Pagination:', pagination);

      const reportsData = data || [];

      if (isLoadMore) {
        setReports(prevReports => [...prevReports, ...reportsData]);
        setCurrentPage(page);
      } else {
        setReports(reportsData);
        setCurrentPage(1);

        // Update quiz info with report statistics
        const totalReports = pagination ? pagination.totalItems : reportsData.length;
        const pendingReports = reportsData.filter(report => report.status === 'Pending').length;
        const resolvedReports = reportsData.filter(report => report.status === 'Resolved').length;

        setQuizInfo(prev => ({
          ...prev,
          totalReports,
          pendingReports,
          resolvedReports
        }));
      }

      setHasMoreData(pagination && pagination.hasNextPage);

    } catch (error) {
      console.error('Error fetching quiz reports:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách báo cáo. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
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
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.reportInfo}>
          <Text style={styles.reporterName}>Người báo cáo: {item.reporter_name || 'N/A'}</Text>
          <Text style={styles.reportMessage}>Nội dung: {item.message}</Text>
          <View style={styles.reportMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={COLORS.GRAY_TEXT} />
              <Text style={styles.metaText}>
                {new Date(item.created_at).toLocaleDateString('vi-VN')}
              </Text>
            </View>
            {item.resolved_at && (
              <View style={styles.metaItem}>
                <Ionicons name="checkmark-circle-outline" size={14} color={COLORS.GRAY_TEXT} />
                <Text style={styles.metaText}>
                  Xử lý: {new Date(item.resolved_at).toLocaleDateString('vi-VN')}
                </Text>
              </View>
            )}
            {item.resolved_by_name && (
              <View style={styles.metaItem}>
                <Ionicons name="person-outline" size={14} color={COLORS.GRAY_TEXT} />
                <Text style={styles.metaText}>
                  Bởi: {item.resolved_by_name}
                </Text>
              </View>
            )}
          </View>
          {item.admin_note && (
            <Text style={styles.adminNote}>Ghi chú admin: {item.admin_note}</Text>
          )}
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) }
        ]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.BLUE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết báo cáo Quiz</Text>
      </View>

      {/* Quiz Info */}
      <View style={styles.quizInfoContainer}>
        <Text style={styles.quizName}>{quizInfo.name}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{quizInfo.totalReports}</Text>
            <Text style={styles.statLabel}>Tổng báo cáo</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{quizInfo.pendingReports}</Text>
            <Text style={styles.statLabel}>Chờ xử lý</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{quizInfo.resolvedReports}</Text>
            <Text style={styles.statLabel}>Đã xử lý</Text>
          </View>
        </View>
      </View>

      {/* Reports List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.BLUE} />
          <Text style={styles.loadingText}>Đang tải báo cáo...</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderReportItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={60} color={COLORS.GRAY_LIGHT} />
              <Text style={styles.emptyText}>Không tìm thấy báo cáo nào cho quiz này</Text>
            </View>
          }
          onEndReached={() => {
            if (hasMoreData && !loading) {
              fetchReports(true);
            }
          }}
          onEndReachedThreshold={0.1}
        />
      )}
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT + '30',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  quizInfoContainer: {
    padding: 16,
    backgroundColor: COLORS.BLUE_LIGHT,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT + '30',
  },
  quizName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 12,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.WHITE,
    minWidth: 80,
  },
  statValue: {
    fontSize: 18,
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
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.GRAY_TEXT,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  reportCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: COLORS.BLUE,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT + '30',
  },
  reportHeader: {
    flexDirection: 'row',
    padding: 16,
  },
  reportInfo: {
    flex: 1,
  },
  reporterName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.BLACK,
    marginBottom: 8,
  },
  reportMessage: {
    fontSize: 14,
    color: COLORS.BLACK,
    marginBottom: 8,
    lineHeight: 20,
  },
  reportMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.GRAY_TEXT,
    marginLeft: 4,
  },
  adminNote: {
    fontSize: 12,
    color: COLORS.BLUE,
    fontStyle: 'italic',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: '500',
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
    textAlign: 'center',
  },
});
