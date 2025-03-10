import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import COLORS from '../../constant/colors';
import { ArrowLeft, Save, Bold, Italic, Underline, Strikethrough, Sigma, Image, AudioLines } from 'lucide-react-native';

const FlashcardEditor = ({ onClose }) => {
  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={onClose}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <View style={styles.flashcardIcon} />
          <Text style={styles.headerText}>Flashcard</Text>
        </View>
        <TouchableOpacity style={styles.saveButton}>
          <Save size={18} color="white" />
          <Text style={styles.saveButtonText}>Save flashcard</Text>
        </TouchableOpacity>
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        {[Bold, Italic, Underline, Strikethrough].map((Icon, index) => (
          <TouchableOpacity key={index} style={styles.toolbarButton}>
            <Icon size={18} color="#666" />
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.toolbarButton}>
          <Sigma size={18} color="#666" />
          <Text style={styles.toolbarText}>Insert equation</Text>
        </TouchableOpacity>
      </View>

      {/* Flashcard Inputs */}
      <View style={styles.flashcardContainer}>
        {/* Front Side */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Front</Text>
          <TextInput
            style={styles.input}
            placeholder="Type text here..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={frontText}
            onChangeText={setFrontText}
          />
          <View style={styles.cardIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Image size={16} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <AudioLines size={16} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Back Side */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Back</Text>
          <TextInput
            style={styles.input}
            placeholder="Type text here..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={backText}
            onChangeText={setBackText}
          />
          <View style={styles.cardIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Image size={16} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <AudioLines size={16} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flashcardIcon: {
    width: 20,
    height: 20,
    backgroundColor: COLORS.RAJAH,
    marginRight: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BLUE,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginRight: 8,
  },
  toolbarText: {
    marginLeft: 4,
    color: '#666',
  },
  flashcardContainer: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.RAJAH,
    borderRadius: 12,
    padding: 16,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    width: '100%',
  },
  cardIcons: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
  },
  iconButton: {
    padding: 6,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
  },
});

export default FlashcardEditor;
