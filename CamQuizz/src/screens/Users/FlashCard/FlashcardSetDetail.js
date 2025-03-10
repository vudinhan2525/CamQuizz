import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { ArrowLeft, Plus, ChevronRight} from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AddCardScreen from "../../../components/Flash-Card/AddCardScreen";
import COLORS from "../../../constant/colors";

export const FlashcardSetDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params || {};
  const [activeTab, setActiveTab] = useState("today");
  const [showAddCard, setShowAddCard] = useState(false);
  const [flashcards, setFlashcards] = useState([]);

  const handleAddFlashcard = (frontText, backText) => {
    if (!frontText.trim() || !backText.trim()) {
      alert("Both front and back must have text!");
      return;
    }

    setFlashcards([...flashcards, { front: frontText, back: backText }]);
    setShowAddCard(false);
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
              <Text style={styles.headerTitle}>{id}</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={() => setShowAddCard(true)}>
              <View style={styles.plus}>
              <Plus size={22} color={"black"} />
            </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              Total: {flashcards.length}/{flashcards.length}
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{flashcards.length}</Text>
                <Text style={styles.statLabel}>New</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Reviews</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  {flashcards.length > 0 ? Math.ceil(flashcards.length * 0.5) : 0}
                </Text>
                <Text style={styles.statLabel}>Estimated (min)</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.studyButton,
                flashcards.length === 0 && styles.disabledButton,
              ]}
              disabled={flashcards.length === 0}
            >
              <Text style={styles.studyButtonText}>Study</Text>
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
                Today
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
                Record
              </Text>
            </TouchableOpacity>

            <View style={styles.tabSpacer} />

            <View style={styles.allButton}>
              <Text style={styles.allText}>All</Text>
              <ChevronRight size={18} />
            </View>
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
                <Text>No flashcards yet. Click the + button to add a card.</Text>
              </View>
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
};

export default FlashcardSetDetail;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
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
    borderColor: "black",
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
