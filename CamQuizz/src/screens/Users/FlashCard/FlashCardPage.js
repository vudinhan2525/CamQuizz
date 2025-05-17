import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, StyleSheet, ScrollView } from 'react-native';
import { Home, Search, Menu, Plus, Cloud, BarChart, Settings, X, FileText } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import PropTypes from 'prop-types';
import COLORS from '../../../constant/colors';
import SCREENS from '../..';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FlashCardPage = () => {
  const navigation = useNavigation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateMethodDialogOpen, setIsCreateMethodDialogOpen] = useState(false);
  const [newSetName, setNewSetName] = useState('');
  const [flashcardSets, setFlashcardSets] = useState([
    { id: '123', title: '123', totalCards: 0, newCards: 0, learningCards: 0, reviewCards: 0 },
    { id: 'abc', title: 'abc', totalCards: 0, newCards: 0, learningCards: 0, reviewCards: 0 }
  ]);

  useFocusEffect(
    React.useCallback(() => {
      // Kiểm tra xem có flashcard set mới không
      const checkForNewFlashcardSet = async () => {
        try {
          const latestSetJson = await AsyncStorage.getItem('latestFlashcardSet');
          if (latestSetJson) {
            const newSet = JSON.parse(latestSetJson);
            
            setFlashcardSets(prevSets => {
              const existingSetIndex = prevSets.findIndex(set => set.id === newSet.id);
              if (existingSetIndex >= 0) {
                const updatedSets = [...prevSets];
                updatedSets[existingSetIndex] = newSet;
                return updatedSets;
              } else {
                return [...prevSets, newSet];
              }
            });
            
            // Xóa dữ liệu tạm
            await AsyncStorage.removeItem('latestFlashcardSet');
          }
        } catch (error) {
          console.error('Lỗi khi tải bộ thẻ mới:', error);
        }
      };
      
      checkForNewFlashcardSet();
      
      return () => {};
    }, [])
  );

  const handleOpenSet = (id) => {
    // Tìm bộ thẻ theo id
    const selectedSet = flashcardSets.find(set => set.id === id);
    
    // Chuyển đến màn hình chi tiết với toàn bộ thông tin của bộ thẻ
    navigation.navigate(SCREENS.FLASHCARD_SET_DETAIL, { 
      id: id,
      flashcardSet: selectedSet  // Truyền toàn bộ thông tin bộ thẻ
    });
  };

  const handleCreateSet = () => {
    if (!newSetName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Set name cannot be empty'
      });
      return;
    }

    const newSet = {
      id: Date.now().toString(),
      title: newSetName,
      totalCards: 0,
      newCards: 0,
      learningCards: 0,
      reviewCards: 0
    };

    setFlashcardSets([...flashcardSets, newSet]);
    setNewSetName('');
    setIsCreateDialogOpen(false);

    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: `Flashcard set "${newSetName}" created successfully`
    });
  };

  const handleCreateFromQuiz = () => {
    // Đóng dialog phương thức tạo
    setIsCreateMethodDialogOpen(false);
    // Chuyển đến màn hình chọn bài kiểm tra
    navigation.navigate(SCREENS.SELECT_QUIZ_FOR_FLASHCARD);
  };

  const handleManualCreate = () => {
    // Đóng dialog phương thức tạo
    setIsCreateMethodDialogOpen(false);
    // Mở dialog tạo bộ thẻ thông thường
    setIsCreateDialogOpen(true);
  };

  return (
    <View style={styles.container}>

      {/* Create Set Button */}
      <TouchableOpacity style={styles.createButton} onPress={() => setIsCreateMethodDialogOpen(true)}>
        <Plus size={20} color="white" />
        <Text style={styles.createButtonText}>Tạo bộ thẻ học bài</Text>
      </TouchableOpacity>

      {/* Flashcard Sets List */}
      <ScrollView style={styles.flashcardList}>
        {flashcardSets.map((set) => (
          <View key={set.id} style={styles.flashcardItem}>
            <View style={styles.flashcardHeader}>
              <Text style={styles.flashcardTitle}>{set.title}</Text>
              <TouchableOpacity style={styles.studyButton} onPress={() => handleOpenSet(set.id)}>
                  <Text style={styles.studyButtonText}>Học</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.flashcardDetail}>Tổng cộng: {set.totalCards}/{set.totalCards}</Text>
            <View style={styles.separator} />
            <View style={styles.flashcardStats}>
              <Text>Mới: <Text style={styles.statBold}>{set.newCards}</Text></Text>
              <Text>Đang học: <Text style={styles.statBold}>{set.learningCards}</Text></Text>
              <Text>Ôn tập: <Text style={styles.statBold}>{set.reviewCards}</Text></Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Create Method Selection Modal */}
      <Modal visible={isCreateMethodDialogOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Chọn phương thức tạo</Text>
            
            <TouchableOpacity style={styles.methodButton} onPress={handleManualCreate}>
              <Plus size={20} color={COLORS.BLUE} />
              <Text style={styles.methodButtonText}>Tạo thủ công</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.methodButton} onPress={handleCreateFromQuiz}>
              <FileText size={20} color={COLORS.BLUE} />
              <Text style={styles.methodButtonText}>Tạo từ bài kiểm tra</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsCreateMethodDialogOpen(false)}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create Set Modal */}
      <Modal visible={isCreateDialogOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Tạo bộ</Text>
            <TextInput
              style={styles.modalInput}
              value={newSetName}
              onChangeText={setNewSetName}
              placeholder="Bộ học bài"
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setIsCreateDialogOpen(false)}>
                <Text style={styles.modalCancel}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateSet}>
                <Text style={styles.modalOk}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

