import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constant/colors';
import SCREENS from '../..';
import Entypo from 'react-native-vector-icons/Entypo';
import GroupService from '../../../services/GroupService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GroupScreen = ({ navigation, route }) => {
  const { group: routeGroup, isLeader: routeIsLeader } = route.params || {};

  const [group, setGroup] = useState(routeGroup || { name: 'Study Group', id: 1 });
  const [isLeader, setIsLeader] = useState(routeIsLeader || false);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [memberStatus, setMemberStatus] = useState({
    isMember: false,
    isOwner: false,
    status: null
  });

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId && group.id) {
      loadGroupData();
    }
  }, [group.id, userId]);

  const loadGroupData = async () => {
    if (!group.id || !userId) {
      console.warn('No group ID or user ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(`Loading data for group ID: ${group.id}, user ID: ${userId}`);

      console.log(`=== CHECKING MEMBER STATUS ===`);
      console.log(`Group ID: ${group.id}`);
      console.log(`User ID: ${userId}`);
      console.log(`Group object:`, group);

      const memberStatusResult = await GroupService.checkMemberStatus(group.id, userId);
      setMemberStatus(memberStatusResult);

      console.log('=== MEMBER STATUS RESULT ===');
      console.log('Member status result:', memberStatusResult);
      console.log(`isMember: ${memberStatusResult.isMember}`);
      console.log(`isOwner: ${memberStatusResult.isOwner}`);
      console.log(`status: ${memberStatusResult.status}`);

      // Fallback logic: If API check failed but we have isLeader from route params
      let finalMemberStatus = memberStatusResult;
      if (memberStatusResult.status === 'Error' && isLeader) {
        console.log('=== USING FALLBACK LOGIC ===');
        console.log('API check failed but isLeader is true, using fallback');
        finalMemberStatus = {
          isMember: true,
          isOwner: true,
          status: 'Owner (Fallback)'
        };
        setMemberStatus(finalMemberStatus);
      }

      if (finalMemberStatus.isMember) {
        console.log('User is a member, loading shared quizzes');
        await loadSharedQuizzes();
      } else {
        setQuizzes([]);
        console.log('User is not a member, not loading shared quizzes');
      }

    } catch (error) {
      console.error('Error loading group data:', error);
      if (memberStatus.isMember) {
        Alert.alert(
          'Lỗi',
          'Không thể tải dữ liệu nhóm. Vui lòng thử lại.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSharedQuizzes = async () => {
    try {
      console.log(`Fetching shared quizzes for group ${group.id}`);
      const response = await GroupService.getSharedQuizzesByGroupId(group.id);

      console.log('Shared quizzes response:', response);

      let quizzesData = [];
      if (response && response.data) {
        quizzesData = Array.isArray(response.data) ? response.data : [response.data];
      } else if (Array.isArray(response)) {
        quizzesData = response;
      }

      const transformedQuizzes = quizzesData.map((item, index) => ({
        id: item.quizId || item.id || index.toString(),
        title: item.quiz?.title || item.title || `Quiz ${index + 1}`,
        category: item.quiz?.genre?.name || item.category || 'Chưa phân loại',
        plays: item.quiz?.attendNum || item.plays || 0,
        questions: item.quiz?.questionsCount || item.questions || 0,
        image: item.quiz?.image || 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg',
        sharedBy: item.sharedBy?.firstName || item.sharedBy?.name || 'Unknown',
        sharedAt: item.sharedAt || new Date().toISOString(),
        originalQuiz: item.quiz || item
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
      onPress={() => navigation.navigate(SCREENS.QUIZ_DETAIL, { quiz: item.originalQuiz })}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.row}>
          <Text style={styles.questions}>{item.questions} câu hỏi</Text>
          <Entypo name="dot-single" size={20} color={COLORS.GRAY} />
          <Text style={styles.plays}>{item.plays} lượt làm bài</Text>
        </View>
        <View style={styles.categoryContainer}>
          <Text style={styles.category}>{item.category}</Text>
        </View>
        <Text style={styles.sharedInfo}>Chia sẻ bởi: {item.sharedBy}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="library-outline" size={64} color={COLORS.GRAY} />
      <Text style={styles.emptyTitle}>Chưa có quiz nào được chia sẻ</Text>
      <Text style={styles.emptySubtitle}>
        {memberStatus.isOwner
          ? 'Hãy chia sẻ quiz đầu tiên cho nhóm của bạn!'
          : 'Chờ các thành viên chia sẻ quiz cho nhóm.'
        }
      </Text>
    </View>
  );

  if (loading) {
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
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate(SCREENS.GROUP_MEMBERS, { group, isLeader })}
            >
              <Ionicons name="people-outline" size={24} color={COLORS.BLACK} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.BLUE} />
          <Text style={styles.loadingText}>Đang tải quiz...</Text>
        </View>
      </View>
    );
  }

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
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate(SCREENS.GROUP_MEMBERS, { group, isLeader })}
          >
            <Ionicons name="people-outline" size={24} color={COLORS.BLACK} />
          </TouchableOpacity>
        </View>
      </View>

      {memberStatus.isMember ? (
        <>
          <View style={styles.quizHeader}>
            <Text style={styles.quizHeaderTitle}>Quiz được chia sẻ ({quizzes.length})</Text>
          </View>

          <FlatList
            data={quizzes}
            renderItem={renderQuizItem}
            keyExtractor={(item, index) => item.id || index.toString()}
            contentContainerStyle={quizzes.length === 0 ? styles.emptyContent : styles.content}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <View style={styles.nonMemberContainer}>
          <Ionicons name="people-outline" size={64} color={COLORS.GRAY} />
          <Text style={styles.nonMemberTitle}>Chỉ thành viên nhóm mới có thể xem quiz được chia sẻ</Text>
          <Text style={styles.nonMemberSubtitle}>
            Bạn cần là thành viên của nhóm để có thể xem các quiz được chia sẻ trong nhóm này.
          </Text>
        </View>
      )}
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
    color:COLORS.BLUE
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
  },
  quizHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLACK,
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
});

export default GroupScreen;
