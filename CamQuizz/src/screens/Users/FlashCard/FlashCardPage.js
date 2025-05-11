import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, StyleSheet, ScrollView } from 'react-native';
import { Home, Search, Menu, Plus, Cloud, BarChart, Settings, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import PropTypes from 'prop-types';
import COLORS from '../../../constant/colors';
import SCREENS from '../..';

const FlashCardPage = () => {
  const navigation = useNavigation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSetName, setNewSetName] = useState('');
  const [flashcardSets, setFlashcardSets] = useState([
    { id: '123', title: '123', totalCards: 0, newCards: 0, learningCards: 0, reviewCards: 0 },
    { id: 'abc', title: 'abc', totalCards: 0, newCards: 0, learningCards: 0, reviewCards: 0 }
  ]);

  const handleOpenSet = (id) => {
    navigation.navigate(SCREENS.FLASHCARD_SET_DETAIL, { id });
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

  return (
    <View style={styles.container}>

      {/* Create Set Button */}
      <TouchableOpacity style={styles.createButton} onPress={() => setIsCreateDialogOpen(true)}>
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
    padding: 10, borderRadius: 8, 
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
    backgroundColor: '#DDD', 
    marginVertical: 8 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContainer: { 
    backgroundColor: '#FFF', 
    padding: 20, 
    borderRadius: 10, 
    width: '80%' 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  modalInput: { 
    borderBottomWidth: 2, 
    borderBottomColor: COLORS.BLUE, 
    padding: 8, 
    fontSize: 18, 
    marginBottom: 16 
  },
  modalActions: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    gap: 16 
  },
  modalCancel: { 
    color: '#777' 
  },
  modalOk: { 
    color: COLORS.BLUE,
  },
});
