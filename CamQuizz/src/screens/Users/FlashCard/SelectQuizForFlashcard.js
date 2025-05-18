import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../../../constant/colors';
import SCREENS from '../..';

const SelectQuizForFlashcard = () => {
  const navigation = useNavigation();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả lập tải dữ liệu bài kiểm tra từ API
    setTimeout(() => {
      setQuizzes([
        { id: '1', title: 'Kiểm tra toán học', questionsCount: 10, date: '10/05/2023' },
        { id: '2', title: 'Kiểm tra tiếng Anh', questionsCount: 15, date: '15/05/2023' },
        { id: '3', title: 'Kiểm tra vật lý', questionsCount: 8, date: '20/05/2023' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSelectQuiz = (quiz) => {
    navigation.navigate(SCREENS.SELECT_QUESTIONS_FOR_FLASHCARD, { 
      quizId: quiz.id,
      quizTitle: quiz.title
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn bài kiểm tra</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.BLUE} />
          <Text style={styles.loadingText}>Đang tải bài kiểm tra...</Text>
        </View>
      ) : (
        <>
          <Text style={styles.instruction}>Chọn một bài kiểm tra để tạo bộ thẻ học bài:</Text>
          
          <FlatList
            data={quizzes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.quizItem}
                onPress={() => handleSelectQuiz(item)}
              >
                <Text style={styles.quizTitle}>{item.title}</Text>
                <Text style={styles.quizInfo}>Số câu hỏi: {item.questionsCount}</Text>
                <Text style={styles.quizInfo}>Ngày làm: {item.date}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.BLUE,
  },
  instruction: {
    padding: 16,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 16,
  },
  quizItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  quizInfo: {
    color: '#666',
    marginBottom: 4,
  },
});

export default SelectQuizForFlashcard;