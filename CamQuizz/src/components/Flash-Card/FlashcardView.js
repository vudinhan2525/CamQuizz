import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import COLORS from '../../constant/colors';
import { Paperclip, RotateCcw, Copy, Trash, Edit } from 'lucide-react-native';

const FlashcardView = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const [flashcard, setFlashcard] = useState({
    front: 'Bài tập 1',
    back: 'abcd'
  });

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconGroup}>
          <TouchableOpacity style={styles.iconButton}>
            <Paperclip size={20} color= "blue" />
            <Text style={styles.iconText}>1</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={handleFlip}>
            <RotateCcw size={20} color="blue" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Copy size={20} color="blue" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Edit size={20} color="blue" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Trash size={20} color="blue" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Flashcard */}
      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.card} onPress={handleFlip}>
          <Text style={styles.cardTitle}>{isFlipped ? 'Back' : 'Front'}</Text>
          <Text style={styles.cardText}>{isFlipped ? flashcard.back : flashcard.front}</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Media Menu */}
      <Modal transparent={true} visible={showMediaMenu} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalButton}>
              <Text>Add image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton}>
              <Text>Add audio</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowMediaMenu(false)}>
              <Text style={styles.closeModal}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    
  },
  iconText: {
    marginLeft: 4,
    fontSize: 16,
    color: '#6B46C1'
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  cardContainer: {
    alignItems: 'center',
    marginTop: 20
  },
  card: {
    width: 300,
    height: 200,
    backgroundColor: "blue",
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16
  },
  cardTitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 8
  },
  cardText: {
    fontSize: 22,
    color: 'white',
    textAlign: 'center'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10
  },
  modalButton: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 5
  },
  closeModal: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10
  }
});

export default FlashcardView;
