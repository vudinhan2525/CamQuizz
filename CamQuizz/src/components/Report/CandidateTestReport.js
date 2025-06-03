import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constant/colors';
import QuizzService from '../../services/QuizzService';

const CandidateTestReport = ({ tests, onGoBack, attemptData }) => {
  console.log('CandidateTestReport - tests:', tests);
  console.log('CandidateTestReport - attemptData:', attemptData);

  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAttempts = () => {
    if (attemptData && attemptData.length > 0) {
      console.log('Using attemptData from API:', attemptData);
      return attemptData;
    }
    const fallbackData = tests && tests.length > 0 && tests[0].results ? tests[0].results : [];
    console.log('Using fallback data:', fallbackData);
    return fallbackData;
  };

  const attempts = getAttempts();
  console.log('Final attempts data:', attempts);
  console.log('Number of attempts:', attempts.length);

  // Fetch quiz data để lấy tất cả câu hỏi và đáp án
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        if (attempts.length > 0) {
          const quizId = attempts[0].quiz_id;
          console.log('Fetching quiz data for quizId:', quizId);

          const quiz = await QuizzService.getQuizzById(quizId);
          console.log('Fetched quiz data:', quiz);
          setQuizData(quiz);
        }
      } catch (error) {
        console.error('Error fetching quiz data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [attempts]);

  const mergeQuizWithAttemptData = (attempt) => {
    if (!quizData || !quizData.questions) {
      console.log('No quiz data available for merging');
      return [];
    }

    console.log('Merging quiz data with attempt data');
    console.log('Quiz questions:', quizData.questions);
    console.log('Attempt question_reviews:', attempt.question_reviews);

    const mergedQuestions = quizData.questions.map(question => {
      const questionReview = attempt.question_reviews?.find(
        review => review.question_id === question.id
      );

      console.log(`Processing question ${question.id}:`, question);
      console.log(`Found question review:`, questionReview);

      const mergedQuestion = {
        question_id: question.id,
        question_name: question.name,
        all_answers: question.answers.map(answer => {
          const isSelected = questionReview?.selected_answers?.some(
            selected => selected.answer_id === answer.id
          ) || false;

          return {
            answer_id: answer.id,
            answer_text: answer.answer,
            is_correct: answer.is_correct,
            isSelected: isSelected
          };
        })
      };

      console.log(`Merged question ${question.id}:`, mergedQuestion);
      return mergedQuestion;
    });

    console.log('Final merged questions:', mergedQuestions);
    return mergedQuestions;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
  <ScrollView
    style={styles.container}
    showsVerticalScrollIndicator={true}
    nestedScrollEnabled={true}
  >
    <TouchableOpacity style={styles.backButton} onPress={() => onGoBack && onGoBack()}>
      <Ionicons name="arrow-back" size={24} color={COLORS.BLUE} />
      <Text style={styles.backText}>Trở về</Text>
    </TouchableOpacity>

    <Text style={styles.title}>Lịch sử làm bài của bạn</Text>

    {attempts.length > 0 ? attempts.map((attempt, attemptIndex) => {
      const calculateScoreFromMergedData = () => {
        if (!quizData || !quizData.questions) {
          return {
            totalQuestions: attempt.total_questions || 0,
            totalCorrect: attempt.total_correct || attempt.score || 0,
            scorePercentage: Math.round(attempt.accuracy_rate || 0)
          };
        }

        const mergedQuestions = mergeQuizWithAttemptData(attempt);
        const totalQuestions = mergedQuestions.length;

        const totalCorrect = mergedQuestions.reduce((count, question) => {
          const selectedAnswers = question.all_answers.filter(answer => answer.isSelected);
          const correctAnswers = question.all_answers.filter(answer => answer.is_correct);

          const isQuestionCorrect = selectedAnswers.length > 0 &&
            selectedAnswers.every(answer => answer.is_correct) &&
            selectedAnswers.length === correctAnswers.length;

          return count + (isQuestionCorrect ? 1 : 0);
        }, 0);

        const scorePercentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

        console.log(`Score calculation - Total Questions: ${totalQuestions}, Total Correct: ${totalCorrect}, Percentage: ${scorePercentage}%`);

        return { totalQuestions, totalCorrect, scorePercentage };
      };

      const { totalQuestions, totalCorrect, scorePercentage } = calculateScoreFromMergedData();
      const scoreColor = scorePercentage >= 70 ? '#10B981' : scorePercentage >= 40 ? '#FBBF24' : '#EF4444';
      const attemptNumber = attempt.attempt_number || attemptIndex + 1;
      const completedDate = attempt.timestamp ? new Date(attempt.timestamp) : new Date();

      const quizTitle = attempt.quiz_name || (tests && tests[0] ? tests[0].title : 'Bài kiểm tra');
      const quizId = attempt.quiz_id || (tests && tests[0] ? tests[0].id : null);

      return (
        <View key={`attempt-${attemptIndex}-${quizId || 'unknown'}`} style={styles.testCard}>
          <View style={styles.testHeader}>
            <View style={styles.testInfo}>
              <Text style={styles.testTitle}>{quizTitle}</Text>
              <Text style={styles.attemptInfo}>
                Lần làm thứ {attemptNumber} • {completedDate.toLocaleDateString()} {completedDate.toLocaleTimeString()}
              </Text>
              {attempt.duration && (
                <Text style={styles.durationInfo}>
                  Thời gian làm bài: {Math.round(attempt.duration.totalMinutes || 0)} phút
                </Text>
              )}
            </View>
            <View style={styles.scoreContainer}>
              <Text style={[styles.scoreValue, { color: scoreColor }]}>
                {scorePercentage}%
              </Text>
              <Text style={styles.scoreDetail}>
                {totalCorrect}/{totalQuestions} đúng
              </Text>
            </View>
          </View>

          <View style={styles.questionsContainer}>
            <Text style={styles.sectionTitle}>Chi tiết bài làm</Text>



            {(() => {
              const mergedQuestions = mergeQuizWithAttemptData(attempt);
              console.log('Using merged questions:', mergedQuestions);

              return mergedQuestions.length > 0 ? (
                mergedQuestions.map((mergedQuestion, index) => {
                if (!mergedQuestion) return null;

                console.log(`Merged Question ${index}:`, mergedQuestion);

                const questionName = mergedQuestion.question_name || 'Câu hỏi không có tên';
                const questionId = mergedQuestion.question_id;
                const allAnswers = mergedQuestion.all_answers || [];

                console.log(`All answers for question ${questionId}:`, allAnswers);

                return (
                  <View key={`question-${attemptIndex}-${index}-${questionId || 'unknown'}`} style={styles.questionCard}>
                    <Text style={styles.questionNumber}>Câu {index + 1}</Text>
                    <Text style={styles.questionText}>{questionName}</Text>

                    <View style={styles.answersContainer}>
                      {/* Hiển thị tất cả đáp án */}
                      <View style={styles.answerSection}>
                        <Text style={styles.answerLabel}>Tất cả đáp án:</Text>
                        {allAnswers.map((answer, ansIdx) => {
                          // Xác định style và icon dựa trên trạng thái
                          let answerStyle = styles.neutralAnswer;
                          let textStyle = styles.neutralAnswerText;
                          let iconName = null;
                          let iconColor = null;

                          if (answer.isSelected && answer.is_correct) {
                            // Đã chọn và đúng - tích xanh
                            answerStyle = styles.correctAnswer;
                            textStyle = styles.correctAnswerText;
                            iconName = "checkmark-circle";
                            iconColor = "#10B981";
                          } else if (answer.isSelected && !answer.is_correct) {
                            // Đã chọn nhưng sai - tích đỏ
                            answerStyle = styles.incorrectAnswer;
                            textStyle = styles.incorrectAnswerText;
                            iconName = "close-circle";
                            iconColor = "#EF4444";
                          } else if (!answer.isSelected && answer.is_correct) {
                            // Không chọn nhưng là đáp án đúng - tích xanh
                            answerStyle = styles.correctAnswer;
                            textStyle = styles.correctAnswerText;
                            iconName = "checkmark-circle";
                            iconColor = "#10B981";
                          }

                          return (
                            <View
                              key={`all-answer-${attemptIndex}-${index}-${ansIdx}-${answer.answer_id || 'unknown'}`}
                              style={[styles.answerItem, answerStyle]}
                            >
                              <Text style={[styles.answerText, textStyle]}>
                                {answer.answer_text}
                              </Text>
                              {iconName && (
                                <Ionicons
                                  name={iconName}
                                  size={20}
                                  color={iconColor}
                                  style={styles.answerIcon}
                                />
                              )}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  </View>
                );
              })
              ) : (
                <View>
                  <Text style={styles.noQuestionsText}>
                    {!quizData ? 'Đang tải dữ liệu câu hỏi...' : 'Không có chi tiết câu hỏi cho lần làm bài này'}
                  </Text>

                  {/* Hiển thị thông tin cơ bản */}
                  <View style={styles.basicInfoContainer}>
                    <Text style={styles.basicInfoTitle}>Thông tin cơ bản:</Text>
                    <Text style={styles.basicInfoText}>Quiz ID: {attempt.quiz_id}</Text>
                    <Text style={styles.basicInfoText}>Điểm số: {totalCorrect}/{totalQuestions}</Text>
                    <Text style={styles.basicInfoText}>Độ chính xác: {scorePercentage}%</Text>
                    {attempt.duration && (
                      <Text style={styles.basicInfoText}>
                        Thời gian: {attempt.duration}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })()}
          </View>
        </View>
      );
    }) : (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>
          Không có lịch sử làm bài nào cho bài kiểm tra này
        </Text>
      </View>
    )}
  </ScrollView>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.BLUE,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  testCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 12,
  },
  testInfo: {
    flex: 1,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  attemptInfo: {
    fontSize: 14,
    color: '#6B7280',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreDetail: {
    fontSize: 14,
    color: '#6B7280',
  },
  questionsContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  questionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.BLUE,
    marginBottom: 4,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 12,
  },
  optionsContainer: {
    marginBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionText: {
    fontSize: 14,
    flex: 1,
  },
  correctSelectedOption: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10B981',
  },
    correctSelectedText: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  incorrectSelectedOption: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#EF4444',
  },
  incorrectSelectedText: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  correctOption: {
    borderColor: '#10B981',
  },
  correctText: {
    color: '#10B981',
  },
  optionIcon: {
    marginLeft: 8,
  },
  timeSpent: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  durationInfo: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  answersContainer: {
    marginBottom: 8,
  },
  answerSection: {
    marginBottom: 12,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#374151',
  },
  answerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 6,
    marginBottom: 4,
    borderWidth: 1,
  },
  answerText: {
    fontSize: 14,
    flex: 1,
  },
  answerIcon: {
    marginLeft: 8,
  },
  correctAnswer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10B981',
  },
  correctAnswerText: {
    color: '#10B981',
    fontWeight: '500',
  },
  incorrectAnswer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#EF4444',
  },
  incorrectAnswerText: {
    color: '#EF4444',
    fontWeight: '500',
  },
  neutralAnswer: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  neutralAnswerText: {
    color: '#6B7280',
    fontWeight: '400',
  },
  noQuestionsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },

  basicInfoContainer: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  basicInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1976d2',
  },
  basicInfoText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#424242',
  },
});

export default CandidateTestReport;