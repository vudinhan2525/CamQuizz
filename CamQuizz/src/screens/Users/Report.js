import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, SafeAreaView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TestCard from '../../components/Report/TestCard';
import TestFilter from '../../components/Report/TestFilter';
import { getCurrentUserTests, getOrganizationTests, getCandidateAttemptedTests } from '../../components/data/MocTests';
import ReportService from '../../services/ReportService';
import QuizzService from '../../services/QuizzService';
import COLORS from '../../constant/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const Report = ({ navigation }) => {
  const [activeView, setActiveView] = useState('author');
  const [searchFilter, setSearchFilter] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedView, setSelectedView] = useState('author');
  const [loading, setLoading] = useState(false);
  const [authorQuizzes, setAuthorQuizzes] = useState([]);
  const [candidateAttempts, setCandidateAttempts] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadData();
  }, [activeView]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeView) {
        case 'author':
          await loadAuthorData();
          break;
        case 'organization':
          // Tạm thời sử dụng mock data cho organization
          break;
        case 'candidate':
          await loadCandidateData();
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);

      // Handle 401 errors specifically
      if (error.message && error.message.includes('Unauthorized')) {
        Alert.alert(
          'Phiên đăng nhập hết hạn',
          'Vui lòng đăng nhập lại để tiếp tục.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Lỗi', 'Không thể tải dữ liệu báo cáo. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Utility function để tính điểm trung bình và tỷ lệ vượt qua từ score_distribution
  const calculateScoreStats = (scoreDistribution) => {
    if (!scoreDistribution || Object.keys(scoreDistribution).length === 0) {
      return { averageScore: 0, passRate: 0 };
    }

    let totalScore = 0;
    let totalCount = 0;
    let passCount = 0;

    Object.entries(scoreDistribution).forEach(([score, count]) => {
      const scoreNum = parseInt(score);
      if (scoreNum >= 1 && scoreNum <= 10) {
        totalScore += scoreNum * count;
        totalCount += count;
        if (scoreNum >= 7) { // Điểm vượt qua >= 7
          passCount += count;
        }
      }
    });

    const averageScore = totalCount > 0 ? (totalScore / totalCount).toFixed(1) : 0;
    const passRate = totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0;

    return { averageScore: parseFloat(averageScore), passRate };
  };

  const loadAuthorData = async () => {
    try {
      const response = await ReportService.getMyQuizzesForReport(50, 1);
      console.log('Author quizzes loaded:', response);

      // Check if response and response.data exist and is an array
      if (!response || !response.data || !Array.isArray(response.data)) {
        console.log('No quiz data found or invalid response format');
        setAuthorQuizzes([]);
        return;
      }

      const formattedQuizzes = await Promise.all(
        response.data.map(async (quiz) => {
          console.log('Processing quiz for author report:', quiz);

          let numberOfQuestions = quiz.numberOfQuestions || 0;
          let numberOfAttended = quiz.numberOfAttended || 0;
          let createdAt = quiz.createdAt || quiz.created_at;
          let updatedAt = quiz.updatedAt || quiz.updated_at;
          let averageScore = 0;
          let passRate = 0;

          // Nếu numberOfQuestions bằng 0 hoặc numberOfAttended bằng 0, fetch dữ liệu chi tiết
          if (numberOfQuestions === 0 || numberOfAttended === 0) {
            try {
              console.log(`Fetching detailed data for quiz ${quiz.id}`);
              const detailedQuiz = await QuizzService.getQuizzById(quiz.id);
              numberOfQuestions = detailedQuiz.number_of_questions || detailedQuiz.numberOfQuestions || 0;
              numberOfAttended = detailedQuiz.number_of_attended || detailedQuiz.numberOfAttended || numberOfAttended;
              // Cập nhật ngày tạo từ dữ liệu chi tiết nếu cần
              createdAt = detailedQuiz.createdAt || detailedQuiz.created_at || createdAt;
              updatedAt = detailedQuiz.updatedAt || detailedQuiz.updated_at || updatedAt;
              console.log(`Quiz ${quiz.id} detailed data:`, { numberOfQuestions, numberOfAttended, createdAt, updatedAt });
            } catch (error) {
              console.error(`Error fetching detailed data for quiz ${quiz.id}:`, error);
            }
          }

          // Fetch báo cáo chi tiết để tính điểm trung bình và tỷ lệ vượt qua nếu có lượt làm bài
          if (numberOfAttended > 0) {
            try {
              console.log(`Fetching report data for quiz ${quiz.id}`);
              const reportResponse = await ReportService.getAuthorReport(quiz.id);
              if (reportResponse?.data?.score_distribution) {
                const scoreStats = calculateScoreStats(reportResponse.data.score_distribution);
                averageScore = scoreStats.averageScore;
                passRate = scoreStats.passRate;
                console.log(`Quiz ${quiz.id} score stats:`, { averageScore, passRate });
              }
            } catch (error) {
              console.error(`Error fetching report data for quiz ${quiz.id}:`, error);
            }
          }

          return {
            id: quiz.id,
            title: quiz.name,
            image: quiz.image,
            attempts: numberOfAttended,
            questions: numberOfQuestions,
            passRate: passRate, // Tính toán từ báo cáo chi tiết
            createdAt: createdAt,
            updatedAt: updatedAt,
            description: quiz.description,
            duration: quiz.duration,
            genreId: quiz.genreId,
            userId: quiz.userId,
            // Thêm các field cần thiết cho TestCard
            numberOfQuestions: numberOfQuestions,
            numberOfAttended: numberOfAttended,
            averageScore: averageScore, // Điểm trung bình từ báo cáo chi tiết
          };
        })
      );

      console.log('Formatted author quizzes:', formattedQuizzes);
      setAuthorQuizzes(formattedQuizzes);
    } catch (error) {
      console.error('Error loading author data:', error);
      setAuthorQuizzes([]); // Set empty array on error
      throw error;
    }
  };

  const loadCandidateData = async () => {
    try {
      const historyResponse = await ReportService.getMyQuizHistory(50, 1);
      console.log('Quiz history loaded:', historyResponse);

      // Check if response and response.data exist and is an array
      if (!historyResponse || !historyResponse.data || !Array.isArray(historyResponse.data)) {
        console.log('No quiz history data found or invalid response format');
        setQuizHistory([]);
        return;
      }

      const formattedHistory = await Promise.all(
        historyResponse.data.map(async (item) => {
          let numberOfQuestions = 0;

          try {
            const quizDetails = await QuizzService.getQuizzById(item.quiz_id || item.quizId);
            numberOfQuestions = quizDetails.number_of_questions || 0;
            console.log(`Quiz ${item.quiz_id} has ${numberOfQuestions} questions`);
          } catch (error) {
            console.error(`Error fetching quiz details for quiz ${item.quiz_id}:`, error);
          }

          return {
            id: item.quiz_id || item.quizId,
            title: item.quiz_name || item.quizName,
            image: item.quiz_image || item.quizImage,
            attempts: item.attempt_count || item.attemptCount,
            questions: numberOfQuestions,
            passRate: item.best_score || item.bestScore,
            lastAttempt: item.last_attempt_date || item.lastAttemptDate,
            genreName: item.genre_name || item.genreName,
            bestScore: item.best_score || item.bestScore,
            genreId: item.genre_id || item.genreId,
          };
        })
      );

      console.log('Formatted history with quiz details:', formattedHistory);
      setQuizHistory(formattedHistory);
    } catch (error) {
      console.error('Error loading candidate data:', error);
      setQuizHistory([]); // Set empty array on error
      throw error;
    }
  };

  const getTests = () => {
    switch (activeView) {
      case 'author':
        return authorQuizzes;
      case 'organization':
        return getOrganizationTests(); // Tạm thời sử dụng mock data
      case 'candidate':
        return quizHistory;
      default:
        return [];
    }
  };

  const allTests = useMemo(() => getTests(), [activeView, authorQuizzes, quizHistory]);

  const filteredTests = useMemo(() => {
    if (!searchFilter) return allTests;
    return allTests.filter(test => test.id === searchFilter.id);
  }, [allTests, searchFilter]);

  const handleViewReport = (test) => {
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

  const handleRefresh = () => {
    loadData();
  };

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
          { paddingBottom: insets.bottom + 80 } 
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
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.BLUE} />
              <Text style={styles.loadingText}>Đang tải dữ liệu báo cáo...</Text>
            </View>
          ) : filteredTests.length > 0 ? (
            <>
              {filteredTests.map((test, index) => (
                <TestCard
                  key={`${activeView}-${test.id}-${index}`}
                  test={test}
                  onViewReport={handleViewReport}
                  reportType={activeView}
                  showBadges={shouldShowBadges}
                  customLabels={getCustomLabels()}
                />
              ))}
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={handleRefresh}
              >
                <Ionicons name="refresh" size={16} color={COLORS.BLUE} />
                <Text style={styles.refreshText}>Làm mới dữ liệu</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color="#aaa" />
              <Text style={styles.emptyStateText}>
                {activeView === 'author'
                  ? 'Bạn chưa tạo bài kiểm tra nào'
                  : activeView === 'candidate'
                  ? 'Bạn chưa làm bài kiểm tra nào'
                  : 'Không tìm thấy bài kiểm tra trong mục này'
                }
              </Text>
              {searchFilter && (
                <TouchableOpacity onPress={handleClearFilter}>
                  <Text style={styles.emptyStateAction}>Làm mới và thử lại</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.refreshButtonEmpty}
                onPress={handleRefresh}
              >
                <Ionicons name="refresh" size={16} color={COLORS.BLUE} />
                <Text style={styles.refreshText}>Làm mới</Text>
              </TouchableOpacity>
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
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BLUE,
  },
  refreshButtonEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  refreshText: {
    marginLeft: 4,
    color: COLORS.BLUE,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
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