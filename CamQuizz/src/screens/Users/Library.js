import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Search, Plus, MoreVertical } from "lucide-react-native";
import LibraryTab from "../../components/Library/LibraryTab";
import FlashCardPage from "../Users/FlashCard/FlashCardPage";
import SharedQuizz from "../Users/Library/SharedQuizz";
import COLORS from '../../constant/colors';
import DropdownFilter from "../../components/Library/DropdownFilter";
import { useNavigation } from '@react-navigation/native';
import SCREENS from '../../screens/index';

export const Library = () => {
  const [activeTab, setActiveTab] = useState("myLibrary");
  const [visibility, setVisibility] = useState("public"); // "public" or "private"
  const navigation = useNavigation();

  // Hàm xử lý khi tab được chọn
  const handleTabPress = (tabName) => {
    setActiveTab(tabName);
    
    if (tabName === "flashcard") {
      navigation.navigate(SCREENS.FlashCardPage);
    } else if (tabName === "collections") {
      navigation.navigate(SCREENS.SharedQuizz);
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
          <View style={styles.filterRow}>
            <TouchableOpacity style={styles.createButton} activeOpacity={0.7} onPress={() => navigation.navigate(SCREENS.QUIZ_CREATION)}>
              <Plus size={18} color="black" />
              <Text style={styles.createButtonText}>Tạo mới</Text>
            </TouchableOpacity>
            
            <View style={styles.filterContainer}>
              <DropdownFilter 
                label={visibility === "public" ? "Công khai" : "Riêng tư"} 
                count={0} 
                options={[
                  { label: "Công khai", value: "public" },
                  { label: "Riêng tư", value: "private" }
                ]}
                onSelect={(value) => setVisibility(value)}
              />
            </View>
          </View>

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
        </View>
      )}

      {activeTab === "flashcard" && (
        <FlashCardPage /> 
      )}

      {activeTab === "collections" && (
        <SharedQuizz /> 
      )}
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
    justifyContent: "flex-end",
    gap: 80,
    left: 30,
    width: 150,
    height: 25,
    alignSelf: "flex-end",
  },
  createButton: {
    flexDirection: "row",
    justifyContent: "flex-start",
    backgroundColor: "white",
    paddingVertical: 12,
    borderRadius: 8,
    width: 100,
    alignSelf: "flex-start",
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
  
  // Điều chỉnh lại style cho filterRow để không xung đột với subTabs
  filterRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 10,
    width: "100%",
  },
  
  // Điều chỉnh lại style cho createButton
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingVertical: 12,
    borderRadius: 8,
    width: 100,
    marginBottom: 15,
  },
});

export default Library;
