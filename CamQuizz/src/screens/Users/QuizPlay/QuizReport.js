import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';
import COLORS from '../../../constant/colors';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 0.8) => `rgba(20, 50, 247, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.7,
  decimalPlaces: 0,
  useShadowColorFromDataset: false,
};

const QuizReport = ({ navigation, route }) => {
  const { quizId } = route.params;
  const [activeTab, setActiveTab] = useState('personal');
  
  // Mock data for personal results
  const personalResult = {
    score: 75,
    totalQuestions: 10,
    correctAnswers: 7.5,
    completedAt: new Date(),
    timeSpent: '8:45',
    answers: [
      { questionId: 1, questionText: 'What is the capital of France?', isCorrect: true, userAnswer: 'Paris', correctAnswer: 'Paris' },
      { questionId: 2, questionText: 'Which planet is known as the Red Planet?', isCorrect: true, userAnswer: 'Mars', correctAnswer: 'Mars' },
      { questionId: 3, questionText: 'What is the largest ocean on Earth?', isCorrect: false, userAnswer: 'Atlantic', correctAnswer: 'Pacific' },
      { questionId: 4, questionText: 'Who wrote "Romeo and Juliet"?', isCorrect: true, userAnswer: 'William Shakespeare', correctAnswer: 'William Shakespeare' },
      { questionId: 5, questionText: 'What is the chemical symbol for gold?', isCorrect: true, userAnswer: 'Au', correctAnswer: 'Au' },
      { questionId: 6, questionText: 'Which country is known as the Land of the Rising Sun?', isCorrect: true, userAnswer: 'Japan', correctAnswer: 'Japan' },
      { questionId: 7, questionText: 'What is the tallest mountain in the world?', isCorrect: true, userAnswer: 'Mount Everest', correctAnswer: 'Mount Everest' },
      { questionId: 8, questionText: 'Who painted the Mona Lisa?', isCorrect: false, userAnswer: 'Michelangelo', correctAnswer: 'Leonardo da Vinci' },
      { questionId: 9, questionText: 'What is the largest mammal on Earth?', isCorrect: true, userAnswer: 'Blue Whale', correctAnswer: 'Blue Whale' },
      { questionId: 10, questionText: 'Which element has the chemical symbol "O"?', isCorrect: false, userAnswer: 'Osmium', correctAnswer: 'Oxygen' },
    ]
  };
  
  // Mock data for overall results
  const overallResults = {
    totalAttempts: 45,
    uniqueParticipants: 32,
    averageScore: 68,
    questionPerformance: [
      { id: 1, text: 'What is the capital of France?', correctPercentage: 92 },
      { id: 2, text: 'Which planet is known as the Red Planet?', correctPercentage: 85 },
      { id: 3, text: 'What is the largest ocean on Earth?', correctPercentage: 62 },
      { id: 4, text: 'Who wrote "Romeo and Juliet"?', correctPercentage: 78 },
      { id: 5, text: 'What is the chemical symbol for gold?', correctPercentage: 70 },
      { id: 6, text: 'Which country is known as the Land of the Rising Sun?', correctPercentage: 88 },
      { id: 7, text: 'What is the tallest mountain in the world?', correctPercentage: 95 },
      { id: 8, text: 'Who painted the Mona Lisa?', correctPercentage: 45 },
      { id: 9, text: 'What is the largest mammal on Earth?', correctPercentage: 82 },
      { id: 10, text: 'Which element has the chemical symbol "O"?', correctPercentage: 58 },
    ],
    scoreDistribution: [
      { range: '0-20%', count: 2 },
      { range: '21-40%', count: 5 },
      { range: '41-60%', count: 8 },
      { range: '61-80%', count: 12 },
      { range: '81-100%', count: 5 },
    ]
  };

  const renderPersonalTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Score Summary */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreValue}>{personalResult.score}%</Text>
        </View>
        <Text style={styles.scoreText}>
          {personalResult.correctAnswers} / {personalResult.totalQuestions} câu đúng
        </Text>
        <Text style={styles.completedDate}>
          Hoàn thành: {personalResult.completedAt.toLocaleDateString()}
        </Text>
        <Text style={styles.timeSpent}>
          Thời gian làm bài: {personalResult.timeSpent}
        </Text>
      </View>

      {/* Answer Review */}
      <Text style={styles.sectionTitle}>Chi tiết câu trả lời</Text>
      {personalResult.answers.map((answer, index) => (
        <View key={answer.questionId} style={styles.answerCard}>
          <View style={styles.questionHeader}>
            <View style={[
              styles.questionNumberBadge, 
              { backgroundColor: answer.isCorrect ? COLORS.BLUE : COLORS.RED }
            ]}>
              <Text style={styles.questionNumber}>{index + 1}</Text>
            </View>
            <Text style={styles.questionText}>{answer.questionText}</Text>
          </View>
          
          <View style={styles.answerDetails}>
            <View style={styles.answerRow}>
              <Text style={styles.answerLabel}>Câu trả lời của bạn:</Text>
              <Text style={[
                styles.answerValue, 
                { color: answer.isCorrect ? COLORS.BLUE : COLORS.RED }
              ]}>
                {answer.userAnswer}
              </Text>
            </View>
            
            {!answer.isCorrect && (
              <View style={styles.answerRow}>
                <Text style={styles.answerLabel}>Đáp án đúng:</Text>
                <Text style={[styles.answerValue, { color: COLORS.BLUE }]}>
                  {answer.correctAnswer}
                </Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderOverallTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Statistics Cards */}
      <View style={styles.statisticsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="bar-chart-outline" size={20} color={COLORS.BLUE}/>
          <Text style={styles.statText}>Số lượt làm bài</Text>
          <Text style={styles.statValue}>{overallResults.totalAttempts}</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="people-outline" size={20} color={COLORS.BLUE} />
          <Text style={styles.statText}>Số người tham gia</Text>
          <Text style={styles.statValue}>{overallResults.uniqueParticipants}</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="checkmark-done-circle-outline" size={20} color={COLORS.BLUE} />
          <Text style={styles.statText}>Điểm trung bình</Text>
          <Text style={styles.statValue}>{overallResults.averageScore}%</Text>
        </View>
      </View>

      {/* Score Distribution Chart */}
      <Text style={styles.sectionTitle}>Phân bố điểm số</Text>
      <View style={styles.chartContainer}>
        <BarChart
          data={{
            labels: overallResults.scoreDistribution.map(item => item.range),
            datasets: [{ data: overallResults.scoreDistribution.map(item => item.count) }],
          }}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          verticalLabelRotation={0}
          fromZero={true}
          showValuesOnTopOfBars={true}
        />
      </View>

      {/* Question Performance */}
      <Text style={styles.sectionTitle}>Tỉ lệ đúng của mỗi câu hỏi</Text>
      {overallResults.questionPerformance.map((question) => (
        <View key={question.id} style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionText}>{question.text}</Text>
          </View>
          <View style={styles.performanceContainer}>
            <Text style={styles.correctPercentage}>{question.correctPercentage}%</Text>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${question.correctPercentage}%` }
                ]} 
              />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.BLUE} />
        </TouchableOpacity>
        <Text style={styles.title}>Báo cáo bài thi</Text>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'personal' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('personal')}
        >
          <Text style={[
            styles.tabButtonText,
            activeTab === 'personal' && styles.activeTabButtonText
          ]}>
            Kết quả của bạn
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'overall' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('overall')}
        >
          <Text style={[
            styles.tabButtonText,
            activeTab === 'overall' && styles.activeTabButtonText
          ]}>
            Kết quả tổng quan
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'personal' ? renderPersonalTab() : renderOverallTab()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.BLUE,
  },
  tabButtonText: {
    fontSize: 16,
    color: COLORS.GRAY_DARK,
  },
  activeTabButtonText: {
    color: COLORS.BLUE,
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  scoreCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  scoreText: {
    fontSize: 16,
    marginBottom: 8,
  },
  completedDate: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    marginBottom: 4,
  },
  timeSpent: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  answerCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questionNumber: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
    fontSize: 14,
  },
  questionText: {
    fontSize: 16,
    flex: 1,
  },
  answerDetails: {
    marginLeft: 36,
  },
  answerRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  answerLabel: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    width: 120,
  },
  answerValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  statisticsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    width: '31%',
    elevation: 1,
    borderWidth: 1,
    borderColor: COLORS.BLUE_LIGHT,
  },
  statText: {
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 8,
    color: COLORS.GRAY_DARK,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLUE,
  },
  chartContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  questionCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  performanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  correctPercentage: {
    width: 40,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.BLUE,
  },
  progressBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.BLUE,
  },
});

export default QuizReport;