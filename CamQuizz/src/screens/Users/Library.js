import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Search, Plus, MoreVertical } from "lucide-react-native";
import LibraryTab from "../../components/Library/LibraryTab";
import DropdownFilter from "../../components/Library/DropdownFilter";

export const Library = () => {
  const [activeTab, setActiveTab] = useState("myLibrary");

  return (
    <View style={styles.container}>
      {/* Status Indicator */}
      {/* <View style={styles.statusBar}>
        <View style={styles.statusIndicator} />
      </View> */}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Thư viện của tôi</Text>
          <View style={styles.headerIcons}>
            <View style={styles.searchContainer}>
              <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
              <TextInput placeholder="Tìm kiếm" style={styles.searchInput} />
            </View>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <MoreVertical size={20} color="#4B5563" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <LibraryTab title="Thư viện của tôi" isActive={activeTab === "myLibrary"} onClick={() => setActiveTab("myLibrary")} />
        <LibraryTab title="Collections" isActive={activeTab === "collections"} onClick={() => setActiveTab("collections")} />
        <LibraryTab title="Flash Card" isActive={activeTab === "flashcard"} onClick={() => setActiveTab("flashcard")} />
      </View>

      {/* Tab content */}
      {activeTab === "myLibrary" && (
        <View style={styles.content}>
          <View style={styles.filterRow}>
            <DropdownFilter label="Created by me" count={0} />
            <DropdownFilter label="Published" count={0} />
          </View>

          <TouchableOpacity style={styles.createButton} activeOpacity={0.7}>
            <Plus size={18} color="purple" />
            <Text style={styles.createButtonText}>Tạo mới</Text>
          </TouchableOpacity>

          <View style={styles.emptyState}>
            <Image source={{ uri: "https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg" }} style={styles.emptyImage} />
            <Text style={styles.emptyTitle}>Thư viện của bạn trống</Text>
            <Text style={styles.emptyDescription}>Tìm câu đố hoặc bài học trong Quizizz Library, hoặc tạo mới.</Text>
            <TouchableOpacity style={styles.exploreButton} activeOpacity={0.7}>
              <Text style={styles.exploreButtonText}>Tìm câu đố hoặc bài học</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
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
    outlineStyle: "none",
  },
  iconButton: {
    borderRadius: 50,
    backgroundColor: "#F3F4F6",
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
    gap: 80,
    width: 150,
    height: 25,
  },
  createButton: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "left",
    justifyContent: "center",
    backgroundColor: "white",
    paddingVertical: 12,
    borderRadius: 8,
    width: 100,
  },
  createButtonText: {
    color: "purple",
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
    backgroundColor: "purple",
    borderRadius: 8,
  },
  exploreButtonText: {
    color: "white",
  },
});

export default Library;
