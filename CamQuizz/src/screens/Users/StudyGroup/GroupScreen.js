import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constant/colors';
import SCREENS from '../..';
import Entypo from 'react-native-vector-icons/Entypo';
import GroupService from '../../../services/GroupService';

const GroupScreen = ({ navigation, route }) => {
  const { group: routeGroup, isLeader: routeIsLeader } = route.params || {};

  // State management
  const [group, setGroup] = useState(routeGroup || { name: 'Study Group', id: 1 });
  const [isLeader, setIsLeader] = useState(routeIsLeader || false);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGroupData();
  }, [group.id]);

  const loadGroupData = async () => {
    if (!group.id) {
      console.warn('No group ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(`Loading data for group ID: ${group.id}`);

      // Gọi API để lấy shared quizzes
      await loadSharedQuizzes();

    } catch (error) {
      console.error('Error loading group data:', error);
      Alert.alert(
        'Lỗi',
        'Không thể tải dữ liệu nhóm. Vui lòng thử lại.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const loadSharedQuizzes = async () => {
    try {
      console.log(`Fetching shared quizzes for group ${group.id}`);
      const response = await GroupService.getSharedQuizzesByGroupId(group.id);

      console.log('Shared quizzes response:', response);

      // Xử lý dữ liệu response
      let quizzesData = [];
      if (response && response.data) {
        quizzesData = Array.isArray(response.data) ? response.data : [response.data];
      } else if (Array.isArray(response)) {
        quizzesData = response;
      }

      // Transform data để phù hợp với UI
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

      // Nếu lỗi 404 hoặc không có quiz, set empty array
      if (error.message.includes('not found') || error.message.includes('no shared quizzes')) {
        setQuizzes([]);
        console.log('No shared quizzes found for this group');
      } else {
        throw error; // Re-throw other errors
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGroupData();
    setRefreshing(false);
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
        {isLeader
          ? 'Hãy chia sẻ quiz đầu tiên cho nhóm của bạn!'
          : 'Chờ trưởng nhóm chia sẻ quiz cho nhóm.'
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

      <View style={styles.quizHeader}>
        <Text style={styles.quizHeaderTitle}>Quiz được chia sẻ ({quizzes.length})</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color={COLORS.BLUE} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={quizzes}
        renderItem={renderQuizItem}
        keyExtractor={(item, index) => item.id || index.toString()}
        contentContainerStyle={quizzes.length === 0 ? styles.emptyContent : styles.content}
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
      />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  refreshButton: {
    padding: 4,
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
});

export default GroupScreen;
