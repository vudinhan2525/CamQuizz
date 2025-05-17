import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { RotateCw, Heart, ArrowLeft } from 'lucide-react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import COLORS from '../../../constant/colors';

const FlashcardStudy = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { setId, flashcards, onStudyComplete } = route.params;
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyComplete, setStudyComplete] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      // End of deck
      completeStudySession();
    }
  };

  const completeStudySession = () => {
    if (!studyComplete) {
      setStudyComplete(true);
      
      // Call the callback function to update the review count
      if (onStudyComplete) {
        onStudyComplete();
      }
      
      Alert.alert(
        "Học xong!",
        "Bạn đã hoàn thành bộ thẻ này.",
        [
          { 
            text: "OK", 
            onPress: () => {
              // Simply go back to the previous screen
              navigation.goBack();
            } 
          }
        ]
      );
    }
  };

  const handleRating = (rating) => {
    handleNextCard();
  };

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{currentCardIndex + 1}/{flashcards.length}</Text>
      </View>

      {/* Card Display */}
      <TouchableOpacity style={styles.cardContainer} onPress={handleFlip}>
        
        <Text style={styles.cardContent}>
          {isFlipped ? flashcards[currentCardIndex].back : flashcards[currentCardIndex].front}
        </Text>
        
        <TouchableOpacity style={styles.flipButton} onPress={handleFlip}>
          <RotateCw size={44} color="white" />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Rating Buttons */}
      <View style={styles.ratingContainer}>
        <TouchableOpacity 
          style={[styles.ratingButton, styles.hardButton]} 
          onPress={() => handleRating('hard')}
        >
          <Text style={styles.ratingText}>Khó</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.ratingButton, styles.mediumButton]} 
          onPress={() => handleRating('medium')}
        >
          <Text style={styles.ratingText}>Tương đối</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.ratingButton, styles.easyButton]} 
          onPress={() => handleRating('easy')}
        >
          <Text style={styles.ratingText}>Dễ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.BLUE,
  },
  headerText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cardContainer: {
    flex: 1,
    backgroundColor: COLORS.BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  favoriteButton: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  flipButton: {
    position: 'absolute',
    bottom: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 30,
    padding: 10,
  },
  cardContent: {
    fontSize: 36,
    color: 'white',
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    height: 60,
  },
  ratingButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hardButton: {
    backgroundColor: '#FF6B6B',
  },
  mediumButton: {
    backgroundColor: '#4CAF50',
  },
  easyButton: {
    backgroundColor: '#2196F3',
  },
  ratingText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default FlashcardStudy;