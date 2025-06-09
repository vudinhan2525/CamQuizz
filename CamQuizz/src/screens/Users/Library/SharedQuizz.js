import React, { useState, useEffect } from "react";
import {View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator } from "react-native";
import QuizCard from "../../../components/QuizCard";
import COLORS from "../../../constant/colors";
import QuizzService from "../../../services/QuizzService";
import Toast from "react-native-toast-message";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { validateToken } from "../../../services/AuthService";

const handleAuthError = (navigation, message = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.') => {
  Toast.show({
    type: 'error',
    text1: 'Lỗi xác thực',
    text2: message
  });
  navigation.getParent()?.reset({
    index: 0,
    routes: [{ name: 'AuthStack' }],
  });
};

const SharedQuizz = () => {
  const navigation = useNavigation();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch shared quizzes from API
  const fetchSharedQuizzes = async (currentPage = 1, isRefresh = false) => {
    try {
      if (!await validateToken()) {
        handleAuthError(navigation);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await QuizzService.getSharedQuizzes(null, currentPage, 10, 'created_at');

      if (response && response.data) {
        const formattedQuizzes = response.data.map(quiz => ({
          id: quiz.id.toString(),
          name: quiz.name,
          number_of_questions: quiz.number_of_questions || quiz.questions?.length || 0,
          number_of_attended: quiz.number_of_attended || 0,
          image: quiz.image || "https://via.placeholder.com/150",
          created_at: quiz.created_at,
          description: quiz.description,
          duration: quiz.duration,
          status: quiz.status,
          shared_users: quiz.shared_users || [],
          shared_groups: quiz.shared_groups || [],
          questions: quiz.questions || []
        }));

        if (isRefresh || currentPage === 1) {
          setQuizzes(formattedQuizzes);
        } else {
          setQuizzes(prev => [...prev, ...formattedQuizzes]);
        }

        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error fetching shared quizzes:', error);

      if (error.message === 'Unauthorized - Please log in again') {
        handleAuthError(navigation);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không thể tải danh sách quiz được chia sẻ. Vui lòng thử lại sau.'
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };



  // Load more quizzes for pagination
  const loadMoreQuizzes = () => {
    if (pagination && page < pagination.totalPages && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchSharedQuizzes(nextPage, false);
    }
  };

  useEffect(() => {
    fetchSharedQuizzes(1, false);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchSharedQuizzes(1, true);
      return () => {};
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>

      {/* Loading indicator */}
      {loading && quizzes.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.BLUE} />
          <Text style={styles.loadingText}>Đang tải quiz được chia sẻ...</Text>
        </View>
      ) : (
        /* Hiển thị danh sách QuizCard */
        <FlatList
          data={quizzes}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={quizzes.length > 0 ? styles.row : null}
          renderItem={({ item }) => <QuizCard quiz={item} attemptText="người thi" />}
          refreshing={refreshing}
          onRefresh={() => fetchSharedQuizzes(1, true)}
          onEndReached={loadMoreQuizzes}
          onEndReachedThreshold={0.1}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Không có quiz nào được chia sẻ với bạn</Text>
                <Text style={styles.emptySubText}>Các quiz được chia sẻ sẽ hiển thị ở đây</Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            loading && quizzes.length > 0 ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator size="small" color={COLORS.BLUE} />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

export default SharedQuizz;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "left",
    color: COLORS.PRIMARY,
  },

  row: {
    justifyContent: "space-between",
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.BLUE,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: COLORS.BLACK,
  },
  emptySubText: {
    fontSize: 16,
    color: COLORS.GRAY_TEXT,
    textAlign: 'center',
  },
  footerLoading: {
    padding: 20,
    alignItems: 'center',
  },
});
