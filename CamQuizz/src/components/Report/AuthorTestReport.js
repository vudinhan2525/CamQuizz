import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Platform, ProgressBarAndroid, ActivityIndicator, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constant/colors';

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

  const totalAttempts = selectedTest.attempts;
  const uniqueParticipants = selectedTest.results.length;
  const averageScore =
    uniqueParticipants > 0
      ? Math.round(
          selectedTest.results.reduce((sum, result) => sum + (result.score / result.totalQuestions) * 100, 0) /
          uniqueParticipants
        )
      : 0;

  const calculateCorrectPercentage = (questionId) => {
    const totalAnswers = selectedTest.results.length;
    const correctAnswers = selectedTest.results.filter((result) =>
      result.answers.some((answer) => answer.questionId === questionId && answer.isCorrect)
    ).length;
    return totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
  };

  return (
    <View style={styles.container}>

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
          <Ionicons name="people-outline" size={20} color={COLORS.BLUE} />
          <Text style={styles.statText}>Số người tham gia</Text>
          <Text style={styles.statValue}>{uniqueParticipants}</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="checkmark-done-circle-outline" size={20} color={COLORS.BLUE} />
          <Text style={styles.statText}>Điểm trung bình</Text>
          <Text style={styles.statValue}>{averageScore}%</Text>
        </View>
      </View>

      {/* Question Performance */}
      <Text style={styles.sectionTitle}>Tỉ lệ đúng của mỗi câu hỏi</Text>
      <FlatList
        data={selectedTest.questions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const correctPercentage = calculateCorrectPercentage(item.id);
          return (
            <View style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionText}>{item.text}</Text>
              </View>
              <View style={styles.performanceContainer}>
                <Text style={styles.correctPercentage}>{correctPercentage}%</Text>
                {Platform.OS === 'android' ? (
                  <ProgressBarAndroid
                    styleAttr="Horizontal"
                    indeterminate={false}
                    progress={correctPercentage / 100}
                    color='blue'
                    style={styles.progressBar}
                  />
                ) : (
                  <ActivityIndicator
                    size="small"
                    color="#7E69AB"
                    style={styles.progressBar}
                  />
                )}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  selectorContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  statisticsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    elevation: 2,
    width: 100,
    borderColor: COLORS.BLUE,
  },
  statText: {
    marginTop: 8,
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    marginVertical: 12,
  },
  questionCard: {
    backgroundColor: COLORS.BLUE_LIGHT,
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 18,
  },
  performanceContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  correctPercentage: {
    marginRight: 8,
    fontSize: 16,
  },
  progressBar: {
    flex: 1,
    height: 10,
    borderRadius: 5,
  },
  backButton: {
    flexDirection: 'row',
    marginBottom: 20
  },
  backText: {
    marginLeft: 8,        
    fontSize: 16,         
    
  },

});

export default AuthorTestReport;
