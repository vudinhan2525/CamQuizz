import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import COLORS from '../../../constant/colors';
import Entypo from 'react-native-vector-icons/Entypo';
export const SearchResult = ({ searchQuery, filters }) => {
  const quizzes = [
    {
      id: '1',
      title: 'Quiz 1',
      category: 'Category 1',
      plays: 100,
      questions: 10,
      image: 'https://via.placeholder.com/100',
    },
    {
      id: '2',
      title: 'Quiz 2',
      category: 'Category 2',
      plays: 200,
      questions: 20,
      image: 'https://via.placeholder.com/100',
    },
    {
      id: '3',
      title: 'Quiz 3',
      category: 'Category 3',
      plays: 300,
      questions: 30,
      image: 'https://via.placeholder.com/100',
    },
    {
      id: '4',
      title: 'Quiz 4',
      category: 'Category 4',
      plays: 300,
      questions: 30,
      image: 'https://via.placeholder.com/100',
    },
    {
      id: '5',
      title: 'Quiz 5',
      category: 'Category 5',
      plays: 300,
      questions: 30,
      image: 'https://via.placeholder.com/100',
    },
    {
      id: '6',
      title: 'Quiz 6',
      category: 'Category 6',
      plays: 300,
      questions: 30,
      image: 'https://via.placeholder.com/100',
    },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg'||item.image }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.row}>
          <Text style={styles.questions}>{item.questions} câu hỏi</Text>
          <Entypo name="dot-single"  size={20} color={COLORS.GRAY} />
          <Text style={styles.plays}>{item.plays} lượt làm bài</Text>
        </View>
        <View style={styles.categoryContainer}>
          <Text style={styles.category}>{item.category}</Text>
        </View>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footerContainer}>
      <TouchableOpacity style={styles.footerButton} onPress={() => console.log('See More pressed')}>
        <Text style={styles.footerButtonText}>See More</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={quizzes}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListFooterComponent={renderFooter}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color:COLORS.BLUE
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginVertical: 5,
  },
  plays: {
    fontSize: 14,
    color: '#888',
  },
  questions: {
    fontSize: 14,
    color: '#888',
  },
  categoryContainer: {
    backgroundColor: COLORS.BLUE,
    borderRadius: 5,
    paddingVertical: 2,
    paddingHorizontal: 5,
    alignSelf: 'flex-start',
  },
  category: {
    fontSize: 14,
    color: '#fff',
  },
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  footerButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.BLUE,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SearchResult;
