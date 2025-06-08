import React, { useState, useEffect, use } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constant/colors';
import SCREENS from '../..';
import Entypo from 'react-native-vector-icons/Entypo';
import GroupService from '../../../services/GroupService';
import StudyGroupService from '../../../services/StudyGroupService';
import AsyncStorageService from '../../../services/AsyncStorageService';
import * as signalR from '@microsoft/signalr';
import { useIsFocused } from '@react-navigation/native';
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GroupScreen = ({ navigation, route }) => {
  const { group: routeGroup, isLeader: routeIsLeader } = route.params || {};

  const [group, setGroup] = useState(routeGroup || { name: 'Study Group', id: 1 });
  const [isLeader, setIsLeader] = useState(routeIsLeader || false);
  const [quizzes, setQuizzes] = useState([]);
  const [userId, setUserId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connection, setConnection] = useState(null);
  const isFocused = useIsFocused();
  const flatListRef = React.useRef(null);

  useEffect(() => {
    console.log("group", group)
    console.log("is leader", isLeader)
    const fetchUserId = async () => {
      const id = await AsyncStorageService.getUserId();
      setUserId(id);
    };
    fetchUserId();
    loadSharedQuizzes();
  }, []);

  useEffect(() => {
    if (!userId) return;
    console.log("API_URL", API_URL)
    const connectToHub = async () => {
      try {
        const newConnection = new signalR.HubConnectionBuilder()
          .withUrl(`${API_URL}/groupChat`, {
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets
          })
          .configureLogging(signalR.LogLevel.Information)
          .withAutomaticReconnect()
          .build();

        setConnection(newConnection);


      } catch (error) {
        console.error('Error connecting to SignalR hub:', error);
      }
    }
    connectToHub();
  }, [userId, isFocused]);

  useEffect(() => {
    if (connection) {
      connection.start().then(() => {
        connection.invoke('GetUnreadMessageCounts', userId.toString());
        connection.on('unreadMessageCounts', (counts) => {
          console.log("counts", counts)
          const groupUnread = counts.find(c => c.GroupId === group.id.toString());
          setUnreadCount(groupUnread ? groupUnread.UnreadCount : 0);
        });
        connection.on('receiveMessage', (message) => {
          if (message) {
            connection.invoke('GetUnreadMessageCounts', userId.toString());
          }
        });
      });
    }
  }, [connection, group.id, userId, isFocused]);

  const loadSharedQuizzes = async () => {
    try {
      console.log(`Fetching shared quizzes for group ${group.id}`);
      const quizzesData = await StudyGroupService.getGroupQuizzes(group.id);

      console.log('Shared quizzes response:', quizzesData);



      const transformedQuizzes = quizzesData.map((item) => ({
        id: item.quiz_id,
        title: item.quiz_name,
        image: item.image || 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg',
        duration: item.duration,
        questions: item.number_of_questions,
        sharedBy: item.shared_by_name,
        sharedAt: item.shared_at,
        status: item.status,
        groupId: item.group_id,
        groupName: item.group_name
      }));

      setQuizzes(transformedQuizzes);
      console.log(`Loaded ${transformedQuizzes.length} shared quizzes`);

    } catch (error) {
      console.error('Error loading shared quizzes:', error);

      if (error.message.includes('not found') || error.message.includes('no shared quizzes')) {
        setQuizzes([]);
        console.log('No shared quizzes found for this group');
      } else {
        throw error;
      }
    }
  };


  const renderQuizItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate(SCREENS.QUIZ_DETAIL, { quizId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.row}>
          <Text style={styles.questions}>{item.questions} câu hỏi</Text>
          <Entypo name="dot-single" size={20} color={COLORS.GRAY} />
          <Text style={styles.duration}>{item.duration} giây</Text>
        </View>
        <View style={styles.categoryContainer}>
          <Text style={styles.category}>{item.status === 'Public' ? 'Công khai' : 'Riêng tư'}</Text>
        </View>
        <View style={styles.sharedInfoContainer}>
          <Text style={styles.sharedBy}>Chia sẻ bởi: {item.sharedBy}</Text>
          <Text style={styles.sharedAt}>
            {new Date(item.sharedAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="library-outline" size={64} color={COLORS.GRAY} />
      <Text style={styles.emptyTitle}>Chưa có quiz nào được chia sẻ</Text>
    </View>
  );


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.BLACK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{group.name}</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate(SCREENS.GROUP_MESSAGE, { group })}
          >
            <Ionicons name="chatbubble-outline" size={24} color={COLORS.BLACK} />
            {unreadCount > 0 && (
              <View style={{
                position: 'absolute',
                right: -6,
                top: -6,
                backgroundColor: COLORS.RED,
                borderRadius: 8,
                minWidth: 16,
                height: 16,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 4,
                zIndex: 1,
              }}>
                <Text style={{ color: COLORS.WHITE, fontSize: 10, fontWeight: 'bold' }}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate(SCREENS.GROUP_MEMBERS, { group, isLeader })}
          >
            <Ionicons name="people-outline" size={24} color={COLORS.BLACK} />
          </TouchableOpacity>
        </View>
      </View>


      <>
        <View style={styles.quizHeader}>
          <Text style={styles.quizHeaderTitle}>Quiz được chia sẻ ({quizzes.length})</Text>
          {!isLeader&&<TouchableOpacity
            style={styles.quitButton}
            onPress={() => {
              Alert.alert(
                "Xác nhận",
                "Bạn có chắc chắn muốn rời khỏi nhóm không?",
                [
                  {
                    text: "Hủy",
                    style: "cancel"
                  },
                  {
                    text: "Đồng ý",
                    onPress: () => {
                      StudyGroupService.leaveGroup(group.id, userId);
                    }
                  }
                ]
              );
            }}
          >
            <Text style={styles.quitText}>Rời nhóm</Text>
          </TouchableOpacity>}
        </View>

        <FlatList
          data={quizzes}
          renderItem={renderQuizItem}
          keyExtractor={(item, index) => item.id || index.toString()}
          contentContainerStyle={quizzes.length === 0 ? styles.emptyContent : styles.content}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          ref={flatListRef}
        />
      </>

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
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    color: COLORS.BLACK,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  content: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLUE
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginVertical: 5,
  },
  plays: {
    fontSize: 14,
    color: '#888',
  },
  questions: {
    fontSize: 14,
    color: '#888',
  },
  categoryContainer: {
    backgroundColor: COLORS.BLUE,
    borderRadius: 5,
    paddingVertical: 2,
    paddingHorizontal: 5,
    alignSelf: 'flex-start',
  },
  category: {
    fontSize: 14,
    color: '#fff',
  },
  sharedInfo: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginTop: 5,
    fontStyle: 'italic',
  },
  quizHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  quizHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLACK,
    textAlignVertical: 'center'
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.GRAY,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  nonLeaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  nonLeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginTop: 16,
    textAlign: 'center',
  },
  nonLeaderSubtitle: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  nonMemberContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  nonMemberTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginTop: 16,
    textAlign: 'center',
  },
  nonMemberSubtitle: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  quitButton: {
    backgroundColor: COLORS.RED,
    borderRadius: 8,
    padding: 8
  },
  quitText: {
    color: COLORS.WHITE
  },
  duration: {
    fontSize: 14,
    color: '#888',
  },
  sharedInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  sharedBy: {
    fontSize: 12,
    color: COLORS.GRAY,
    fontStyle: 'italic',
  },
  sharedAt: {
    fontSize: 12,
    color: COLORS.GRAY,
  }
});

export default GroupScreen;
