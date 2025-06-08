import React, { useState, useEffect } from "react";
import {View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator } from "react-native";
import QuizCard from "../../../components/QuizCard";
import COLORS from "../../../constant/colors";
import QuizzService from "../../../services/QuizzService";
import Toast from "react-native-toast-message";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { validateToken } from "../../../services/AuthService";

const FILTERS = [
  { id: "newest", label: "Mới nhất", sort: "created_at" },
  { id: "1month", label: "1 tháng trước", sort: "created_at" },
  { id: "2months", label: "2 tháng trước", sort: "created_at" },
];

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
  const [selectedFilter, setSelectedFilter] = useState("newest");
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

      const selectedFilterData = FILTERS.find(f => f.id === selectedFilter);
      const sortBy = selectedFilterData?.sort || 'created_at';

      const response = await QuizzService.getSharedQuizzes(null, currentPage, 10, sortBy);

      if (response && response.data) {
        const formattedQuizzes = response.data.map(quiz => ({
          id: quiz.id.toString(),
          title: quiz.name,
          questions: quiz.number_of_questions || quiz.questions?.length || 0,
          attempts: quiz.number_of_attended || 0,
          image: quiz.image || "https://via.placeholder.com/150",
          date: quiz.created_at,
          description: quiz.description,
          duration: quiz.duration,
          status: quiz.status,
          shared_users: quiz.shared_users || [],
          shared_groups: quiz.shared_groups || [],
          questions_data: quiz.questions || []
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

  // Filter quizzes by time locally (after fetching from API)
  const filterQuizzesByTime = () => {
    const now = new Date();
    return quizzes.filter((quiz) => {
      const quizDate = new Date(quiz.date);

      if (selectedFilter === "newest") {
        return true;
      } else if (selectedFilter === "1month") {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        return quizDate >= oneMonthAgo;
      } else if (selectedFilter === "2months") {
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(now.getMonth() - 2);
        return quizDate >= twoMonthsAgo;
      }
      return false;
    });
  };

  // Handle filter change
  const handleFilterChange = (filterId) => {
    setSelectedFilter(filterId);
    setPage(1);
    fetchSharedQuizzes(1, true);
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
    }, [selectedFilter])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.filterContainer}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              selectedFilter === filter.id && styles.selectedFilterButton,
            ]}
            onPress={() => handleFilterChange(filter.id)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.id && styles.selectedFilterText,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Loading indicator */}
      {loading && quizzes.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.BLUE} />
          <Text style={styles.loadingText}>Đang tải quiz được chia sẻ...</Text>
        </View>
      ) : (
        /* Hiển thị danh sách QuizCard sau khi lọc */
        <FlatList
          data={filterQuizzesByTime()}
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
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: COLORS.GRAY_TEXT,
    borderRadius: 20,
  },
  selectedFilterButton: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.BLACK,
  },
  selectedFilterText: {
    color: COLORS.BLUE,
    fontWeight: "bold",
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
