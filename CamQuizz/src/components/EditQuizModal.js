import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Image, ScrollView, Alert, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Dropdown } from 'react-native-element-dropdown';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import COLORS from '../constant/colors';
import GenreService from '../services/GenreService';
import QuestionService from '../services/QuestionService';
import AnswerService from '../services/AnswerService';
import QuestionListItem from './QuestionListItem';
import SCREENS from '../screens';

const EditQuizModal = ({ visible, quiz, onClose, onSave, onDelete }) => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('info');
  const [quizData, setQuizData] = useState({
    id: '',
    name: '',
    image: '',
    genreId: null,
    status: 'Public'
  });
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Questions state
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  const statusOptions = [
    { label: 'Công khai', value: 'Public' },
    { label: 'Riêng tư', value: 'Private' },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await GenreService.getAllGenres();
        const categoriesData = response.data.map(item => ({
          label: item.name,
          value: item.id,
        }));
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        Alert.alert('Lỗi', 'Không thể tải danh sách chủ đề');
      }
    };

    if (visible) {
      fetchCategories();
    }
  }, [visible]);

  useEffect(() => {
    if (quiz && visible) {
      setQuizData({
        id: quiz.id,
        name: quiz.name || '',
        image: quiz.image || '',
        genreId: quiz.genre_id || quiz.genreId || null,
        status: quiz.status || 'Public'
      });
      setImageUri(quiz.image ? { uri: quiz.image } : null);

      if (quiz.id) {
        fetchQuestions(quiz.id);
      }
    }
  }, [quiz, visible]);

  useFocusEffect(
    React.useCallback(() => {
      if (visible && quizData.id && activeTab === 'questions') {
        fetchQuestions(quizData.id);
      }
    }, [visible, quizData.id, activeTab])
  );

  const fetchQuestions = async (quizId) => {
    setQuestionsLoading(true);
    try {
      console.log('Fetching questions for quiz:', quizId);
      const response = await QuestionService.getQuestionsByQuizId(quizId);
      console.log('Questions response:', response);
      console.log('Questions data:', response.data);

      if (response.data && response.data.length > 0) {
        for (let i = 0; i < response.data.length; i++) {
          const question = response.data[i];
          console.log(`Question ${i + 1}:`, question);
          console.log(`Question ${i + 1} answers:`, question.answers);
          console.log(`Question ${i + 1} answers count:`, question.answers?.length || 0);

          try {
            const answersResponse = await AnswerService.getAnswersByQuestionId(question.id);
            console.log(`Question ${i + 1} answers from separate API:`, answersResponse.data);
            console.log(`Question ${i + 1} separate answers count:`, answersResponse.data?.length || 0);

            if (answersResponse.data && answersResponse.data.length > (question.answers?.length || 0)) {
              console.log(`Using separate answers for question ${question.id}`);
              response.data[i].answers = answersResponse.data;
            }
          } catch (answerError) {
            console.warn(`Could not fetch separate answers for question ${question.id}:`, answerError);
          }
        }
      }

      setQuestions(response.data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách câu hỏi');
      setQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleEditQuestion = (question) => {
    const formattedQuestion = {
      id: question.id,
      points: question.score || 1,
      duration: question.duration || 30,
      question: question.name || '',
      questionImage: null,
      explanation: question.description || '',
      options: question.answers?.map((answer, index) => ({
        id: (index + 1).toString(),
        text: answer.answer || answer.Answer || '',
        isCorrect: answer.is_correct !== undefined ? answer.is_correct :
                  (answer.isCorrect !== undefined ? answer.isCorrect : answer.IsCorrect),
        image: null,
        originalId: answer.id
      })) || []
    };

    navigation.navigate(SCREENS.QUESTION_SETTING, {
      question: formattedQuestion,
      questions: questions,
      onSave: handleUpdateQuestion
    });
  };

  const handleUpdateQuestion = async (updatedQuestion) => {
    try {
      console.log('Updating question:', updatedQuestion);

      const updateDto = {
        questionId: updatedQuestion.id,
        name: updatedQuestion.question || 'Câu hỏi',
        description: updatedQuestion.explanation || 'Mô tả câu hỏi',
        score: updatedQuestion.points || 1,
        duration: updatedQuestion.duration || 30,
      };

      if (updateDto.name.trim().length < 3) {
        updateDto.name = 'Câu hỏi mới';
      }
      if (updateDto.description.trim().length < 10) {
        updateDto.description = 'Mô tả câu hỏi mới';
      }

      console.log('Updating question basic info...');
      await QuestionService.updateQuestion(updateDto);
      console.log('Question basic info updated successfully');

      if (updatedQuestion.options && updatedQuestion.options.length > 0) {
        const validAnswers = updatedQuestion.options.filter(opt => opt.text.trim() !== '');
        console.log('Smart updating answers:', validAnswers);

        const existingAnswers = questions.find(q => q.id === updatedQuestion.id)?.answers || [];
        console.log('Existing answers:', existingAnswers);

        try {
          await AnswerService.smartUpdateAnswers(updatedQuestion.id, validAnswers, existingAnswers);
          console.log('Answers smart updated successfully');
        } catch (answerError) {
          console.error('Error smart updating answers, trying fallback approach:', answerError);
          try {
            await AnswerService.updateMultipleAnswers(updatedQuestion.id, validAnswers);
            console.log('Fallback approach succeeded');
          } catch (altError) {
            console.error('Fallback approach also failed:', altError);
            Alert.alert(
              'Cảnh báo',
              'Thông tin câu hỏi đã được cập nhật nhưng không thể cập nhật đáp án. Vui lòng thử lại sau.'
            );
          }
        }
      }

      // Refresh questions list
      if (quizData.id) {
        fetchQuestions(quizData.id);
      }

      Alert.alert('Thành công', 'Đã cập nhật câu hỏi thành công');
    } catch (error) {
      console.error('Error updating question:', error);
      let errorMessage = 'Không thể cập nhật câu hỏi. Vui lòng thử lại.';
      if (error.response && error.response.data) {
        errorMessage += `\nChi tiết: ${JSON.stringify(error.response.data)}`;
      }
      Alert.alert('Lỗi', errorMessage);
    }
  };

  // Handle delete question
  const handleDeleteQuestion = async (questionId) => {
    try {
      // Delete all answers first
      const answersResponse = await AnswerService.getAnswersByQuestionId(questionId);
      if (answersResponse.data && answersResponse.data.length > 0) {
        const deleteAnswerPromises = answersResponse.data.map(answer =>
          AnswerService.deleteAnswer(answer.id)
        );
        await Promise.all(deleteAnswerPromises);
      }

      await QuestionService.deleteQuestion(questionId);

      setQuestions(prevQuestions =>
        prevQuestions.filter(q => q.id !== questionId)
      );

      Alert.alert('Thành công', 'Đã xóa câu hỏi thành công');
    } catch (error) {
      console.error('Error deleting question:', error);
      Alert.alert('Lỗi', 'Không thể xóa câu hỏi. Vui lòng thử lại.');
    }
  };

  // Handle create new question
  const handleCreateQuestion = () => {
    navigation.navigate(SCREENS.QUESTION_SETTING, {
      questions: questions,
      quizId: quizData.id, 
      onSave: handleAddQuestion,
      onQuestionCreated: () => {
        if (quizData.id) {
          fetchQuestions(quizData.id);
        }
      }
    });
  };

  // Handle add new question
  const handleAddQuestion = async (newQuestion) => {
    try {
      console.log('Creating new question:', newQuestion);

      const createDto = {
        name: newQuestion.question || 'Câu hỏi mới',
        description: newQuestion.explanation || 'Mô tả câu hỏi mới',
        score: newQuestion.points || 1,
        duration: newQuestion.duration || 30,
        quizId: quizData.id,
      };

      if (createDto.name.trim().length < 3) {
        createDto.name = 'Câu hỏi mới';
      }
      if (createDto.description.trim().length < 10) {
        createDto.description = 'Mô tả câu hỏi mới';
      }
      const questionResponse = await QuestionService.createQuestion(createDto);
      const createdQuestion = questionResponse.data;

      if (newQuestion.options && newQuestion.options.length > 0) {
        const validAnswers = newQuestion.options.filter(opt => opt.text.trim() !== '');
        if (validAnswers.length > 0) {
          console.log('Creating answers for question:', createdQuestion.id);

          // Wait a bit to ensure question is fully created
          await new Promise(resolve => setTimeout(resolve, 500));

          try {
            await AnswerService.createMultipleAnswers(createdQuestion.id, validAnswers);
            console.log('Answers created successfully');
          } catch (answerError) {
            console.error('Failed to create answers, but question was created:', answerError);
            Alert.alert(
              'Cảnh báo',
              'Câu hỏi đã được tạo thành công nhưng không thể tạo đáp án. Bạn có thể chỉnh sửa câu hỏi để thêm đáp án sau.'
            );
          }
        }
      }

      // Refresh questions list
      if (quizData.id) {
        fetchQuestions(quizData.id);
      }

      Alert.alert('Thành công', 'Đã thêm câu hỏi thành công');
    } catch (error) {
      console.error('Error creating question:', error);
      let errorMessage = 'Không thể tạo câu hỏi. Vui lòng thử lại.';
      if (error.response && error.response.data) {
        errorMessage += `\nChi tiết: ${JSON.stringify(error.response.data)}`;
      }
      Alert.alert('Lỗi', errorMessage);
    }
  };

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Ứng dụng cần quyền truy cập thư viện ảnh!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri({ uri: result.assets[0].uri });
      setQuizData(prev => ({
        ...prev,
        image: result.assets[0].uri
      }));
    }
  };

  const handleRemoveImage = () => {
    setImageUri(null);
    setQuizData(prev => ({
      ...prev,
      image: ''
    }));
  };

  const handleSave = async () => {
    if (!quizData.name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên bài kiểm tra');
      return;
    }

    if (!quizData.genreId) {
      Alert.alert('Lỗi', 'Vui lòng chọn chủ đề');
      return;
    }

    setLoading(true);
    try {
      await onSave(quizData);
      onClose();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật bài kiểm tra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa bài kiểm tra "${quizData.name}"?`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            if (onDelete) {
              onDelete(quizData.id);
              onClose();
            }
          },
        },
      ],
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.BLACK} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chỉnh sửa bài kiểm tra</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={handleDelete}
                disabled={loading}
                style={styles.deleteButton}
              >
                <Text style={[
                  styles.deleteButtonText,
                  loading && styles.saveButtonDisabled
                ]}>
                  Xóa
                </Text>
              </TouchableOpacity>
              {activeTab === 'info' && (
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={loading || !quizData.name.trim() || !quizData.genreId}
                  style={styles.saveButtonContainer}
                >
                  <Text style={[
                    styles.saveButton,
                    (loading || !quizData.name.trim() || !quizData.genreId) && styles.saveButtonDisabled
                  ]}>
                    {loading ? 'Đang lưu...' : 'Lưu'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'info' && styles.activeTab]}
              onPress={() => setActiveTab('info')}
            >
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={activeTab === 'info' ? COLORS.BLUE : COLORS.GRAY_DARK}
              />
              <Text style={[
                styles.tabText,
                activeTab === 'info' && styles.activeTabText
              ]}>
                Thông tin
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'questions' && styles.activeTab]}
              onPress={() => setActiveTab('questions')}
            >
              <Ionicons
                name="help-circle-outline"
                size={20}
                color={activeTab === 'questions' ? COLORS.BLUE : COLORS.GRAY_DARK}
              />
              <Text style={[
                styles.tabText,
                activeTab === 'questions' && styles.activeTabText
              ]}>
                Câu hỏi ({questions.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content based on active tab */}
          {activeTab === 'info' ? (
            <ScrollView style={styles.content}>
              {/* Image Section */}
              <View style={styles.imageSection}>
                <Text style={styles.sectionTitle}>Hình ảnh</Text>
                <TouchableOpacity style={styles.imageCard} onPress={handleImagePicker}>
                  {imageUri ? (
                    <>
                      <Image source={imageUri} style={styles.image} />
                      <View style={styles.imageActions}>
                        <TouchableOpacity onPress={handleRemoveImage} style={styles.actionButton}>
                          <Ionicons name="trash-outline" size={20} color={COLORS.RED} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleImagePicker} style={styles.actionButton}>
                          <Ionicons name="create-outline" size={20} color={COLORS.BLUE} />
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="image-outline" size={40} color={COLORS.GRAY_DARK} />
                      <Text style={styles.imagePlaceholderText}>Chọn hình ảnh</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Quiz Info Section */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Thông tin bài kiểm tra</Text>

                {/* Quiz Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Tên bài kiểm tra <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Nhập tên bài kiểm tra"
                    value={quizData.name}
                    onChangeText={(text) => setQuizData(prev => ({ ...prev, name: text }))}
                  />
                </View>

                {/* Category */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Chủ đề <Text style={styles.required}>*</Text></Text>
                  <Dropdown
                    style={styles.dropdown}
                    data={categories}
                    labelField="label"
                    valueField="value"
                    placeholder="Chọn chủ đề"
                    value={quizData.genreId}
                    onChange={(item) => setQuizData(prev => ({ ...prev, genreId: item.value }))}
                    renderLeftIcon={() => (
                      <Ionicons name="library-outline" size={20} color={COLORS.GRAY_DARK} style={{ marginRight: 8 }} />
                    )}
                  />
                </View>

                {/* Status */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Trạng thái</Text>
                  <Dropdown
                    style={styles.dropdown}
                    data={statusOptions}
                    labelField="label"
                    valueField="value"
                    placeholder="Chọn trạng thái"
                    value={quizData.status}
                    onChange={(item) => setQuizData(prev => ({ ...prev, status: item.value }))}
                    renderLeftIcon={() => (
                      <Ionicons
                        name={quizData.status === 'Public' ? 'globe-outline' : 'lock-closed-outline'}
                        size={20}
                        color={COLORS.GRAY_DARK}
                        style={{ marginRight: 8 }}
                      />
                    )}
                  />
                </View>
              </View>
            </ScrollView>
          ) : (
            /* Questions Tab */
            <View style={styles.questionsContainer}>
              <View style={styles.questionsHeader}>
                <Text style={styles.sectionTitle}>Danh sách câu hỏi</Text>
                <TouchableOpacity
                  style={styles.addQuestionButton}
                  onPress={handleCreateQuestion}
                >
                  <Ionicons name="add" size={20} color={COLORS.WHITE} />
                  <Text style={styles.addQuestionText}>Thêm câu hỏi</Text>
                </TouchableOpacity>
              </View>

              {questionsLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.BLUE} />
                  <Text style={styles.loadingText}>Đang tải câu hỏi...</Text>
                </View>
              ) : questions.length > 0 ? (
                <FlatList
                  data={questions}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <QuestionListItem
                      question={item}
                      onEdit={handleEditQuestion}
                      onDelete={handleDeleteQuestion}
                    />
                  )}
                  style={styles.questionsList}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="help-circle-outline" size={64} color={COLORS.GRAY_LIGHT} />
                  <Text style={styles.emptyTitle}>Chưa có câu hỏi nào</Text>
                  <Text style={styles.emptyDescription}>
                    Thêm câu hỏi đầu tiên cho bài kiểm tra của bạn
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={handleCreateQuestion}
                  >
                    <Text style={styles.emptyButtonText}>Thêm câu hỏi</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    flex: 1,
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: COLORS.RED + '10',
  },
  deleteButtonText: {
    fontSize: 16,
    color: COLORS.RED,
    fontWeight: '600',
  },
  saveButtonContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: COLORS.BLUE + '10',
  },
  saveButton: {
    fontSize: 16,
    color: COLORS.BLUE,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    color: COLORS.GRAY_LIGHT,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginTop: 20,
    marginBottom: 12,
  },
  imageSection: {
    marginBottom: 20,
  },
  imageCard: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.GRAY_BG,
    minHeight: 150,
  },
  image: {
    width: '100%',
    height: 150,
  },
  imageActions: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 150,
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: COLORS.GRAY_DARK,
    fontSize: 14,
  },
  infoSection: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.BLACK,
    marginBottom: 8,
  },
  required: {
    color: COLORS.RED,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: COLORS.WHITE,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: COLORS.WHITE,
  },
  // Tab styles
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
    backgroundColor: COLORS.WHITE,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.BLUE,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.GRAY_DARK,
  },
  activeTabText: {
    color: COLORS.BLUE,
    fontWeight: '600',
  },
  // Questions styles
  questionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  addQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BLUE,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addQuestionText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '500',
  },
  questionsList: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.GRAY_DARK,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: COLORS.BLUE,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default EditQuizModal;
