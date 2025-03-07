import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, StyleSheet, ScrollView } from 'react-native';
import { Home, Search, Menu, Plus, Cloud, BarChart, Settings, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '../../../hooks/use-toast';
import PropTypes from 'prop-types';
import COLORS from '../../../constant/colors';
import SCREENS from '../..';
import FlashcardEditor from '../../../components/Flash-Card/FlashcardEditor';
import FlashcardView from '../../../components/Flash-Card/FlashcardView';

const FlashCardPage = () => {
  const navigation = useNavigation();
  const { toast } = useToast();
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
      toast({ title: 'Error', description: 'Set name cannot be empty', variant: 'destructive' });
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

    toast({ title: 'Success', description: `Flashcard set "${newSetName}" created successfully` });
  };

  return (
    <View style={styles.container}>
      {/* Today's stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Today's List</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>New</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Estimated(min)</Text>
          </View>
        </View>
        <Text style={styles.statsFooter}>Studied 0 cards in 0 minutes today</Text>
      </View>

      {/* Create Set Button */}
      <TouchableOpacity style={styles.createButton} onPress={() => setIsCreateDialogOpen(true)}>
        <Plus size={20} color="white" />
        <Text style={styles.createButtonText}>Create Set</Text>
      </TouchableOpacity>

      {/* Flashcard Sets List */}
      <ScrollView style={styles.flashcardList}>
        {flashcardSets.map((set) => (
          <View key={set.id} style={styles.flashcardItem}>
            <View style={styles.flashcardHeader}>
              <Text style={styles.flashcardTitle}>{set.title}</Text>
              <TouchableOpacity style={styles.studyButton} onPress={() => handleOpenSet(set.id)}>
                <Text style={styles.studyButtonText}>Study</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.flashcardDetail}>Total: {set.totalCards}/{set.totalCards}</Text>
            <View style={styles.separator} />
            <View style={styles.flashcardStats}>
              <Text>New: <Text style={styles.statBold}>{set.newCards}</Text></Text>
              <Text>Learning: <Text style={styles.statBold}>{set.learningCards}</Text></Text>
              <Text>Review: <Text style={styles.statBold}>{set.reviewCards}</Text></Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Create Set Modal */}
      <Modal visible={isCreateDialogOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create set</Text>
            <TextInput
              style={styles.modalInput}
              value={newSetName}
              onChangeText={setNewSetName}
              placeholder="Set Flashcard"
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setIsCreateDialogOpen(false)}>
                <Text style={styles.modalCancel}>CANCEL</Text>
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
    backgroundColor: '#F3F4F6' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#DDD' 
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
    padding: 10, borderRadius: 20, 
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
    marginBottom: 16 
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
    borderBottomColor: 'red', 
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
    color: '#06B6D4' 
  },
});
