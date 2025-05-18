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
  Image
} from 'react-native';
import COLORS from '../../constant/colors';
import { Ionicons } from '@expo/vector-icons';

export const Quizz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Mock data for development
  const mockQuizzes = [
    {
      id: 1,
      name: 'Kiểm tra Toán học cơ bản',
      image: 'https://placehold.co/600x400/png',
      duration: 30, // minutes
      status: 'Public',
      numberOfAttended: 120,
      numberOfQuestions: 15,
      createdAt: '2023-10-15T08:30:00Z',
      createdBy: 'Nguyễn Văn A'
    },
    {
      id: 2,
      name: 'Kiểm tra Tiếng Anh TOEIC',
      image: 'https://placehold.co/600x400/png',
      duration: 45,
      status: 'Private',
      numberOfAttended: 85,
      numberOfQuestions: 20,
      createdAt: '2023-11-20T10:15:00Z',
      createdBy: 'Trần Thị B'
    },
    {
      id: 3,
      name: 'Kiểm tra Lịch sử Việt Nam',
      image: 'https://placehold.co/600x400/png',
      duration: 60,
      status: 'Public',
      numberOfAttended: 210,
      numberOfQuestions: 25,
      createdAt: '2023-09-05T14:45:00Z',
      createdBy: 'Lê Văn C'
    },
    {
      id: 4,
      name: 'Kiểm tra Vật lý đại cương',
      image: 'https://placehold.co/600x400/png',
      duration: 40,
      status: 'Private',
      numberOfAttended: 0,
      numberOfQuestions: 18,
      createdAt: '2023-12-10T09:20:00Z',
      createdBy: 'Phạm Thị D'
    },
    {
      id: 5,
      name: 'Kiểm tra Hóa học hữu cơ',
      image: 'https://placehold.co/600x400/png',
      duration: 50,
      status: 'Public',
      numberOfAttended: 95,
      numberOfQuestions: 22,
      createdAt: '2024-01-25T11:30:00Z',
      createdBy: 'Hoàng Văn E'
    }
  ];

  useEffect(() => {
    fetchQuizzes();
  }, [filterStatus, searchQuery]);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      // Mock API response
      await new Promise(resolve => setTimeout(resolve, 500));

      // Filter mock data based on search query and status
      let filteredQuizzes = [...mockQuizzes];

      if (searchQuery) {
        filteredQuizzes = filteredQuizzes.filter(quiz =>
          quiz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          quiz.createdBy.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (filterStatus !== 'All') {
        filteredQuizzes = filteredQuizzes.filter(quiz =>
          quiz.status === filterStatus
        );
      }

      setQuizzes(filteredQuizzes);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      Alert.alert('Error', 'Failed to load quizzes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchQuizzes();
  };

  const toggleQuizStatus = (id) => {
    const quiz = quizzes.find(q => q.id === id);
    if (!quiz) return;

    // Toggle between Public and Private
    const newStatus = quiz.status === 'Public' ? 'Private' : 'Public';

    setQuizzes(prevQuizzes =>
      prevQuizzes.map(q =>
        q.id === id ? { ...q, status: newStatus } : q
      )
    );

    Alert.alert('Success', `Trạng thái của "${quiz.name}" đã được cập nhật thành ${newStatus}`);
  };

  const handleDeleteQuiz = (id) => {
    const quiz = quizzes.find(q => q.id === id);
    if (!quiz) return;

    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa bài kiểm tra "${quiz.name}"?`,
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setQuizzes(prevQuizzes => prevQuizzes.filter(q => q.id !== id));
            Alert.alert('Success', `Đã xóa bài kiểm tra "${quiz.name}"`);
          }
        }
      ]
    );
  };

  const handleViewQuizDetails = (id) => {
    // In a real app, this would navigate to a quiz detail screen
    const quiz = quizzes.find(q => q.id === id);
    if (!quiz) return;

    Alert.alert(
      'Chi tiết bài kiểm tra',
      `ID: ${quiz.id}\nTên: ${quiz.name}\nThời gian: ${quiz.duration} phút\nSố câu hỏi: ${quiz.numberOfQuestions}\nLượt tham gia: ${quiz.numberOfAttended}\nTrạng thái: ${quiz.status}\nNgười tạo: ${quiz.createdBy}\nNgày tạo: ${new Date(quiz.createdAt).toLocaleDateString('vi-VN')}`
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Public':
        return COLORS.GREEN;
      case 'Private':
        return COLORS.BLUE;
      default:
        return COLORS.GRAY_LIGHT;
    }
  };

  const renderQuizItem = ({ item }) => (
    <View style={styles.quizCard}>
      <TouchableOpacity
        style={styles.quizHeader}
        onPress={() => handleViewQuizDetails(item.id)}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.quizImage}
          defaultSource={require('../../../assets/icon.png')}
        />
        <View style={styles.quizInfo}>
          <Text style={styles.quizName}>{item.name}</Text>
          <Text style={styles.quizCreator}>Người tạo: {item.createdBy}</Text>
          <View style={styles.quizMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={COLORS.GRAY_TEXT} />
              <Text style={styles.metaText}>{item.duration} phút</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="help-circle-outline" size={14} color={COLORS.GRAY_TEXT} />
              <Text style={styles.metaText}>{item.numberOfQuestions} câu hỏi</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={14} color={COLORS.GRAY_TEXT} />
              <Text style={styles.metaText}>{item.numberOfAttended} lượt thi</Text>
            </View>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) }
        ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.quizActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleQuizStatus(item.id)}
        >
          <Ionicons name="swap-horizontal" size={20} color={COLORS.BLUE} />
          <Text style={styles.actionText}>Đổi trạng thái</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleViewQuizDetails(item.id)}
        >
          <Ionicons name="eye-outline" size={20} color={COLORS.BLUE} />
          <Text style={styles.actionText}>Xem chi tiết</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteQuiz(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.RED} />
          <Text style={[styles.actionText, styles.deleteText]}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm bài kiểm tra..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={20} color={COLORS.WHITE} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Lọc theo trạng thái:</Text>
        <View style={styles.filterOptions}>
          <TouchableOpacity
            style={[styles.filterOption, filterStatus === 'All' && styles.activeFilterOption]}
            onPress={() => setFilterStatus('All')}
          >
            <Text style={[styles.filterText, filterStatus === 'All' && styles.activeFilterText]}>
              Tất cả
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterOption, filterStatus === 'Public' && styles.activeFilterOption]}
            onPress={() => setFilterStatus('Public')}
          >
            <Text style={[styles.filterText, filterStatus === 'Public' && styles.activeFilterText]}>
              Công khai
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterOption, filterStatus === 'Private' && styles.activeFilterOption]}
            onPress={() => setFilterStatus('Private')}
          >
            <Text style={[styles.filterText, filterStatus === 'Private' && styles.activeFilterText]}>
              Riêng tư
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{quizzes.length}</Text>
          <Text style={styles.statLabel}>Tổng số bài kiểm tra</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {quizzes.reduce((sum, quiz) => sum + quiz.numberOfAttended, 0)}
          </Text>
          <Text style={styles.statLabel}>Tổng lượt thi</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {quizzes.filter(quiz => quiz.status === 'Public').length}
          </Text>
          <Text style={styles.statLabel}>Bài kiểm tra công khai</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.BLUE} />
        </View>
      ) : (
        <FlatList
          data={quizzes}
          renderItem={renderQuizItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document" size={60} color={COLORS.GRAY_LIGHT} />
              <Text style={styles.emptyText}>Không tìm thấy bài kiểm tra</Text>
            </View>
          }
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
    padding: 16,
    backgroundColor: COLORS.WHITE,
    marginBottom: 8,
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
    padding: 16,
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
  }
});
