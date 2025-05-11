import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarChart, PieChart } from 'react-native-chart-kit';
import COLORS from '../../constant/colors';

const screenWidth = Dimensions.get('window').width;

const OrganizationTestReport = ({ tests, onGoBack }) => {
  const [selectedTest, setSelectedTest] = useState(tests.length > 0 ? tests[0] : null);
  const [showParticipantsList, setShowParticipantsList] = useState(false);

  if (tests.length === 0) {
    return <Text style={{ textAlign: 'center', padding: 16 }}>Không tìm thấy bài thi nào.</Text>;
  }

  if (!selectedTest) {
    return <Text style={{ textAlign: 'center', padding: 16 }}>Chọn một bài thi để xem báo cáo.</Text>;
  }

  const totalParticipants = selectedTest.results?.length || 0;
  
  // Tính thời gian trung bình trả lời mỗi câu hỏi
  const calculateAverageTime = (questionId) => {
    let totalTime = 0;
    let count = 0;
    
    selectedTest.results.forEach(result => {
      const answer = result.answers.find(a => a.questionId === questionId);
      if (answer && answer.timeSpent) {
        totalTime += answer.timeSpent;
        count++;
      }
    });
    
    return count > 0 ? Math.round(totalTime / count) : 0;
  };
  
  // Tính tỷ lệ chọn mỗi đáp án cho từng câu hỏi
  const calculateAnswerDistribution = (questionId) => {
    const question = selectedTest.questions.find(q => q.id === questionId);
    if (!question) return [];
    
    const answerCounts = {};
    let totalAnswers = 0;
    
    // Khởi tạo đếm cho mỗi đáp án
    question.options.forEach(option => {
      answerCounts[option.id] = { count: 0, text: option.text, isCorrect: option.isCorrect };
    });
    
    // Đếm số lần chọn mỗi đáp án
    selectedTest.results.forEach(result => {
      const answer = result.answers.find(a => a.questionId === questionId);
      if (answer) {
        if (answerCounts[answer.selectedOptionId]) {
          answerCounts[answer.selectedOptionId].count++;
          totalAnswers++;
        }
      }
    });
    
    // Tính phần trăm
    return Object.values(answerCounts).map(item => ({
      ...item,
      percentage: totalAnswers > 0 ? Math.round((item.count / totalAnswers) * 100) : 0
    }));
  };

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(0, 99, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false
  };

  // Tạo dữ liệu cho biểu đồ tròn hiển thị phân bố điểm
  const generateScoreDistribution = () => {
    const ranges = [
      { name: '0-20%', count: 0, color: '#FF6384' },
      { name: '21-40%', count: 0, color: '#FF9F40' },
      { name: '41-60%', count: 0, color: '#FFCD56' },
      { name: '61-80%', count: 0, color: '#4BC0C0' },
      { name: '81-100%', count: 0, color: '#36A2EB' }
    ];
    
    selectedTest.results.forEach(result => {
      const scorePercentage = (result.score / result.totalQuestions) * 100;
      
      if (scorePercentage <= 20) ranges[0].count++;
      else if (scorePercentage <= 40) ranges[1].count++;
      else if (scorePercentage <= 60) ranges[2].count++;
      else if (scorePercentage <= 80) ranges[3].count++;
      else ranges[4].count++;
    });
    
    return ranges.map(range => ({
      name: range.name,
      population: range.count,
      color: range.color,
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => onGoBack && onGoBack()}>
        <Ionicons name="arrow-back" size={24} color={COLORS.BLUE} />
        <Text style={styles.backText}>Trở về</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>{selectedTest.title}</Text>
        <Text style={styles.date}>
          Thời điểm tổ chức: {new Date(selectedTest.organizationDate).toLocaleDateString()} {new Date(selectedTest.organizationDate).toLocaleTimeString()}
        </Text>
      </View>

      {/* Tổng số người tham gia */}
      <TouchableOpacity 
        style={styles.participantsCard}
        onPress={() => setShowParticipantsList(!showParticipantsList)}
      >
        <View style={styles.participantsHeader}>
          <View style={styles.participantsInfo}>
            <Ionicons name="people" size={24} color={COLORS.BLUE} />
            <Text style={styles.participantsTitle}>Tổng số người tham gia</Text>
          </View>
          <Text style={styles.participantsCount}>{totalParticipants}</Text>
          <Ionicons 
            name={showParticipantsList ? "chevron-up" : "chevron-down"} 
            size={24} 
            color={COLORS.BLUE} 
          />
        </View>
        
        {showParticipantsList && (
          <View style={styles.participantsList}>
            {selectedTest.results.map((result, index) => (
              <View key={index} style={styles.participantItem}>
                <Text style={styles.participantName}>{result.candidateName || `Người tham gia ${index + 1}`}</Text>
                <Text style={styles.participantScore}>
                  {Math.round((result.score / result.totalQuestions) * 100)}%
                </Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>

      {/* Phân bố điểm số */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Phân bố điểm số</Text>
        <PieChart
          data={generateScoreDistribution()}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>

      {/* Phân tích câu hỏi */}
      <Text style={styles.sectionTitle}>Phân tích câu hỏi</Text>
      {selectedTest.questions.map((question, index) => {
        const answerDistribution = calculateAnswerDistribution(question.id);
        const avgTime = calculateAverageTime(question.id);
        
        return (
          <View key={question.id} style={styles.questionCard}>
            <Text style={styles.questionNumber}>Câu {index + 1}</Text>
            <Text style={styles.questionText}>{question.text}</Text>
            
            <Text style={styles.avgTimeText}>Thời gian trung bình: {avgTime} giây</Text>
            
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
            
            {/* Danh sách đáp án của từng người */}
            <TouchableOpacity 
              style={styles.viewAnswersButton}
              onPress={() => {
                // Có thể mở modal hoặc mở rộng để hiển thị chi tiết
              }}
            >
              <Text style={styles.viewAnswersText}>Xem đáp án của từng người</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.BLUE} />
            </TouchableOpacity>
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
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  participantsCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  participantsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  participantsCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLUE,
  },
  participantsList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  participantName: {
    fontSize: 14,
  },
  participantScore: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  questionCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
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
  avgTimeText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
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
  viewAnswersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  viewAnswersText: {
    fontSize: 14,
    color: COLORS.BLUE,
    marginRight: 4,
  },
});

export default OrganizationTestReport;