import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constant/colors';

const QuestionListItem = ({ question, onEdit, onDelete }) => {
  // Debug logging
  const handleDelete = () => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa câu hỏi "${question.name}"?`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => onDelete(question.id),
        },
      ],
    );
  };

  const formatDuration = (seconds) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.questionInfo}>
          <Text style={styles.questionName} numberOfLines={2}>
            {question.name}
          </Text>
          <Text style={styles.questionDescription} numberOfLines={1}>
            {question.description || 'Không có mô tả'}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit(question)}
          >
            <Ionicons name="create-outline" size={20} color={COLORS.BLUE} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.RED} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.metadata}>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={16} color={COLORS.GRAY_DARK} />
          <Text style={styles.metaText}>{formatDuration(question.duration)}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="trophy-outline" size={16} color={COLORS.GRAY_DARK} />
          <Text style={styles.metaText}>{question.score} điểm</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="list-outline" size={16} color={COLORS.GRAY_DARK} />
          <Text style={styles.metaText}>
            {question.numberOfAnswer || question.number_of_answer || question.answers?.length || 0} đáp án
          </Text>
        </View>
      </View>

      {question.answers && question.answers.length > 0 && (
        <View style={styles.answersPreview}>
          <Text style={styles.answersTitle}>Đáp án:</Text>
          {question.answers.slice(0, 2).map((answer, index) => {
            const isCorrect = answer.is_correct !== undefined ? answer.is_correct :
                             (answer.isCorrect !== undefined ? answer.isCorrect : answer.IsCorrect);
            const answerText = answer.answer || answer.Answer || '';

            return (
              <View key={answer.id || index} style={styles.answerItem}>
                <Ionicons
                  name={isCorrect ? "checkmark-circle" : "radio-button-off"}
                  size={14}
                  color={isCorrect ? COLORS.GREEN : COLORS.GRAY_DARK}
                />
                <Text style={[
                  styles.answerText,
                  isCorrect && styles.correctAnswerText
                ]} numberOfLines={1}>
                  {answerText}
                </Text>
              </View>
            );
          })}
          {question.answers.length > 2 && (
            <Text style={styles.moreAnswers}>
              +{question.answers.length - 2} đáp án khác
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  questionInfo: {
    flex: 1,
    marginRight: 12,
  },
  questionName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 4,
  },
  questionDescription: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.BLUE + '10',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.RED + '10',
  },
  metadata: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.GRAY_DARK,
  },
  answersPreview: {
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_LIGHT,
    paddingTop: 12,
  },
  answersTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.BLACK,
    marginBottom: 8,
  },
  answerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  answerText: {
    fontSize: 13,
    color: COLORS.GRAY_DARK,
    flex: 1,
  },
  correctAnswerText: {
    color: COLORS.GREEN,
    fontWeight: '500',
  },
  moreAnswers: {
    fontSize: 12,
    color: COLORS.GRAY_DARK,
    fontStyle: 'italic',
    marginTop: 4,
  },
});

export default QuestionListItem;
