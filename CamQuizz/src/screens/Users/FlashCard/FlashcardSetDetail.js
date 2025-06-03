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
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // Hàm kiểm tra xem flashcard có được tạo hôm nay không
  const isCreatedToday = (createdAt) => {
    if (!createdAt) return false;

    const today = new Date();
    const cardDate = new Date(createdAt);

    return (
      cardDate.getDate() === today.getDate() &&
      cardDate.getMonth() === today.getMonth() &&
      cardDate.getFullYear() === today.getFullYear()
    );
  };

  const getFilteredFlashcards = () => {
    if (activeTab === "today") {
      return flashcards.filter(card => isCreatedToday(card.createdAt));
    }
    return flashcards; 
  };

  const loadReviewCount = async () => {
    try {
      const savedCount = await AsyncStorage.getItem(`reviewCount_${id}`);
      if (savedCount) {
        setReviewCount(parseInt(savedCount));
      }
    } catch (error) {
      console.error('Error loading review count:', error);
    }
  };

  const saveReviewCount = async (count) => {
    try {
      await AsyncStorage.setItem(`reviewCount_${id}`, count.toString());
    } catch (error) {
      console.error('Error saving review count:', error);
    }
  };

  useEffect(() => {
    const fetchStudySetDetails = async () => {
      try {
        setLoading(true);
        console.log('Fetching study set with ID:', id);
        await loadReviewCount();

        const response = await StudySetService.getStudySetById(id);
        console.log('Study set response:', response); 

        if (response) {
          setStudySet(response);
          setSetTitle(response.name || 'Bộ thẻ học bài');

          try {
            console.log('Fetching flashcards for study set ID:', id);
            const flashcardsResponse = await FlashCardService.getFlashCardsByStudySetId(id);
            console.log('Flashcards response:', flashcardsResponse); 

            let flashcardsData = [];
            if (flashcardsResponse && Array.isArray(flashcardsResponse)) {
              flashcardsData = flashcardsResponse;
            } else if (flashcardsResponse && Array.isArray(flashcardsResponse.data)) {
              flashcardsData = flashcardsResponse.data;
            } else if (response.flashCards && Array.isArray(response.flashCards)) {
             
              flashcardsData = response.flashCards;
              console.log('Using flashcards from study set response (camelCase)');
            } else if (response.flash_cards && Array.isArray(response.flash_cards)) {
             
              flashcardsData = response.flash_cards;
              console.log('Using flashcards from study set response (snake_case)');
            } else {
              console.warn('Unexpected flashcards API response structure:', flashcardsResponse);
              flashcardsData = [];
            }

            const formattedFlashcards = flashcardsData.map(card => ({
              id: card.id,
              front: card.question,
              back: card.answer,
              createdAt: card.createdAt || card.created_at
            }));

            setFlashcards(formattedFlashcards);
          } catch (flashcardError) {
            console.error('Lỗi khi lấy danh sách flashcards:', flashcardError);
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
    const unsubscribe = navigation.addListener('focus', async () => {
      if (route.params?.reviewCompleted) {
        const newCount = reviewCount + 1;
        setReviewCount(newCount);
        await saveReviewCount(newCount);

        const cardsToStudy = getFilteredFlashcards();
        for (const card of cardsToStudy) {
          const cardId = card.id || card.Id;
          if (cardId) {
            await updateCardStudyStatus(cardId);
          }
        }

        Toast.show({
          type: 'success',
          text1: 'Hoàn thành!',
          text2: `Bạn đã hoàn thành lượt ôn tập thứ ${newCount}`
        });
        navigation.setParams({ reviewCompleted: undefined });
      }
    });

    return unsubscribe;
  }, [navigation, route, reviewCount, saveReviewCount, getFilteredFlashcards, updateCardStudyStatus]);

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
      const flashcardData = {
        study_set_id: parseInt(id),
        question: frontText,
        answer: backText
      };

      console.log('Sending flashcard data:', flashcardData);
      const response = await FlashCardService.createFlashCard(flashcardData);
      console.log('Create flashcard response:', response);

      if (response) {
        const newFlashcard = {
          id: response.id || Date.now(), 
          front: response.question || frontText,
          back: response.answer || backText,
          createdAt: response.createdAt || response.created_at || new Date().toISOString()
        };

        setFlashcards([...flashcards, newFlashcard]);
        setShowAddCard(false);

        setActiveTab("today");

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

  const updateCardStudyStatus = async (cardId) => {
    try {
      const studyData = await AsyncStorage.getItem(`cardStudy_${cardId}`);
      const studyInfo = studyData ? JSON.parse(studyData) : { studyCount: 0, lastStudied: null };

      studyInfo.studyCount += 1;
      studyInfo.lastStudied = new Date().toISOString();

      await AsyncStorage.setItem(`cardStudy_${cardId}`, JSON.stringify(studyInfo));
      console.log(`Updated study status for card ${cardId}:`, studyInfo);
    } catch (error) {
      console.error('Error updating card study status:', error);
    }
  };

  const handleStudyComplete = async () => {
    const newCount = reviewCount + 1;
    setReviewCount(newCount);
    await saveReviewCount(newCount);

    const cardsToStudy = getFilteredFlashcards();
    for (const card of cardsToStudy) {
      const cardId = card.id || card.Id;
      if (cardId) {
        await updateCardStudyStatus(cardId);
      }
    }

    Toast.show({
      type: 'success',
      text1: 'Hoàn thành!',
      text2: `Bạn đã hoàn thành lượt ôn tập thứ ${newCount}`
    });
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
              {activeTab === "today"
                ? `Hôm nay: ${getFilteredFlashcards().length}/${flashcards.length}`
                : `Tổng cộng: ${flashcards.length}/${flashcards.length}`
              }
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{getFilteredFlashcards().length}</Text>
                <Text style={styles.statLabel}>
                  {activeTab === "today" ? "Hôm nay" : "Tổng số"}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{reviewCount}</Text>
                <Text style={styles.statLabel}>Số lượt ôn</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  {getFilteredFlashcards().length > 0 ? Math.ceil(getFilteredFlashcards().length * 0.5) : 0}
                </Text>
                <Text style={styles.statLabel}>Thời gian (phút)</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.studyButton,
                getFilteredFlashcards().length === 0 && styles.disabledButton,
              ]}
              disabled={getFilteredFlashcards().length === 0}
              onPress={() => {
                const cardsToStudy = getFilteredFlashcards();
                if (cardsToStudy.length === 0) {
                  Toast.show({
                    type: 'info',
                    text1: 'Thông báo',
                    text2: activeTab === "today"
                      ? 'Không có thẻ nào được tạo hôm nay để học'
                      : 'Không có thẻ nào để học'
                  });
                  return;
                }

                navigation.navigate(SCREENS.FLASHCARD_STUDY, {
                  setId: id,
                  flashcards: cardsToStudy,
                  onStudyComplete: handleStudyComplete  
                });
              }}
            >
              <Text style={styles.studyButtonText}>
                Học {activeTab === "today" ? "hôm nay" : "tất cả"} ({getFilteredFlashcards().length})
              </Text>
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
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            {getFilteredFlashcards().length > 0 ? (
              getFilteredFlashcards().map((card, index) => (
                <View key={card.id || index} style={styles.flashcard}>
                  <View style={styles.flashcardHeader}>
                    <Text style={styles.cardTitle}>Card {index + 1}</Text>
                    {card.createdAt && (
                      <Text style={styles.cardDate}>
                        {new Date(card.createdAt).toLocaleDateString('vi-VN')}
                      </Text>
                    )}
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
                <Text>
                  {activeTab === "today"
                    ? "Không có thẻ nào được tạo hôm nay. Nhấn nút + để thêm thẻ mới."
                    : "Hiện tại chưa có thẻ học bài nào. Nhấn nút + để thêm 1 thẻ."
                  }
                </Text>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold"
  },
  cardDate: {
    fontSize: 12,
    color: "#777",
    fontStyle: "italic"
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
