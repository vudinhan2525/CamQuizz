import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import COLORS from '../../../constant/colors';
import SCREENS from '../../../screens/index';
import ReportService from '../../../services/ReportService';
import { validateToken } from '../../../services/AuthService';

// Helper function for handling auth errors
const handleAuthError = (navigation, message = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.') => {
  Toast.show({
    type: 'error',
    text1: 'Lỗi xác thực',
    text2: message
  });
  navigation.getParent()?.reset({
    index: 0,
    routes: [{ name: 'AuthStack' }],
  });
};

const SelectQuizForFlashcard = () => {
  const navigation = useNavigation();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizHistory();
  }, []);

  const fetchQuizHistory = async () => {
    try {
      if (!await validateToken()) {
        handleAuthError(navigation);
        return;
      }

      setLoading(true);
      const response = await ReportService.getMyQuizHistory(50, 1); // Lấy 50 quiz gần nhất

      if (response && response.data) {
        // Format dữ liệu để hiển thị
        const formattedQuizzes = response.data.map(quiz => {
          console.log('Processing quiz:', quiz); // Debug log
          return {
            id: quiz.quiz_id ? quiz.quiz_id.toString() : 'unknown',
            title: quiz.quiz_name || 'Tên quiz không xác định',
            questionsCount: 'N/A', // QuizHistoryDto không có TotalQuestions
            attemptCount: quiz.attempt_count || 0,
            bestScore: quiz.best_score || 0,
            lastAttemptDate: quiz.last_attempt_date ? new Date(quiz.last_attempt_date).toLocaleDateString('vi-VN') : 'N/A',
            image: quiz.quiz_image || '',
            genreName: quiz.genre_name || 'Không xác định'
          };
        });

        console.log('Formatted quizzes:', formattedQuizzes); // Debug log
        setQuizzes(formattedQuizzes);
      } else {
        console.log('No data in response:', response); // Debug log
        setQuizzes([]);
      }
    } catch (error) {
      console.error('Error fetching quiz history:', error);

      if (error.message === 'Unauthorized - Please log in again' || error.response?.status === 401) {
        handleAuthError(navigation);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không thể tải danh sách quiz đã tham gia. Vui lòng thử lại sau.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuiz = (quiz) => {
    navigation.navigate(SCREENS.SELECT_QUESTIONS_FOR_FLASHCARD, { 
      quizId: quiz.id,
      quizTitle: quiz.title
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn bài kiểm tra</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.BLUE} />
          <Text style={styles.loadingText}>Đang tải bài kiểm tra...</Text>
        </View>
      ) : quizzes.length > 0 ? (
        <>
          <Text style={styles.instruction}>Chọn một bài kiểm tra đã tham gia để tạo bộ thẻ học bài:</Text>

          <FlatList
            data={quizzes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.quizItem}
                onPress={() => handleSelectQuiz(item)}
              >
                <Text style={styles.quizTitle}>{item.title}</Text>
                <Text style={styles.quizGenre}>Thể loại: {item.genreName}</Text>
                <Text style={styles.quizInfo}>Số lần làm: {item.attemptCount}</Text>
                <Text style={styles.quizInfo}>Điểm cao nhất: {item.bestScore}</Text>
                <Text style={styles.quizInfo}>Lần làm cuối: {item.lastAttemptDate}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
          />
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Bạn chưa tham gia quiz nào.</Text>
          <Text style={styles.emptySubText}>Hãy tham gia một số quiz trước khi tạo flashcard từ kết quả.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.BLUE,
  },
  instruction: {
    padding: 16,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 16,
  },
  quizItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  quizInfo: {
    color: '#666',
    marginBottom: 4,
  },
  quizGenre: {
    color: COLORS.BLUE,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default SelectQuizForFlashcard;