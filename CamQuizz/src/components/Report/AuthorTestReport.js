import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import COLORS from '../../constant/colors';

const screenWidth = Dimensions.get('window').width;

const AuthorTestReport = ({ tests, onGoBack }) => {
  const [selectedTest, setSelectedTest] = useState(tests.length > 0 ? tests[0] : null);

  if (tests.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>Không tìm thấy bài thi nào. Tạo 1 bài thi để xem báo cáo</Text>
      </View>
    );
  }

  if (!selectedTest) {
    return (
      <View style={styles.centered}>
        <Text>Chọn 1 bài thi để xem báo cáo.</Text>
      </View>
    );
  }

  const totalAttempts = selectedTest.attempts || 0;
  const totalOrganizations = selectedTest.organizations?.length || 0;
  const uniqueParticipants = selectedTest.results?.length || 0;
  
  // Tính điểm trung bình
  const averageScore =
    uniqueParticipants > 0
      ? Math.round(
          selectedTest.results.reduce((sum, result) => sum + (result.score / result.totalQuestions) * 100, 0) /
          uniqueParticipants
        )
      : 0;
      
  // Tạo dữ liệu cho biểu đồ điểm
  const generateScoreDistribution = () => {
    const distribution = Array(10).fill(0);
    
    if (selectedTest.results && selectedTest.results.length > 0) {
      selectedTest.results.forEach(result => {
        if (result && result.score !== undefined && result.totalQuestions) {
          const score = Math.floor((result.score / result.totalQuestions) * 10);
          // Đảm bảo điểm 10/10 vẫn nằm trong mảng
          const index = score === 10 ? 9 : score;
          distribution[index]++;
        }
      });
    }
    
    return distribution;
  };

  // Tính tỷ lệ chọn mỗi đáp án cho từng câu hỏi
  const calculateAnswerDistribution = (questionId) => {
    const question = selectedTest.questions ? selectedTest.questions.find(q => q.id === questionId) : null;
    if (!question || !question.options) return [];
    
    const answerCounts = {};
    let totalAnswers = 0;
    
    // Khởi tạo đếm cho mỗi đáp án
    question.options.forEach(option => {
      answerCounts[option.id] = { count: 0, text: option.text, isCorrect: option.isCorrect };
    });
    
    // Đếm số lần chọn mỗi đáp án
    if (selectedTest.results && selectedTest.results.length > 0) {
      selectedTest.results.forEach(result => {
        if (result && result.answers) {
          const answer = result.answers.find(a => a.questionId === questionId);
          if (answer) {
            if (answerCounts[answer.selectedOptionId]) {
              answerCounts[answer.selectedOptionId].count++;
              totalAnswers++;
            }
          }
        }
      });
    }
    
    // Tính phần trăm
    return Object.values(answerCounts).map(item => ({
      ...item,
      percentage: totalAnswers > 0 ? Math.round((item.count / totalAnswers) * 100) : 0
    }));
  };

  // Tính thời gian trung bình trả lời mỗi câu hỏi
  const calculateAverageTime = (questionId) => {
    let totalTime = 0;
    let count = 0;
    
    if (selectedTest.results && selectedTest.results.length > 0) {
      selectedTest.results.forEach(result => {
        if (result && result.answers) {
          const answer = result.answers.find(a => a.questionId === questionId);
          if (answer && answer.timeSpent) {
            totalTime += answer.timeSpent;
            count++;
          }
        }
      });
    }
    
    return count > 0 ? Math.round(totalTime / count) : 0;
  };

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(0, 99, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false
  };

  // Render header và thống kê
  const renderHeader = () => (
    <View>
      <TouchableOpacity style={styles.backButton} onPress={() => onGoBack && onGoBack()}>
        <Ionicons name="arrow-back" size={24} color={COLORS.BLUE} />
        <Text style={styles.backText}>Trở về</Text>
      </TouchableOpacity>

      {/* Statistic Cards */}
      <View style={styles.statisticsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="bar-chart-outline" size={20} color={COLORS.BLUE}/>
          <Text style={styles.statText}>Số lượt làm bài</Text>
          <Text style={styles.statValue}>{totalAttempts}</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="business-outline" size={20} color={COLORS.BLUE} />
          <Text style={styles.statText}>Tổng lần tổ chức</Text>
          <Text style={styles.statValue}>{totalOrganizations}</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="people-outline" size={20} color={COLORS.BLUE} />
          <Text style={styles.statText}>Số người tham gia</Text>
          <Text style={styles.statValue}>{uniqueParticipants}</Text>
        </View>
      </View>

      {/* Score Distribution Chart */}
      <Text style={styles.sectionTitle}>Phân bố điểm số</Text>
      <View style={styles.chartContainer}>
        <BarChart
          data={{
            labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            datasets: [{ data: generateScoreDistribution() }],
          }}
          width={screenWidth - 48}
          height={220}
          chartConfig={chartConfig}
          verticalLabelRotation={0}
          fromZero={true}
          showValuesOnTopOfBars={true}
          style={{
            marginLeft: -20,
          }}  
        />
      </View>

      {/* Question Performance */}
      <Text style={styles.sectionTitle}>Phân tích câu hỏi</Text>
    </View>
  );

  // Render mỗi câu hỏi
  const renderQuestion = ({ item, index }) => {
    const answerDistribution = calculateAnswerDistribution(item.id);
    const avgTime = calculateAverageTime(item.id);
    
    return (
      <View style={styles.questionCard}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionNumber}>Câu {index + 1}</Text>
          <Text style={styles.questionText}>{item.text}</Text>
        </View>
        
        <View style={styles.questionStats}>
          <Text style={styles.avgTimeText}>Thời gian trung bình: {avgTime} giây</Text>
        </View>
        
        <Text style={styles.answerDistTitle}>Tỷ lệ chọn mỗi đáp án:</Text>
        {answerDistribution.map((option, idx) => (
          <View key={idx} style={styles.answerOption}>
            <View style={styles.answerTextContainer}>
              <Text style={styles.answerText}>{option.text}</Text>
              {option.isCorrect && (
                <Ionicons name="checkmark-circle" size={16} color="green" style={styles.correctIcon} />
              )}
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${option.percentage}%`, backgroundColor: option.isCorrect ? '#4CAF50' : '#2196F3' }
                ]} 
              />
              <Text style={styles.percentageText}>{option.percentage}%</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={selectedTest.questions || []}
        keyExtractor={(item) => item.id}
        renderItem={renderQuestion}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  statisticsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 2,
  },
  statText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLUE,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    elevation: 2,
    alignItems: 'center',
    paddingRight: 20,
  },
  questionCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  questionHeader: {
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
  },
  questionStats: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avgTimeText: {
    fontSize: 14,
    color: '#666',
  },
  answerDistTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  answerOption: {
    marginBottom: 8,
  },
  answerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  answerText: {
    fontSize: 14,
    flex: 1,
  },
  correctIcon: {
    marginLeft: 8,
  },
  progressBarContainer: {
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    height: '100%',
  },
  percentageText: {
    position: 'absolute',
    right: 8,
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default AuthorTestReport;