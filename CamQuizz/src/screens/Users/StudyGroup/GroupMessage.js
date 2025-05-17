import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constant/colors';

const tmpAvatar = 'https://i.pravatar.cc/40?img=3';

const GroupMessage = ({ navigation, route }) => {
  const { group } = route.params;
  const [message, setMessage] = useState('');

  const messages = [
    { id: '1', sender: 'User 1', text: 'Hello everyone!', time: '10:00' },
    { id: '2', sender: 'Me', text: 'Hi User 1!', time: '10:01' },
    { id: '3', sender: 'User 2', text: 'Chào bạn!', time: '10:02' },
    { id: '4', sender: 'Me', text: 'Mọi người chuẩn bị kiểm tra nhé.', time: '10:03' },
  ];

  const renderMessage = ({ item }) => {
    const isMe = item.sender === 'Me';

    return (
      <View
        style={[
          styles.messageWrapper,
          isMe ? styles.myMessageWrapper : styles.otherMessageWrapper,
        ]}
      >
        {!isMe && <Image source={{ uri: tmpAvatar }} style={styles.avatar} />}
        <View
          style={[
            styles.messageItem,
            isMe ? styles.myMessage : styles.otherMessage,
          ]}
        >
          {!isMe && <Text style={styles.messageSender}>{item.sender}</Text>}
          <Text 
          style={[
            isMe ? styles.myMessageText : styles.messageText,
          ]}>{item.text}</Text>
          <Text 
          style={[
            isMe ? styles.myMessageTime : styles.messageTime,
          ]}
          >{item.time}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.BLACK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{group.name}</Text>
      </View>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
        />
        <TouchableOpacity style={styles.sendButton}>
          <Ionicons name="send" size={24} color={COLORS.BLUE} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    color: COLORS.BLACK,
  },
  messageList: {
    padding: 16,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-end',
  },
  myMessageWrapper: {
    justifyContent: 'flex-end',
  },
  otherMessageWrapper: {
    justifyContent: 'flex-start',
  },
  messageItem: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  myMessage: {
    backgroundColor: COLORS.BLUE,
    alignSelf: 'flex-end',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  otherMessage: {
    backgroundColor: COLORS.GRAY_BG,
    alignSelf: 'flex-start',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  messageSender: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: COLORS.BLACK,
  },
  messageText: {
    fontSize: 16,
    color: COLORS.BLACK,
  },
  messageTime: {
    fontSize: 12,
    color: COLORS.GRAY_DARK,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_BG,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.GRAY_BG,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  sendButton: {
    justifyContent: 'center',
  },
  myMessageText: {
    fontSize: 16,
    color: COLORS.WHITE,
  },
  myMessageTime: {
    fontSize: 12,
    color: COLORS.WHITE,
    alignSelf: 'flex-end',
    marginTop: 4,
  }
});

export default GroupMessage;
