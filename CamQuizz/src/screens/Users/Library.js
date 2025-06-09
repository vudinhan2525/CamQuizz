import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, FlatList, ActivityIndicator, Alert } from "react-native";
import { Search, Plus, MoreVertical } from "lucide-react-native";
import LibraryTab from "../../components/Library/LibraryTab";
import FlashCardPage from "../Users/FlashCard/FlashCardPage";
import SharedQuizz from "../Users/Library/SharedQuizz";
import COLORS from '../../constant/colors';
import DropdownFilter from "../../components/Library/DropdownFilter";
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import SCREENS from '../../screens/index';
import QuizCard from "../../components/QuizCard";
import QuizzService from "../../services/QuizzService";
import EditQuizModal from "../../components/EditQuizModal";
import AsyncStorageService from "../../services/AsyncStorageService";
import { checkAuthStatus } from "../../services/AuthService";
import React from "react";

export const navigateToFlashcardTab = (navigation, params = {}) => {
  navigation.navigate(SCREENS.LIBRARY, {
    activeTab: "flashcard",
    ...params
  });
};

export const Library = () => {
  console.log(' Library component rendered');

  const route = useRoute();
  const [activeTab, setActiveTab] = useState(route.params?.activeTab || "myLibrary");
  const [visibility, setVisibility] = useState("public");
  const navigation = useNavigation();

  const [allQuizzes, setAllQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const filteredQuizzes = allQuizzes

  console.log(' Current state:', {
    activeTab,
    allQuizzes: allQuizzes.length,
    filteredQuizzes: filteredQuizzes.length,
    visibility,
    loading,
    userId
  });

  useEffect(() => {
    if (route.params?.activeTab) {
      setActiveTab(route.params.activeTab);
    }
  }, [route.params]);

  useEffect(() => {
    console.log(' useEffect triggered - initializing data');

    const initializeData = async () => {
      try {
        console.log(' Setting loading to true');
        setLoading(true);

        console.log(' Checking auth status...');
        const authStatus = await checkAuthStatus();

        if (!authStatus) {
          console.log('Authentication check failed');
          return;
        }

        console.log('Authentication valid, user data:', authStatus);
        if (authStatus.id) {
          console.log('Setting userId:', authStatus.id);
          setUserId(authStatus.id);
          console.log('Calling fetchMyQuizzes...');
          await fetchMyQuizzes();
        } else {
          console.log('No user ID found in auth status');
        }
      } catch (error) {
        console.error('Error in authentication check:', error);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Add useFocusEffect to refresh data when user returns to this tab
  useFocusEffect(
    React.useCallback(() => {
      // Only refresh if we're on the "myLibrary" tab and have userId
      if (activeTab === "myLibrary" && userId) {
        console.log('useFocusEffect triggered - refreshing my quizzes');
        fetchMyQuizzes();
      }
      return () => {};
    }, [activeTab, userId])
  );

  const fetchMyQuizzes = async () => {
    try {
      console.log(' fetchMyQuizzes started');
      setLoading(true);

      console.log(' Calling QuizzService.getMyQuizzes()...');
      const response = await QuizzService.getMyQuizzes();
      console.log(' My quizzes response:', response);

      let allMyQuizzes = [];

      if (response.data) {
        console.log(' Setting quizzes data, count:', response.data.length);
        allMyQuizzes = response.data;
      } else {
        console.log(' No data in response');
      }

      if (!response.data || response.data.length === 0) {
        console.log(' my-quizzes returned empty, trying getAllQuizz as fallback...');
        try {
          const allQuizzesResponse = await QuizzService.getAllQuizz();
          console.log(' All quizzes response:', allQuizzesResponse);

          if (allQuizzesResponse.data && userId) {
            const myQuizzes = allQuizzesResponse.data.filter(quiz => quiz.user_id === userId);
            console.log(' Filtered my quizzes:', myQuizzes);
            allMyQuizzes = myQuizzes;
          }
        } catch (fallbackError) {
          console.error(' Fallback getAllQuizz also failed:', fallbackError);
        }
      }

      const quizzesWithStatus = allMyQuizzes.map((quiz, index) => ({
        ...quiz,
      }));

      setAllQuizzes(quizzesWithStatus);
      console.log(' Final quizzes with status:', quizzesWithStatus);

    } catch (error) {
      console.error(' Error fetching my quizzes:', error);
      setAllQuizzes([]);
    } finally {
      console.log(' fetchMyQuizzes finished, setting loading to false');
      setLoading(false);
    }
  };

  const handleTabPress = (tabName) => {
    setActiveTab(tabName);

    if (tabName === "flashcard") {
      navigation.navigate(SCREENS.FlashCardPage);
    } else if (tabName === "collections") {
      navigation.navigate(SCREENS.SharedQuizz);
    }
  };

  const handleEditQuiz = (quiz, deleteCallback) => {
    console.log(' Edit quiz:', quiz);
    setSelectedQuiz({ ...quiz, deleteCallback });
    setShowEditModal(true);
  };
  const handleEditAccess = (quiz)=>{
    navigation.navigate(SCREENS.UPDATE_ACCESS,{quizId:quiz.id})
  }
  const handleDeleteQuiz = async (quizId) => {
    try {
      console.log(' Deleting quiz:', quizId);
      setLoading(true);

      await QuizzService.deleteQuizz(quizId);

      // Remove quiz from local state
      setAllQuizzes(prevQuizzes =>
        prevQuizzes.filter(quiz => quiz.id !== quizId)
      );

      Alert.alert('Thành công', 'Đã xóa bài kiểm tra thành công');
    } catch (error) {
      console.error(' Error deleting quiz:', error);
      Alert.alert('Lỗi', 'Không thể xóa bài kiểm tra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuiz = async (updatedQuizData) => {
    try {
      console.log(' Saving quiz:', updatedQuizData);

      const updateDto = {
        id: updatedQuizData.id,
        name: updatedQuizData.name,
        image: updatedQuizData.image,
        genreId: updatedQuizData.genreId,
        //status: updatedQuizData.status
      };

      const response = await QuizzService.updateQuizz(updateDto);

      // Update quiz in local state
      setAllQuizzes(prevQuizzes =>
        prevQuizzes.map(quiz =>
          quiz.id === updatedQuizData.id
            ? { ...quiz, ...updatedQuizData, genre_id: updatedQuizData.genreId }
            : quiz
        )
      );

      Alert.alert('Thành công', 'Đã cập nhật bài kiểm tra thành công');
    } catch (error) {
      console.error(' Error updating quiz:', error);
      throw error; 
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Thư viện của tôi</Text>
          <View style={styles.headerIcons}>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <LibraryTab title="Bài kiểm tra" isActive={activeTab === "myLibrary"} onClick={() => setActiveTab("myLibrary")} />
        <LibraryTab title="Được chia sẻ" isActive={activeTab === "collections"} onClick={() => setActiveTab("collections")} />
        <LibraryTab title="Thẻ học bài" isActive={activeTab === "flashcard"} onClick={() => setActiveTab("flashcard")} />
      </View>

      {/* Tab content */}
      {activeTab === "myLibrary" && (
        <View style={styles.content}>
          {/* Filter Row */}
          {/* <View style={styles.filterRow}>
            <TouchableOpacity style={styles.createButton} activeOpacity={0.7} onPress={() => navigation.navigate(SCREENS.QUIZ_CREATION)}>
              <Plus size={18} color="black" />
              <Text style={styles.createButtonText}>Tạo mới</Text>
            </TouchableOpacity>

            <View style={styles.filterContainer}>
              <DropdownFilter
                label={visibility === "public" ? "Công khai" : "Riêng tư"}
                count={filteredQuizzes.length}
                options={[
                  { label: "Công khai", value: "public" },
                  { label: "Riêng tư", value: "private" }
                ]}
                onSelect={(value) => {
                  console.log(' Visibility changed to:', value);
                  setVisibility(value);
                }}
              />
            </View>
          </View> */}

          {/* Loading indicator */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.BLUE} />
              <Text style={styles.loadingText}>Đang tải bài kiểm tra...</Text>
            </View>
          ) : filteredQuizzes.length > 0 ? (
            /* Quiz List */
            <FlatList
              data={filteredQuizzes}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={styles.row}
              renderItem={({ item }) => (
                <QuizCard
                  quiz={item}
                  showOptions={true}
                  onEdit={handleEditQuiz}
                  onDelete={handleDeleteQuiz}
                  onEditAccess={handleEditAccess}
                />
              )}
              contentContainerStyle={styles.quizListContainer}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            /* Empty State */
            <View style={styles.emptyState}>
              <Image source={{ uri: "https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg" }} style={styles.emptyImage} />
              <Text style={styles.emptyTitle}>
                {visibility === "public" ? "Thư viện công khai của bạn trống" : "Thư viện riêng tư của bạn trống"}
              </Text>
              <Text style={styles.emptyDescription}>Tìm câu đố hoặc bài học trong Quizizz Library, hoặc tạo mới.</Text>
              <TouchableOpacity style={styles.exploreButton} activeOpacity={0.7}>
                <Text style={styles.exploreButtonText}>Tìm câu đố hoặc bài học</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {activeTab === "flashcard" && (
        <FlashCardPage />
      )}

      {activeTab === "collections" && (
        <SharedQuizz />
      )}

      {/* Edit Quiz Modal */}
      <EditQuizModal
        visible={showEditModal}
        quiz={selectedQuiz}
        onClose={() => {
          setShowEditModal(false);
          setSelectedQuiz(null);
        }}
        onSave={handleSaveQuiz}
        onDelete={selectedQuiz?.deleteCallback || handleDeleteQuiz}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingBottom: 80,
  },
  statusBar: {
    height: 48,
    backgroundColor: "black",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingHorizontal: 16,
  },
  statusIndicator: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: "#10B981",
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.BLUE,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  headerIcons: {
    flexDirection: "row",
    gap: 8,
  },
  searchContainer: {
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    color: "white",
    left: 10,
    top: "25%",
    transform: [{ translateY: -1 }],
  },
  searchInput: {
    paddingVertical: 8,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "white",
    outlineStyle: "none",
  },
  iconButton: {
    borderRadius: 50,
    backgroundColor: COLORS.BLUE,
    padding: 12,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 10,

  },
  content: {
    padding: 20,
    gap: 5,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    width: "100%",
  },
  filterContainer: {
    width: 120,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  createButtonText: {
    color: "black",
    marginLeft: 8,
  },
  emptyState: {
    marginTop: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyImage: {
    height: 156,
    width: 156,
    borderRadius: 128,
  },
  emptyTitle: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyDescription: {
    marginTop: 8,
    textAlign: "center",
    color: "#6B7280",
  },
  exploreButton: {
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: COLORS.BLUE,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.GRAY_TEXT,
  },
  quizListContainer: {
    paddingVertical: 10,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
   subTabs: {
    flexDirection: "row",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  subTab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
  },
  activeSubTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.BLUE,
  },
  subTabText: {
    fontSize: 16,
    color: "#6B7280",
  },
  activeSubTabText: {
    color: COLORS.BLUE,
    fontWeight: "bold",
  },


});

export default Library;
