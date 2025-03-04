import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import COLORS from '../constant/colors';
import QuizCard from './QuizCard'; 

const CategorySection = ({ category, quizzes, onSeeMore }) => {
  return (
    <View style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>{category}</Text>
        <TouchableOpacity onPress={onSeeMore}>
          <Text style={styles.seeMoreButton}>Xem thêm</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        style={{ marginHorizontal: 20 }}
        data={quizzes.slice(0, 5)}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <QuizCard quiz={item} />}
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