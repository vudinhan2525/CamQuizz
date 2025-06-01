import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import COLORS from '../../../constant/colors';

import ReportService from '../../../services/ReportService';
import { validateToken, checkAuthStatus } from '../../../services/AuthService';
import StudySetService from '../../../services/StudySetService';
import FlashCardService from '../../../services/FlashCardService';

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

const SelectQuestionsForFlashcard = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { quizId, quizTitle } = route.params;

  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [setName, setSetName] = useState(quizTitle || 'Bộ thẻ mới');

  useEffect(() => {
    fetchQuizAttempts();
  }, [quizId]);

  const fetchQuizAttempts = async () => {
    try {
      if (!await validateToken()) {
        handleAuthError(navigation);
        return;
      }

      setLoading(true);
      const response = await ReportService.getQuizAttempts(quizId);

      if (response && response.data && response.data.length > 0) {
        // Lấy attempt gần nhất (attempt đầu tiên trong mảng)
        const latestAttempt = response.data[0];
        console.log('Latest attempt:', latestAttempt); // Debug log

        // Xử lý cả PascalCase và snake_case/camelCase
        const questionReviews = latestAttempt.QuestionReviews || latestAttempt.questionReviews || latestAttempt.question_reviews;

        if (questionReviews && questionReviews.length > 0) {
          // Format dữ liệu câu hỏi từ attempt
          const formattedQuestions = questionReviews.map(review => {
            console.log('Processing question review:', review); // Debug log

            // Xử lý cả PascalCase và snake_case/camelCase
            const questionId = review.QuestionId || review.questionId || review.question_id;
            const questionName = review.QuestionName || review.questionName || review.question_name;
            const selectedAnswers = review.SelectedAnswers || review.selectedAnswers || review.selected_answers || [];
            const correctAnswers = review.CorrectAnswers || review.correctAnswers || review.correct_answers || [];

            // Lấy đáp án đúng
            const correctAnswerTexts = correctAnswers.map(ans =>
              ans.AnswerText || ans.answerText || ans.answer_text || ans.text || 'N/A'
            ).join(', ');

            return {
              id: questionId ? questionId.toString() : 'unknown',
              question: questionName || 'Câu hỏi không xác định',
              answer: correctAnswerTexts || 'Không có đáp án',
              selectedAnswers: selectedAnswers,
              correctAnswers: correctAnswers
            };
          });

          console.log('Formatted questions:', formattedQuestions); // Debug log
          setQuestions(formattedQuestions);
        } else {
          console.log('No question reviews found in attempt:', latestAttempt); // Debug log
          Toast.show({
            type: 'info',
            text1: 'Thông báo',
            text2: 'Không tìm thấy câu hỏi trong kết quả quiz này.'
          });
        }
      } else {
        console.log('No attempts found in response:', response); // Debug log
        Toast.show({
          type: 'info',
          text1: 'Thông báo',
          text2: 'Bạn chưa có kết quả nào cho quiz này.'
        });
      }
    } catch (error) {
      console.error('Error fetching quiz attempts:', error);

      if (error.message === 'Unauthorized - Please log in again' || error.response?.status === 401) {
        handleAuthError(navigation);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không thể tải câu hỏi từ kết quả quiz. Vui lòng thử lại sau.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestionSelection = (questionId) => {
    if (selectedQuestions.includes(questionId)) {
      setSelectedQuestions(selectedQuestions.filter(id => id !== questionId));
    } else {
      setSelectedQuestions([...selectedQuestions, questionId]);
    }
  };

  const handleCreateFlashcardSet = async () => {
    if (selectedQuestions.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng chọn ít nhất một câu hỏi'
      });
      return;
    }

    if (!setName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Tên bộ thẻ không được để trống'
      });
      return;
    }

    try {
      setCreating(true);

      // Kiểm tra authentication
      if (!await validateToken()) {
        handleAuthError(navigation);
        return;
      }

      // Lấy thông tin user
      const authStatus = await checkAuthStatus();
      if (!authStatus || !authStatus.id) {
        handleAuthError(navigation, 'Vui lòng đăng nhập lại để tiếp tục');
        return;
      }

      const userId = authStatus.id;

      // Tạo bộ thẻ mới với các câu hỏi đã chọn
      const selectedQuestionObjects = questions.filter(q => selectedQuestions.includes(q.id));

      console.log('Creating study set with name:', setName);
      console.log('Selected questions:', selectedQuestionObjects);

      // Bước 1: Tạo StudySet trước
      const studySetData = {
        name: setName,
        user_id: userId
      };

      const createdStudySet = await StudySetService.createStudySet(studySetData);
      console.log('Created study set:', createdStudySet);

      if (!createdStudySet || !createdStudySet.id) {
        throw new Error('Không thể tạo bộ thẻ học bài');
      }

      // Bước 2: Tạo từng FlashCard
      const createdFlashcards = [];
      for (const question of selectedQuestionObjects) {
        try {
          const flashcardData = {
            study_set_id: createdStudySet.id,
            question: question.question,
            answer: question.answer
          };

          console.log('Creating flashcard:', flashcardData);
          const createdFlashcard = await FlashCardService.createFlashCard(flashcardData);
          console.log('Created flashcard:', createdFlashcard);

          if (createdFlashcard) {
            createdFlashcards.push(createdFlashcard);
          }
        } catch (flashcardError) {
          console.error('Error creating individual flashcard:', flashcardError);
          // Tiếp tục tạo các flashcard khác nếu có lỗi
        }
      }

      console.log(`Successfully created ${createdFlashcards.length}/${selectedQuestionObjects.length} flashcards`);

      // Quay lại màn hình trước đó
      navigation.goBack();

      // Hiển thị thông báo thành công
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: `Đã tạo bộ thẻ "${setName}" với ${createdFlashcards.length} thẻ`
      });

    } catch (error) {
      console.error('Lỗi khi tạo bộ thẻ:', error);

      if (error.message === 'Unauthorized - Please log in again' || error.response?.status === 401) {
        handleAuthError(navigation);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: error.message || 'Không thể tạo bộ thẻ. Vui lòng thử lại.'
        });
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn câu hỏi</Text>
        <TouchableOpacity onPress={handleCreateFlashcardSet}>
          <Check size={24} color={COLORS.BLUE} />
        </TouchableOpacity>
      </View>

      {/* Set Name Input */}
      <View style={styles.setNameContainer}>
        <Text style={styles.setNameLabel}>Tên bộ thẻ:</Text>
        <TextInput
          style={styles.setNameInput}
          value={setName}
          onChangeText={setSetName}
          placeholder="Nhập tên bộ thẻ"
        />
      </View>

      {/* Selection Info */}
      <View style={styles.selectionInfo}>
        <Text style={styles.selectionText}>
          Đã chọn {selectedQuestions.length}/{questions.length} câu hỏi
        </Text>
        <TouchableOpacity 
          onPress={() => setSelectedQuestions(questions.length > 0 ? questions.map(q => q.id) : [])}
        >
          <Text style={styles.selectAllText}>Chọn tất cả</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.BLUE} />
          <Text style={styles.loadingText}>Đang tải câu hỏi...</Text>
        </View>
      ) : questions.length > 0 ? (
        <FlatList
          data={questions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.questionItem,
                selectedQuestions.includes(item.id) && styles.selectedQuestionItem
              ]}
              onPress={() => toggleQuestionSelection(item.id)}
            >
              <View style={styles.questionContent}>
                <Text style={styles.questionText}>{item.question}</Text>
                <Text style={styles.answerText}>Đáp án đúng: {item.answer}</Text>

                {/* Hiển thị đáp án đã chọn nếu có */}
                {item.selectedAnswers && item.selectedAnswers.length > 0 && (
                  <View style={styles.selectedAnswersContainer}>
                    <Text style={styles.selectedAnswersLabel}>Bạn đã chọn:</Text>
                    {item.selectedAnswers.map((ans, index) => {
                      // Xử lý cả PascalCase và snake_case/camelCase
                      const answerText = ans.AnswerText || ans.answerText || ans.answer_text || ans.text || 'N/A';
                      const isCorrect = ans.IsCorrect !== undefined ? ans.IsCorrect :
                                       ans.isCorrect !== undefined ? ans.isCorrect :
                                       ans.is_correct !== undefined ? ans.is_correct : false;

                      return (
                        <Text
                          key={index}
                          style={[
                            styles.selectedAnswerText,
                            isCorrect ? styles.correctAnswer : styles.incorrectAnswer
                          ]}
                        >
                          • {answerText} {isCorrect ? '✓' : '✗'}
                        </Text>
                      );
                    })}
                  </View>
                )}
              </View>
              <View style={[
                styles.checkbox,
                selectedQuestions.includes(item.id) && styles.checkedCheckbox
              ]}>
                {selectedQuestions.includes(item.id) && (
                  <Check size={16} color="white" />
                )}
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có câu hỏi nào.</Text>
          <Text style={styles.emptySubText}>Vui lòng thử lại hoặc chọn quiz khác.</Text>
        </View>
      )}

      {/* Create Button */}
      <TouchableOpacity
        style={[
          styles.createButton,
          (selectedQuestions.length === 0 || creating) && styles.disabledButton
        ]}
        onPress={handleCreateFlashcardSet}
        disabled={selectedQuestions.length === 0 || creating}
      >
        {creating ? (
          <View style={styles.loadingButtonContent}>
            <ActivityIndicator size="small" color="white" />
            <Text style={[styles.createButtonText, { marginLeft: 8 }]}>
              Đang tạo bộ thẻ...
            </Text>
          </View>
        ) : (
          <Text style={styles.createButtonText}>
            Tạo bộ thẻ với {selectedQuestions.length} câu hỏi
          </Text>
        )}
      </TouchableOpacity>
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
  setNameContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  setNameLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  setNameInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  selectionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  selectionText: {
    fontSize: 16,
    color: '#666',
  },
  selectAllText: {
    fontSize: 16,
    color: COLORS.BLUE,
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
  listContent: {
    padding: 16,
    paddingBottom: 80, // Space for the create button
  },
  questionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedQuestionItem: {
    borderColor: COLORS.BLUE,
    backgroundColor: '#f0f8ff',
  },
  questionContent: {
    flex: 1,
    marginRight: 10,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  answerText: {
    fontSize: 14,
    color: '#666',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCheckbox: {
    backgroundColor: COLORS.BLUE,
    borderColor: COLORS.BLUE,
  },
  createButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: COLORS.BLUE,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedAnswersContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
  },
  selectedAnswersLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  selectedAnswerText: {
    fontSize: 12,
    marginBottom: 2,
  },
  correctAnswer: {
    color: '#4CAF50',
  },
  incorrectAnswer: {
    color: '#F44336',
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
  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SelectQuestionsForFlashcard;











