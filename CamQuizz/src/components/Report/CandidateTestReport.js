import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constant/colors';

const CandidateTestReport = ({ tests, onGoBack }) => {
  const getTestResult = (test) => {
    // Lấy kết quả của người dùng hiện tại
    return test.results && test.results.length > 0 ? test.results[0] : null;
  };

  return (
  <ScrollView style={styles.container}>
    <TouchableOpacity style={styles.backButton} onPress={() => onGoBack && onGoBack()}>
      <Ionicons name="arrow-back" size={24} color={COLORS.BLUE} />
      <Text style={styles.backText}>Trở về</Text>
    </TouchableOpacity>

    <Text style={styles.title}>Lịch sử làm bài của bạn</Text>

    {tests && tests.map((test, testIndex) => {
      const result = getTestResult(test);
      if (!result) return null;

      const scorePercentage = result.totalQuestions ? 
        Math.round((result.score / result.totalQuestions) * 100) : 0;
      const scoreColor = scorePercentage >= 70 ? '#10B981' : scorePercentage >= 40 ? '#FBBF24' : '#EF4444';
      const attemptNumber = result.attemptNumber || testIndex + 1;
      const completedDate = result.completedAt ? new Date(result.completedAt) : new Date();

      return (
        <View key={test.id || testIndex} style={styles.testCard}>
          <View style={styles.testHeader}>
            <View style={styles.testInfo}>
              <Text style={styles.testTitle}>{test.title || 'Bài kiểm tra'}</Text>
              <Text style={styles.attemptInfo}>
                Lần làm thứ {attemptNumber} • {completedDate.toLocaleDateString()} {completedDate.toLocaleTimeString()}
              </Text>
            </View>
            <View style={styles.scoreContainer}>
              <Text style={[styles.scoreValue, { color: scoreColor }]}>
                {scorePercentage}%
              </Text>
              <Text style={styles.scoreDetail}>
                {result.score}/{result.totalQuestions} đúng
              </Text>
            </View>
          </View>

          <View style={styles.questionsContainer}>
            <Text style={styles.sectionTitle}>Chi tiết bài làm</Text>
            
            {test.questions && test.questions.map((question, index) => {
              if (!question) return null;
              
              const userAnswer = result.answers && result.answers.find(a => a.questionId === question.id);
              const selectedOption = question.options && userAnswer ? 
                question.options.find(o => o.id === userAnswer.selectedOptionId) : null;
              const correctOption = question.options ? 
                question.options.find(o => o.isCorrect) : null;
              const isCorrect = selectedOption?.isCorrect;
              
              return (
                <View key={question.id || index} style={styles.questionCard}>
                  <Text style={styles.questionNumber}>Câu {index + 1}</Text>
                  <Text style={styles.questionText}>{question.text}</Text>
                  
                  <View style={styles.optionsContainer}>
                    {question.options && question.options.map((option, optIdx) => {
                      if (!option) return null;
                      
                      const isSelected = userAnswer && option.id === userAnswer.selectedOptionId;
                      const isCorrectOption = option.isCorrect;
                      
                      let optionStyle = styles.option;
                      let textStyle = styles.optionText;
                      let iconName = null;
                      
                      if (isSelected && isCorrectOption) {
                        optionStyle = {...optionStyle, ...styles.correctSelectedOption};
                        textStyle = {...textStyle, ...styles.correctSelectedText};
                        iconName = "checkmark-circle";
                      } else if (isSelected && !isCorrectOption) {
                        optionStyle = {...optionStyle, ...styles.incorrectSelectedOption};
                        textStyle = {...textStyle, ...styles.incorrectSelectedText};
                        iconName = "close-circle";
                      } else if (!isSelected && isCorrectOption) {
                        optionStyle = {...optionStyle, ...styles.correctOption};
                        textStyle = {...textStyle, ...styles.correctText};
                      }
                      
                      return (
                        <View key={option.id || optIdx} style={optionStyle}>
                          <Text style={textStyle}>{option.text}</Text>
                          {iconName && (
                            <Ionicons 
                              name={iconName} 
                              size={20} 
                              color={isCorrectOption ? "#10B981" : "#EF4444"} 
                              style={styles.optionIcon}
                            />
                          )}
                        </View>
                      );
                    })}
                  </View>
                  
                  {userAnswer?.timeSpent && (
                    <Text style={styles.timeSpent}>
                      Thời gian trả lời: {userAnswer.timeSpent} giây
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      );
    })}
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
});

export default CandidateTestReport;