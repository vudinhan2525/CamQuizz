import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import COLORS from '../../../constant/colors';
import FlashcardEditor from '../../../components/Flash-Card/FlashcardEditor';
import FlashcardView from '../../../components/Flash-Card/FlashcardView';

const FlashcardPage = () => {
  const [mode, setMode] = useState('view');
  const [flashcardCount, setFlashcardCount] = useState(1);

  return (
    <View style={styles.container}>
      {mode === 'view' ? (
        <>
          {/* Header */}
          <View style={styles.header}>       
            <Text style={styles.title}>{flashcardCount} Flashcard</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setMode('edit')}>
              <Text style={styles.addButtonText}>+ Add flashcard</Text>
            </TouchableOpacity>
          </View>

          {/* Flashcard View */}
          <View style={styles.content}>
            <FlashcardView />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.aiButton} onPress={() => console.log('Add Flashcard with AI')}>
              <Text style={styles.aiButtonText}>+ Add flashcard (AI)</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <FlashcardEditor onClose={() => setMode('view')} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: COLORS.BLUE,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  aiButton: {
    backgroundColor: COLORS.BLUE,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  aiButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default FlashcardPage;
