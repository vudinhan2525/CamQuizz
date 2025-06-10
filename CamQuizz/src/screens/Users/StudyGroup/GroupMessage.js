import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constant/colors';
import { API_URL } from '@env';
import AsyncStorageService from '../../../services/AsyncStorageService';
import * as signalR from '@microsoft/signalr';

const tmpAvatar = 'https://i.pravatar.cc/40?img=3';

const GroupMessage = ({ navigation, route }) => {
  const { group } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);
  const [connection, setConnection] = useState(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const flatListRef = useRef();

  const formatMessage = useCallback(
    (msg, updated = true) => ({
      id: msg.MessageId || Math.random().toString(),
      sender: msg.UserName || 'Unknown',
      text: msg.Message,
      time: msg.Timestamp
        ? new Date(new Date(msg.Timestamp).getTime() + (!updated ? 0 : 7 * 60 * 60 * 1000)).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '',
      userId: msg.FromUserId,
    }),
    []
  );

  /**  Handle a single incoming real‑time message */
  const handleReceiveMessage = useCallback(
    (msg) => {
      //console.log("msg", msg) 
      //console.log(`${msg.GroupId} !== ${group.id.toString()}`)
      //console.log("ignore", msg.GroupId !== group.id.toString())
      //if (msg.GroupId !== group.id.toString()) return; // ignore messages for other groups
      setMessages((prev) => [...prev, formatMessage(msg, false)]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    },
    [formatMessage]
  );

  const handleLoadMessageHistory = useCallback(
    (result) => {
      if (!result?.Messages) return;
      const loaded = result.Messages.map(formatMessage);
      if (result.Page === 1) {
        setMessages(loaded);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
      } else {
        setMessages((prev) => [...loaded, ...prev]);
      }
      setHasMore(result.Page < result.TotalPages);
      setLoadingMore(false);
    },
    [formatMessage]
  );


  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorageService.getUserId();
      setUserId(id);
    };
    fetchUserId();

  }, []);

  useEffect(() => {
    if (!userId) return;
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_URL}/groupChat`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect()
      .build();
    setConnection(newConnection);
  }, [userId]);

  useEffect(() => {
    if (!connection || !userId) return;
    let isMounted = true;

    connection
      .start()
      .then(() => {
        connection.invoke('JoinGroup', {
          GroupId: group.id.toString(),
          UserId: userId.toString(),
        });
        connection.invoke('LoadMessageHistory', {
          GroupId: group.id.toString(),
          Page: 1,
          Limit: 20,
        });
        setPage(1);
        connection.on('receiveMessage', handleReceiveMessage);
        connection.on('loadMessageHistory', handleLoadMessageHistory);
      })
      .catch((err) => console.warn('SignalR connection error:', err));

    return () => {
      isMounted = false;
      connection.off('receiveMessage', handleReceiveMessage);
      connection.off('loadMessageHistory', handleLoadMessageHistory);
      connection.stop();
    };
  }, [connection, group.id, userId, handleReceiveMessage, handleLoadMessageHistory]);

  useEffect(() => {
    if (connection && userId && messages.length) {
      connection.invoke('MarkMessagesAsRead', group.id.toString(), userId.toString());
    }
  }, [messages.length, connection, group.id, userId]);

  useEffect(() => {
    if (!connection) return;
    const messagesReadHandler = ({ UserId }) => {
      // Here you could update a badge, etc.
      // console.log('Messages marked as read for user:', UserId);
    };
    connection.on('messagesRead', messagesReadHandler);
    return () => connection.off('messagesRead', messagesReadHandler);
  }, [connection]);


  const handleSend = () => {
    if (!message.trim() || !connection || !userId) return;

    connection.invoke('SendMessage', {
      GroupId: group.id.toString(),
      UserId: userId.toString(),
      Message: message.trim(),
    });
    setMessage('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleLoadMore = () => {
    if (!hasMore || loadingMore || !connection) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    connection.invoke('LoadMessageHistory', {
      GroupId: group.id.toString(),
      Page: nextPage,
      Limit: 20,
    });
  };

  const renderMessage = ({ item }) => {
    const isMe = item.userId?.toString() === userId?.toString();
    return (
      <View
        style={[styles.messageWrapper, isMe ? styles.myMessageWrapper : styles.otherMessageWrapper]}
      >
        {!isMe && <Image source={{ uri: tmpAvatar }} style={styles.avatar} />}
        <View style={[styles.messageItem, isMe ? styles.myMessage : styles.otherMessage]}>
          {!isMe && <Text style={styles.messageSender}>{item.sender}</Text>}
          <Text style={isMe ? styles.myMessageText : styles.messageText}>{item.text}</Text>
          <Text style={isMe ? styles.myMessageTime : styles.messageTime}>{item.time}</Text>
        </View>
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.BLACK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{group.name}</Text>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onEndReached={null}
        onEndReachedThreshold={0.1}
        onScroll={({ nativeEvent }) => {
          if (nativeEvent.contentOffset.y <= 0) {
            handleLoadMore();
          }
        }}
        inverted={false}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Ionicons name="send" size={24} color={COLORS.BLUE} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
