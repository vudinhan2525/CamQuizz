import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import COLORS from '../constant/colors';
import QuizCard from './QuizCard'; 
import { useNavigation } from '@react-navigation/native';
import SCREENS from '../screens';
import QuizzService from '../services/QuizzService';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
const CategorySection = ({ category, onSeeMore }) => {
  const navigation = useNavigation();
  const [quizzes,setQuizzes] = React.useState([]);
  React.useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const {data, paginationn} = await QuizzService.getAllQuizz(null, category.id, 1, 5);
        setQuizzes(data);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    };
    fetchQuizzes();
  }, [category.id]);
useFocusEffect(
  React.useCallback(() => {
    let isActive = true;

    async function fetchData() {
      try {
        const { data, paginationn } = await QuizzService.getAllQuizz(null, category.id, 1, 5);
        if (isActive) {
          setQuizzes(data);
        }
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    }

    fetchData();

    return () => {
      isActive = false;
    };
  }, [category.id])
);



  return (
    <View style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>{category.name}</Text>
        <TouchableOpacity onPress={onSeeMore}>
          <Text style={styles.seeMoreButton}>Xem thêm</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        style={{ marginHorizontal: 20 }}
        data={quizzes.slice(0, 5)}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <QuizCard 
            quiz={item} 
            onPress={() => navigation.navigate(SCREENS.QUIZ_DETAIL, { quiz: item })} 
          />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  categorySection: {
    marginVertical: 10,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  seeMoreButton: {
    color: COLORS.BLUE,
    fontSize: 16,
  },
});

export default CategorySection;