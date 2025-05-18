import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import COLORS from '../../../constant/colors';
import SCREENS from '../../../screens/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigateToFlashcardTab } from '../../../screens/Users/Library';

const SelectQuestionsForFlashcard = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { quizId, quizTitle } = route.params;
  
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setName, setSetName] = useState(quizTitle || 'Bộ thẻ mới');

  useEffect(() => {
    // Giả lập tải dữ liệu câu hỏi từ API
    setTimeout(() => {
      setQuestions([
        { id: '1', question: 'Thủ đô của Việt Nam là gì?', answer: 'Hà Nội' },
        { id: '2', question: '1 + 1 = ?', answer: '2' },
        { id: '3', question: 'Ngôn ngữ lập trình phổ biến nhất?', answer: 'JavaScript' },
        { id: '4', question: 'Ai là người sáng lập Facebook?', answer: 'Mark Zuckerberg' },
        { id: '5', question: 'Trái đất quay quanh mặt trời mất bao lâu?', answer: '365 ngày' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const toggleQuestionSelection = (questionId) => {
    if (selectedQuestions.includes(questionId)) {
      setSelectedQuestions(selectedQuestions.filter(id => id !== questionId));
    } else {
      setSelectedQuestions([...selectedQuestions, questionId]);
    }
  };

  const handleCreateFlashcardSet = async () => {
    if (selectedQuestions.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng chọn ít nhất một câu hỏi'
      });
      return;
    }

    if (!setName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Tên bộ thẻ không được để trống'
      });
      return;
    }

    // Tạo bộ thẻ mới với các câu hỏi đã chọn
    const selectedQuestionObjects = questions.filter(q => selectedQuestions.includes(q.id));
    
    // Tạo đối tượng bộ thẻ mới
    const newFlashcardSet = {
      id: Date.now().toString(),
      title: setName,
      totalCards: selectedQuestionObjects.length,
      newCards: selectedQuestionObjects.length,
      learningCards: 0,
      reviewCards: 0,
      
      cards: selectedQuestionObjects.map(q => ({
        front: q.question,
        back: q.answer
      }))
    };

    try {
      // Lấy danh sách bộ thẻ hiện có
      const existingSetsJson = await AsyncStorage.getItem('flashcardSets');
      const existingSets = existingSetsJson ? JSON.parse(existingSetsJson) : [];
      
      // Thêm bộ thẻ mới
      const updatedSets = [...existingSets, newFlashcardSet];
      
      // Lưu danh sách đã cập nhật
      await AsyncStorage.setItem('flashcardSets', JSON.stringify(updatedSets));
      
      // Lưu flashcard set vào AsyncStorage
      await AsyncStorage.setItem('latestFlashcardSet', JSON.stringify(newFlashcardSet));
      
      // Quay lại màn hình trước đó
      navigation.goBack();
      
      // Hiển thị thông báo thành công
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: `Đã tạo bộ thẻ "${setName}" với ${selectedQuestionObjects.length} thẻ`
      });
    } catch (error) {
      console.error('Lỗi khi lưu bộ thẻ:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể lưu bộ thẻ. Vui lòng thử lại.'
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn câu hỏi</Text>
        <TouchableOpacity onPress={handleCreateFlashcardSet}>
          <Check size={24} color={COLORS.BLUE} />
        </TouchableOpacity>
      </View>

      {/* Set Name Input */}
      <View style={styles.setNameContainer}>
        <Text style={styles.setNameLabel}>Tên bộ thẻ:</Text>
        <TextInput
          style={styles.setNameInput}
          value={setName}
          onChangeText={setSetName}
          placeholder="Nhập tên bộ thẻ"
        />
      </View>

      {/* Selection Info */}
      <View style={styles.selectionInfo}>
        <Text style={styles.selectionText}>
          Đã chọn {selectedQuestions.length}/{questions.length} câu hỏi
        </Text>
        <TouchableOpacity 
          onPress={() => setSelectedQuestions(questions.length > 0 ? questions.map(q => q.id) : [])}
        >
          <Text style={styles.selectAllText}>Chọn tất cả</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.BLUE} />
          <Text style={styles.loadingText}>Đang tải câu hỏi...</Text>
        </View>
      ) : (
        <FlatList
          data={questions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.questionItem,
                selectedQuestions.includes(item.id) && styles.selectedQuestionItem
              ]}
              onPress={() => toggleQuestionSelection(item.id)}
            >
              <View style={styles.questionContent}>
                <Text style={styles.questionText}>{item.question}</Text>
                <Text style={styles.answerText}>Đáp án: {item.answer}</Text>
              </View>
              <View style={[
                styles.checkbox,
                selectedQuestions.includes(item.id) && styles.checkedCheckbox
              ]}>
                {selectedQuestions.includes(item.id) && (
                  <Check size={16} color="white" />
                )}
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Create Button */}
      <TouchableOpacity 
        style={[
                    styles.createButton,
          selectedQuestions.length === 0 && styles.disabledButton
        ]}
        onPress={handleCreateFlashcardSet}
        disabled={selectedQuestions.length === 0}
      >
        <Text style={styles.createButtonText}>
          Tạo bộ thẻ với {selectedQuestions.length} câu hỏi
        </Text>
      </TouchableOpacity>
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
  setNameContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  setNameLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  setNameInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  selectionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  selectionText: {
    fontSize: 16,
    color: '#666',
  },
  selectAllText: {
    fontSize: 16,
    color: COLORS.BLUE,
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
  listContent: {
    padding: 16,
    paddingBottom: 80, // Space for the create button
  },
  questionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedQuestionItem: {
    borderColor: COLORS.BLUE,
    backgroundColor: '#f0f8ff',
  },
  questionContent: {
    flex: 1,
    marginRight: 10,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  answerText: {
    fontSize: 14,
    color: '#666',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCheckbox: {
    backgroundColor: COLORS.BLUE,
    borderColor: COLORS.BLUE,
  },
  createButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: COLORS.BLUE,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SelectQuestionsForFlashcard;











