import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { ArrowLeft, Plus, ChevronRight } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AddCardScreen from "../../../components/Flash-Card/AddCardScreen";
import COLORS from "../../../constant/colors";
import SCREENS from "../..";
import StudySetService from "../../../services/StudySetService";
import FlashCardService from "../../../services/FlashCardService";
import Toast from "react-native-toast-message";

export const FlashcardSetDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params || {};
  const [activeTab, setActiveTab] = useState("today");
  const [showAddCard, setShowAddCard] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [setTitle, setSetTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [studySet, setStudySet] = useState(null);

  // Lấy thông tin study set và flashcards từ API
  useEffect(() => {
    const fetchStudySetDetails = async () => {
      try {
        setLoading(true);
        console.log('Fetching study set with ID:', id);

        // Lấy thông tin study set
        const response = await StudySetService.getStudySetById(id);
        console.log('Study set response:', response); // Log để kiểm tra cấu trúc dữ liệu

        if (response) {
          setStudySet(response);
          setSetTitle(response.name || 'Bộ thẻ học bài');

          try {
            // Lấy danh sách flashcards
            console.log('Fetching flashcards for study set ID:', id);
            const flashcardsResponse = await FlashCardService.getFlashCardsByStudySetId(id);
            console.log('Flashcards response:', flashcardsResponse); // Log để kiểm tra cấu trúc dữ liệu

            // Kiểm tra cấu trúc dữ liệu trả về
            let flashcardsData = [];
            if (flashcardsResponse && Array.isArray(flashcardsResponse)) {
              flashcardsData = flashcardsResponse;
            } else if (flashcardsResponse && Array.isArray(flashcardsResponse.data)) {
              flashcardsData = flashcardsResponse.data;
            } else if (response.flashCards && Array.isArray(response.flashCards)) {
              // Nếu flashcards đã được bao gồm trong response của study set (camelCase)
              flashcardsData = response.flashCards;
              console.log('Using flashcards from study set response (camelCase)');
            } else if (response.flash_cards && Array.isArray(response.flash_cards)) {
              // Nếu flashcards đã được bao gồm trong response của study set (snake_case)
              flashcardsData = response.flash_cards;
              console.log('Using flashcards from study set response (snake_case)');
            } else {
              console.warn('Unexpected flashcards API response structure:', flashcardsResponse);
              flashcardsData = [];
            }

            // Chuyển đổi dữ liệu từ API sang định dạng hiển thị
            const formattedFlashcards = flashcardsData.map(card => ({
              id: card.id,
              front: card.question,
              back: card.answer,
              createdAt: card.createdAt || card.created_at
            }));

            setFlashcards(formattedFlashcards);
          } catch (flashcardError) {
            console.error('Lỗi khi lấy danh sách flashcards:', flashcardError);
            // Nếu không thể lấy flashcards riêng, kiểm tra xem study set có chứa flashcards không
            if (response.flashCards && Array.isArray(response.flashCards)) {
              const formattedFlashcards = response.flashCards.map(card => ({
                id: card.id,
                front: card.question,
                back: card.answer,
                createdAt: card.createdAt || card.created_at
              }));

              setFlashcards(formattedFlashcards);
            } else if (response.flash_cards && Array.isArray(response.flash_cards)) {
              const formattedFlashcards = response.flash_cards.map(card => ({
                id: card.id,
                front: card.question,
                back: card.answer,
                createdAt: card.created_at
              }));

              setFlashcards(formattedFlashcards);
            }
          }
        } else {
          Toast.show({
            type: 'error',
            text1: 'Lỗi',
            text2: 'Không tìm thấy thông tin bộ thẻ'
          });
        }

        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi lấy thông tin bộ thẻ:', error);
        setLoading(false);
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không thể tải thông tin bộ thẻ học bài'
        });
      }
    };

    if (id) {
      fetchStudySetDetails();
    }
  }, [id]);

  useEffect(() => {
    // Listen for when the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      // Check if we have a reviewCompleted param from the study screen
      if (route.params?.reviewCompleted) {
        setReviewCount(prevCount => prevCount + 1);
        // Clear the parameter to prevent multiple increments
        navigation.setParams({ reviewCompleted: undefined });
      }
    });

    return unsubscribe;
  }, [navigation, route]);

  const handleAddFlashcard = async (frontText, backText) => {
    if (!frontText.trim() || !backText.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Cả mặt trước và mặt sau đều phải có nội dung!'
      });
      return;
    }

    try {
      // Tạo flashcard mới thông qua API
      const flashcardData = {
        study_set_id: parseInt(id),
        question: frontText,
        answer: backText
      };

      console.log('Sending flashcard data:', flashcardData);
      const response = await FlashCardService.createFlashCard(flashcardData);
      console.log('Create flashcard response:', response);

      // Kiểm tra cấu trúc dữ liệu trả về
      if (response) {
        // Thêm flashcard mới vào danh sách
        const newFlashcard = {
          id: response.id || Date.now(), // Fallback to timestamp if no ID
          front: response.question || frontText,
          back: response.answer || backText,
          createdAt: response.createdAt || response.created_at || new Date().toISOString()
        };

        setFlashcards([...flashcards, newFlashcard]);
        setShowAddCard(false);

        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: 'Đã thêm thẻ học bài mới'
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Lỗi khi tạo thẻ học bài mới:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể tạo thẻ học bài mới. Vui lòng thử lại sau.'
      });
    }
  };

  const handleStudyComplete = () => {
  setReviewCount(prevCount => prevCount + 1);
};

  return (
    <View style={styles.container}>
      {showAddCard ? (
        <AddCardScreen
          onClose={() => setShowAddCard(false)}
          onSave={handleAddFlashcard}
        />
      ) : (
        <>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <ArrowLeft size={24} color={"black"} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{setTitle}</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={() => setShowAddCard(true)}>
                <View style={styles.plus}>
                  <Plus size={22} color={"white"} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.BLUE} />
              <Text style={styles.loadingText}>Đang tải thông tin bộ thẻ...</Text>
            </View>
          ) : (
            <>
            {/* Stats */}
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              Tổng cộng: {flashcards.length}/{flashcards.length}
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{flashcards.length}</Text>
                <Text style={styles.statLabel}>Mới</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{reviewCount}</Text>
                <Text style={styles.statLabel}>Số lượt ôn</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  {flashcards.length > 0 ? Math.ceil(flashcards.length * 0.5) : 0}
                </Text>
                <Text style={styles.statLabel}>Thời gian (phút)</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.studyButton,
                flashcards.length === 0 && styles.disabledButton,
              ]}
              disabled={flashcards.length === 0}
              onPress={() => navigation.navigate(SCREENS.FLASHCARD_STUDY, {
                setId: id,
                flashcards: flashcards,
                onStudyComplete: handleStudyComplete  // Pass the callback function
              })}
            >
              <Text style={styles.studyButtonText}>Học</Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "today" && styles.activeTab]}
              onPress={() => setActiveTab("today")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "today" && styles.activeTabText,
                ]}
              >
                Hôm nay
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === "record" && styles.activeTab]}
              onPress={() => setActiveTab("record")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "record" && styles.activeTabText,
                ]}
              >
                Bản ghi
              </Text>
            </TouchableOpacity>

            <View style={styles.tabSpacer} />

            {/* <View style={styles.allButton}>
              <Text style={styles.allText}>Tất cả</Text>
              <ChevronRight size={18} />
            </View> */}
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            {flashcards.length > 0 ? (
              flashcards.map((card, index) => (
                <View key={index} style={styles.flashcard}>
                  <View style={styles.flashcardHeader}>
                    <Text style={styles.cardTitle}>Card {index + 1}</Text>
                  </View>
                  <View style={styles.flashcardBody}>
                    <View style={styles.flashcardSide}>
                      <Text style={styles.sideLabel}>Front:</Text>
                      <Text>{card.front}</Text>
                    </View>
                    <View style={styles.flashcardSide}>
                      <Text style={styles.sideLabel}>Back:</Text>
                      <Text>{card.back}</Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyMessage}>
                <Text>Hiện tại chưa có thẻ học bài nào. Nhấn nút + để thêm 1 thẻ.</Text>
              </View>
            )}
          </ScrollView>
            </>
          )}
        </>
      )}
    </View>
  );
};

