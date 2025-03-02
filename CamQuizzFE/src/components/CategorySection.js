import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import COLORS from '../constant/colors'

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
        renderItem={({ item }) => (
          <View style={styles.quizCard}>
            <Image source={{ uri: item.image }} style={styles.quizImage} />
            <View style={styles.quizInfo}>
              <Text style={styles.quizTitle}>{item.title}</Text>
              <Text style={styles.quizQuestions}>{item.questions} câu hỏi</Text>
            </View>
          </View>
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
  quizCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginRight: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
    marginVertical: 10
  },
  quizImage: {
    width: 100,
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
});

export default CategorySection;