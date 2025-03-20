import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CandidateTestReport = ({ tests }) => {
  if (!tests || tests.length === 0) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 32 }}>
        <Text>Bạn chưa có bất kì bài kiểm tra nào hiện tại.</Text>
      </View>
    );
  }

  // Giả sử candidateId được cố định ở đây (trong thực tế sẽ là user đã đăng nhập)
  const candidateId = 'user-2';

  const getTestResult = (test) => {
    return test.results.find(result => result.candidateId === candidateId);
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Lịch sử làm bài của bạn</Text>

      {tests.map(test => {
        const result = getTestResult(test);
        if (!result) return null;

        const scorePercentage = Math.round((result.score / result.totalQuestions) * 100);
        const scoreColor = scorePercentage >= 70 ? '#10B981' : scorePercentage >= 40 ? '#FBBF24' : '#EF4444';

        return (
          <View key={test.id} style={{ backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 16, elevation: 3 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, width: 200 }}>
              <View>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{test.title}</Text>
                <Text style={{ fontSize: 12, color: '#6B7280' }}>
                  Hoàn thành {new Date(result.completedAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: scoreColor, marginLeft: 60 }}>
                  Điểm: {scorePercentage}%
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center' }}>
                  {result.score} trên {result.totalQuestions} đúng
                </Text>
              </View>
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>Question Breakdown</Text>
              {test.questions.map(question => {
                const answer = result.answers.find(a => a.questionId === question.id);
                if (!answer) return null;

                const selectedChoice = question.choices.find(c => c.id === answer.choiceId);
                const correctChoice = question.choices.find(c => c.isCorrect);

                return (
                  <View key={question.id} style={{ backgroundColor: '#F3F4F6', padding: 12, borderRadius: 6, marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Ionicons
                        name={answer.isCorrect ? 'checkmark-circle-outline' : 'cancel'}
                        size={20}
                        color={answer.isCorrect ? '#10B981' : '#EF4444'}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={{ fontSize: 14, color: '#111827', marginRight: 20 }}>{question.text}</Text>
                    </View>

                    <View style={{ marginLeft: 28 }}>
                      {selectedChoice && (
                        <Text style={{ fontSize: 14, color: answer.isCorrect ? '#10B981' : '#EF4444' }}>
                          Đáp án của bạn: {selectedChoice.text}
                        </Text>
                      )}
                      {!answer.isCorrect && correctChoice && (
                        <Text style={{ fontSize: 14, color: '#10B981', marginTop: 4 }}>
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

export default CandidateTestReport;
