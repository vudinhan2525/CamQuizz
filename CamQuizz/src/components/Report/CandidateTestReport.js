import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constant/colors';

const CandidateTestReport = ({ tests, onGoBack }) => {
  if (!tests || tests.length === 0) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 32 }}>
        <Text>Bạn chưa có bất kì bài kiểm tra nào hiện tại.</Text>
      </View>
    );
  }

  const candidateId = 'user-2';

  const getTestResult = (test) => {
    return test.results.find(result => result.candidateId === candidateId);
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <TouchableOpacity style={styles.backButton} onPress={() => onGoBack && onGoBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.BLUE} />
          <Text style={styles.backText}>Trở về</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Lịch sử làm bài của bạn</Text>

      {tests.map(test => {
        const result = getTestResult(test);
        if (!result) return null;

        const scorePercentage = Math.round((result.score / result.totalQuestions) * 100);
        const scoreColor = scorePercentage >= 70 ? '#10B981' : scorePercentage >= 40 ? '#FBBF24' : '#EF4444';

        return (
          <View key={test.id} style={{ backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 16, elevation: 3 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, width: 200 }}>
              <View style={{width: 150}}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{test.title}</Text>
                <Text style={{ fontSize: 12, color: '#6B7280' }}>
                  Hoàn thành {new Date(result.completedAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.BLUE, marginLeft: 50 }}>
                  Điểm: {scorePercentage}%
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center' }}>
                  {result.score} trên {result.totalQuestions} đúng
                </Text>
              </View>
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>Câu trả lời</Text>
              {test.questions.map(question => {
                const answer = result.answers.find(a => a.questionId === question.id);
                if (!answer) return null;

                const selectedChoice = question.choices.find(c => c.id === answer.choiceId);
                const correctChoice = question.choices.find(c => c.isCorrect);

                return (
                  <View key={question.id} style={{ backgroundColor: '#F3F4F6', padding: 12, borderRadius: 6, marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Ionicons
                        name={answer.isCorrect ? 'checkmark-circle-outline' : 'close-circle-outline'}
                        size={20}
                        color={answer.isCorrect ? COLORS.BLUE : '#EF4444'}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={{ fontSize: 14, color: '#111827', marginRight: 20 }}>{question.text}</Text>
                    </View>

                    <View style={{ marginLeft: 28 }}>
                      {selectedChoice && (
                        <Text style={{ fontSize: 14, color: answer.isCorrect ? COLORS.BLUE : '#EF4444' }}>
                          Đáp án của bạn: {selectedChoice.text}
                        </Text>
                      )}
                      {!answer.isCorrect && correctChoice && (
                        <Text style={{ fontSize: 14, color: COLORS.BLUE, marginTop: 4 }}>
                          Đáp án đúng: {correctChoice.text}
                        </Text>
                      )}
                    </View>
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
  backButton: {
    flexDirection: 'row',
    marginBottom: 20
  },
  backText: {
    marginLeft: 8,        
    fontSize: 16,         
    
  },
});

export default CandidateTestReport;
