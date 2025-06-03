import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import COLORS from '../../../constant/colors';

const JoinSection = React.memo(({ joinCode, onChangeJoinCode, isJoining, onJoinGame }) => {
  return (
    <View style={styles.card}>
      <TextInput
        style={styles.joinInput}
        placeholder="Nhập mã tham gia"
        placeholderTextColor={COLORS.GRAY_LIGHT}
        value={joinCode}
        onChangeText={onChangeJoinCode}
        editable={!isJoining}
        maxLength={5}
      />
      <TouchableOpacity
        style={[styles.joinButton, isJoining && styles.joinButtonDisabled]}
        onPress={onJoinGame}
        disabled={isJoining}
      >
        <Text style={styles.joinButtonText}>
          {isJoining ? 'Đang tham gia...' : 'Tham gia trò chơi'}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    margin: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  joinInput: {
    height: 50,
    borderColor: COLORS.BLUE,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  joinButton: {
    backgroundColor: COLORS.BLUE,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  joinButtonDisabled: {
    backgroundColor: COLORS.GRAY_LIGHT,
  },
});

export default JoinSection;