FlashCardPage.propTypes = {
  flashcardSets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      totalCards: PropTypes.number.isRequired,
      newCards: PropTypes.number.isRequired,
      learningCards: PropTypes.number.isRequired,
      reviewCards: PropTypes.number.isRequired,
    })
  ),
};

export default FlashCardPage;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.BLUE
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#06B6D4' 
  },
  headerIcons: { 
    flexDirection: 'row', 
    gap: 16 
  },
  statsContainer: { 
    backgroundColor: '#FFF', 
    padding: 16 
  },
  statsTitle: { 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  statsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginTop: 16 
  },
  statBox: { 
    alignItems: 'center' 
  },
  statNumber: { 
    fontSize: 36, 
    fontWeight: 'bold', 
    color: COLORS.BLUE, 
  },
  statLabel: { 
    color: '#777' 
  },
  statsFooter: { 
    textAlign: 'center', 
    marginTop: 10, 
    color: '#777' 
  },
  createButton: { 
    flexDirection: 'row', 
    backgroundColor: COLORS.BLUE, 
    padding: 10, 
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center', 
    margin: 16 
  },
  createButtonText: { 
    color: 'white', 
    marginLeft: 8 
  },
  flashcardList: { 
    padding: 16 
  },
  flashcardItem: { 
    backgroundColor: '#FFF', 
    padding: 16, 
    borderRadius: 8, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.BLUE 
  },
  flashcardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 8 
  },
  flashcardTitle: { 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  studyButton: { 
    backgroundColor: COLORS.BLUE, 
    padding: 8, 
    borderRadius: 8, 
  },
  studyButtonText: { 
    color: 'white' 
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  flashcardDetail: {
    color: '#666',
    marginBottom: 8,
  },
  flashcardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBold: {
    fontWeight: 'bold',
    color: COLORS.BLUE,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    width: '100%',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalCancel: {
    color: '#999',
    fontSize: 16,
  },
  modalOk: {
    color: COLORS.BLUE,
    fontWeight: 'bold',
    fontSize: 16,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
  },
  methodButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.BLUE,
  },
  cancelButton: {
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 16,
  },
});