export default FlashcardSetDetail;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.BLUE
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10
  },
  headerRight: {
    flexDirection: "row",
    gap: 16
  },
  plus: {
    right: 20,
    borderRadius: 10,
    borderColor: COLORS.BLUE,
    backgroundColor: COLORS.BLUE,
    borderWidth: 2,
    padding: 3,
    alignItems: "center",
    justifyContent: "center"
  },
  statsContainer: {
    backgroundColor: "#FFF",
    padding: 16
  },
  statsText: {
    color: "#777",
    marginBottom: 10
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16
  },
  statBox: {
    alignItems: "center"
  },
  statNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.BLUE
  },
  statLabel: {
    color: "#777"
  },
  studyButton: {
    backgroundColor: COLORS.BLUE,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  studyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold"
  },
  disabledButton: {
    backgroundColor: "#A0AEC0"
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 20
  },
  tabText: {
    fontSize: 16,
    color: "#777"
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.BLUE
  },
  activeTabText: {
    color: COLORS.BLUE,
    fontWeight: "bold"
  },
  tabSpacer: {
    flex: 1
  },
  allButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16
  },
  allText: {
    color: "#777",
    marginRight: 4
  },
  content: {
    flex: 1,
    padding: 16
  },
  flashcard: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    borderColor: COLORS.BLUE,
    borderWidth: 1
  },
  flashcardHeader: {
    marginBottom: 8
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold"
  },
  flashcardBody: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  flashcardSide: {
    width: "48%",
    borderWidth: 1,
    padding: 8,
    borderRadius: 6,
    borderColor: COLORS.BLUE

  },
  sideLabel: {
    color: "#777",
    marginBottom: 4
  },
  emptyMessage: {
    alignItems: "center",
    padding: 16
  },
});
