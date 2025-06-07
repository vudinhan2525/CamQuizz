import { StyleSheet, Text, View, TouchableOpacity, FlatList, Modal } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons';
import COLORS  from '../../../constant/colors';
import ReportQuizzService from './../../../services/ReportQuizzService'


const ReportHistory = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ReportQuizzService.getMyTicket(page, 10);
        setReports(data.items || []);
        setHasMore((data.total || 0) > (page * 10));
      } catch (err) {
        setError('Lỗi khi tải dữ liệu báo cáo');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [page]);



 
  const renderReportItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.reportItem}
    >
      <Text style={styles.quizName}>{item.quiz_name || 'Không rõ tên quiz'}</Text>
      <Text style={styles.reportTime}>{item.created_at ? new Date(item.created_at).toLocaleString() : item.reportTime}</Text>
      <Text style={[
        styles.status,
        { color: item.status === 'Resolved' ? COLORS.GREEN : COLORS.ORANGE }
      ]}>
        {item.status === 'Resolved' ? 'Đã xử lý' : 'Chờ xử lý'}
      </Text>
      <Text style={{ color: COLORS.GRAY, fontSize: 13 }}>Lý do: {item.message}</Text>
      {item.status!=='Pending' && item.action_display && item.resolved_by_name && item.resolved_at(
        <View>
          <Text style={{ color: COLORS.GRAY, fontSize: 13 }}>{item.resolved_by_name} đã xử lý lúc {new Date(item.resolved_at).toLocaleString()}</Text>
          <Text style={{ color: COLORS.GRAY, fontSize: 13 }}>Ghi chú xử lý: {item.admin_note||"Không có"}</Text>
          <Text style={{ color: COLORS.GRAY, fontSize: 13 }}>Hành động xử lý: {item.action_display||"Không có"}</Text>
        </View>
        
      )}
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

      {/* Reports List */}
      {loading ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>Đang tải dữ liệu...</Text>
      ) : error ? (
        <Text style={{ textAlign: 'center', marginTop: 20, color: 'red' }}>{error}</Text>
      ) : reports.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.BLUE} />
          <Text style={{ color: COLORS.BLUE, marginTop: 10 }}>Không có báo cáo nào</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={reports}
            renderItem={renderReportItem}
            keyExtractor={item => item.id?.toString()}
            contentContainerStyle={styles.listContainer}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 16, gap: 10 }}>
            <TouchableOpacity
              style={[styles.filterOption, { opacity: page === 1 ? 0.5 : 1 }]}
              disabled={page === 1}
              onPress={() => setPage(page - 1)}
            >
              <Text style={styles.filterText}>Trang trước</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterOption, { opacity: !hasMore ? 0.5 : 1 }]}
              disabled={!hasMore}
              onPress={() => setPage(page + 1)}
            >
              <Text style={styles.filterText}>Trang sau</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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