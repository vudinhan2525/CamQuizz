import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import COLORS from '../../constant/colors';

const screenWidth = Dimensions.get('window').width;

const AuthorTestReport = ({ tests, onGoBack, reportData }) => {
  const [selectedTest, setSelectedTest] = useState(tests.length > 0 ? tests[0] : null);

  console.log('AuthorTestReport - reportData:', reportData);
  console.log('AuthorTestReport - selectedTest:', selectedTest);

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

  // Tính toán thống kê từ dữ liệu quiz và reportData
  const totalAttempts = reportData?.total_attempts || reportData?.TotalAttempts || selectedTest.numberOfAttended || selectedTest.attempts || 0;
  const uniqueParticipants = totalAttempts; // Số lượt làm bài
  

      
  // Tạo dữ liệu cho biểu đồ phân bố điểm số thực tế từ 1-10
  const generateScoreDistribution = () => {
    // Tạo mảng cho điểm từ 1-10 (index 0 = điểm 1, index 9 = điểm 10)
    const distribution = Array(10).fill(0);

    if (reportData?.score_distribution || reportData?.ScoreDistribution) {
      // reportData.score_distribution là object với key là điểm số và value là số lượng
      const scoreData = reportData.score_distribution || reportData.ScoreDistribution;
      Object.entries(scoreData).forEach(([score, count]) => {
        const scoreNum = parseInt(score);
        // scoreNum là điểm thực tế từ backend (1-10)
        if (scoreNum >= 1 && scoreNum <= 10) {
          const index = scoreNum - 1; // Chuyển điểm 1-10 thành index 0-9
          distribution[index] = count;
        }
      });
    } else if (selectedTest.results && selectedTest.results.length > 0) {
      // Fallback to old logic if no reportData
      selectedTest.results.forEach(result => {
        if (result && result.score !== undefined && result.totalQuestions) {
          // Tính điểm thực tế từ 1-10
          const actualScore = Math.round((result.score / result.totalQuestions) * 10);
          const clampedScore = Math.max(1, Math.min(10, actualScore)); // Đảm bảo trong khoảng 1-10
          const index = clampedScore - 1;
          distribution[index]++;
        }
      });
    }

    return distribution;
  };

  // Labels cho trục X của biểu đồ (điểm số thực tế)
  const getScoreLabels = () => {
    return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  };

  // Tính điểm trung bình từ phân bố điểm
  const calculateAverageScore = () => {
    const distribution = generateScoreDistribution();
    let totalScore = 0;
    let totalCount = 0;

    distribution.forEach((count, index) => {
      const score = index + 1; // Chuyển index 0-9 thành điểm 1-10
      totalScore += score * count;
      totalCount += count;
    });

    return totalCount > 0 ? (totalScore / totalCount).toFixed(1) : 0;
  };

  // Tính tỷ lệ vượt qua (điểm >= 7)
  const calculatePassRate = () => {
    const distribution = generateScoreDistribution();
    let totalCount = 0;
    let passCount = 0;

    distribution.forEach((count, index) => {
      const score = index + 1; // Chuyển index 0-9 thành điểm 1-10
      totalCount += count;
      if (score >= 7) { // Điểm vượt qua >= 7
        passCount += count;
      }
    });

    return totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0;
  };

  // Tính tỷ lệ chọn mỗi đáp án cho từng câu hỏi từ reportData
  const calculateAnswerDistribution = (questionId) => {
    // Tìm thống kê câu hỏi từ reportData
    if (reportData?.question_stats || reportData?.QuestionStats) {
      const questionStatsArray = reportData.question_stats || reportData.QuestionStats;
      const questionStats = questionStatsArray.find(q =>
        (q.question_id || q.QuestionId) === questionId
      );
      if (questionStats && (questionStats.option_stats || questionStats.OptionStats)) {
        const optionStats = questionStats.option_stats || questionStats.OptionStats;
        return optionStats.map(option => ({
          text: option.answer_text || option.AnswerText,
          percentage: Math.round(option.selection_rate || option.SelectionRate),
          isCorrect: false, // Sẽ cần thêm thông tin này từ API nếu cần
          count: 0 // Không có thông tin count từ API
        }));
      }
    }

    // Fallback to old logic if no reportData
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

  // Tính thời gian trung bình trả lời mỗi câu hỏi từ reportData
  const calculateAverageTime = (questionId) => {
    // Tìm thống kê câu hỏi từ reportData
    if (reportData?.question_stats || reportData?.QuestionStats) {
      const questionStatsArray = reportData.question_stats || reportData.QuestionStats;
      const questionStats = questionStatsArray.find(q =>
        (q.question_id || q.QuestionId) === questionId
      );
      if (questionStats && (questionStats.average_answer_time || questionStats.AverageAnswerTime)) {
        return Math.round(questionStats.average_answer_time || questionStats.AverageAnswerTime);
      }
    }

    // Fallback to old logic if no reportData
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
          <Ionicons name="trophy-outline" size={20} color={COLORS.BLUE} />
          <Text style={styles.statText}>Số câu hỏi</Text>
          <Text style={styles.statValue}>{selectedTest.numberOfQuestions || selectedTest.questions?.length || 0}</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="people-outline" size={20} color={COLORS.BLUE} />
          <Text style={styles.statText}>Số người tham gia</Text>
          <Text style={styles.statValue}>{uniqueParticipants}</Text>
        </View>
      </View>

      {/* Score Distribution Chart */}
      <Text style={styles.sectionTitle}>Phân bố điểm số</Text>
      <Text style={styles.chartDescription}>
        Biểu đồ hiển thị số lượng người đạt từng điểm số (1-10). Điểm trung bình: {calculateAverageScore()}, Tỷ lệ vượt qua (≥7): {calculatePassRate()}%
      </Text>
      <View style={styles.chartContainer}>
        <BarChart
          data={{
            labels: getScoreLabels(),
            datasets: [{ data: generateScoreDistribution() }],
          }}
          width={screenWidth - 48}
          height={250}
          chartConfig={chartConfig}
          verticalLabelRotation={0}
          fromZero={true}
          showValuesOnTopOfBars={true}
          yAxisLabel="Số người"
          yAxisSuffix=""
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

  // Lấy danh sách câu hỏi từ reportData hoặc selectedTest
  const getQuestionsList = () => {
    if (reportData?.question_stats || reportData?.QuestionStats) {
      const questionStatsArray = reportData.question_stats || reportData.QuestionStats;
      return questionStatsArray.map(stat => ({
        id: stat.question_id || stat.QuestionId,
        text: stat.question_name || stat.QuestionName,
        name: stat.question_name || stat.QuestionName
      }));
    }
    return selectedTest.questions || [];
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={getQuestionsList()}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
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
  chartDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
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