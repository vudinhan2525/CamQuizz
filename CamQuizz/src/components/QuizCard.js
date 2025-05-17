import React from 'react';
import { View, Text, StyleSheet,Dimensions, Image, TouchableOpacity } from 'react-native';
import COLORS from '../constant/colors';
import { useNavigation } from '@react-navigation/native';

import SCREENS from '../screens';
const tmpUrl='https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg'
const { width } = Dimensions.get('window'); 

const QuizCard = ({ quiz, attemptText = "lượt thi" }) => {
  const navigation = useNavigation();
  const handlePress = () => {
    navigation.navigate(SCREENS.QUIZ_DETAIL, { quizId: quiz.id });
  };
  return (
    <TouchableOpacity style={styles.quizCard}  onPress={() => handlePress()}>
      <Image source={{ uri: tmpUrl||quiz.image }} style={styles.quizImage} />
      <View style={styles.quizInfo}>
        <Text style={styles.quizTitle}>{quiz.title}</Text>
        <Text style={styles.quizQuestions}>{quiz.questions} câu hỏi</Text>
        <Text style={styles.quizAttempts}>{quiz.attempts} {attemptText}</Text>
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
    width: width * 0.45,
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
  },
  quizAttempts: {
    color: COLORS.GRAY_TEXT,
    fontSize: 14,
  },
});

export default QuizCard;