import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constant/colors';
import SCREENS from '../..';
import Entypo from 'react-native-vector-icons/Entypo';

const sampleGroupData = {
  name: 'Study Group',
  tests: [
    { name: 'Quiz 1', completed: 5 },
    { name: 'Quiz 2', completed: 3 },
    { name: 'Quiz 3', completed: 8 },
  ],
};
const GroupScreen = ({ navigation, route }) => {
  const group = sampleGroupData;
  const isLeader = true;
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

  const renderQuizItem = ({ item }) => (
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


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.BLACK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{group.name}</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate(SCREENS.GROUP_MESSAGE, { group })}
          >
            <Ionicons name="chatbubble-outline" size={24} color={COLORS.BLACK} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate(SCREENS.GROUP_MEMBERS, { group, isLeader })}
          >
            <Ionicons name="people-outline" size={24} color={COLORS.BLACK} />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={quizzes}
        renderItem={renderQuizItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.content}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    color: COLORS.BLACK,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  content: {
    padding: 16,
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
});

export default GroupScreen;