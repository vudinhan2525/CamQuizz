import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constant/colors';
import { useNavigation } from '@react-navigation/native';

import SCREENS from '../screens';
const tmpUrl='https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg'
const { width } = Dimensions.get('window');

const QuizCard = ({ quiz, attemptText = "lượt thi", showOptions = false, onEdit, onDelete }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate(SCREENS.QUIZ_DETAIL, { quizId: quiz.id });
  };

  const handleEditPress = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(quiz, onDelete); 
    }
  };

  return (
    <TouchableOpacity style={styles.quizCard} onPress={handlePress}>
      <Image source={{ uri: quiz.image || tmpUrl }} style={styles.quizImage} />
      <View style={styles.quizInfo}>
        <Text style={styles.quizTitle}>{quiz.name}</Text>
        <Text style={styles.quizQuestions}>{quiz.number_of_questions} câu hỏi</Text>
        <View style={styles.bottomRow}>
          <Text style={styles.quizAttempts}>{quiz.number_of_attended} {attemptText}</Text>
          {showOptions && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditPress}
            >
              <Ionicons name="create-outline" size={20} color={COLORS.BLUE} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  quizCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginRight:10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
    marginVertical: 10,
    width: width * 0.42,
  },
  quizImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
  },
  quizInfo: {
    marginTop: 10,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quizQuestions: {
    color: COLORS.GRAY_TEXT,
    fontSize: 14,
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quizAttempts: {
    color: COLORS.GRAY_TEXT,
    fontSize: 14,
    flex: 1,
  },
  editButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: COLORS.BLUE + '10',
    marginLeft: 8,
  },
});

export default QuizCard;