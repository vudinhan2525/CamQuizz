import React, { useState } from "react";
import {View, Text, TouchableOpacity, ScrollView, StyleSheet} from "react-native";
import {ArrowLeft, Plus, Folder, Upload, Menu, ChevronRight} from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import COLORS from '../../../constant/colors';

export const FlashcardSetDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params || {};
  const [activeTab, setActiveTab] = useState("today");

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={"black"} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{id}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity>
            <Plus size={22} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Folder size={22} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Upload size={22} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Menu size={22} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>Total: 0/0</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>New</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Estimated(min)</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.studyButton}>
          <Text style={styles.studyButtonText}>Study</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "today" && styles.activeTab,
          ]}
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
          style={[
            styles.tabButton,
            activeTab === "record" && styles.activeTab,
          ]}
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
        <View style={styles.filterBox}>
          <Text style={styles.filterText}>Filter out 0 cards</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default FlashcardSetDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
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
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  headerRight: {
    flexDirection: "row",
    gap: 16,
  },
  statsContainer: {
    backgroundColor: "#FFF",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  statsText: {
    color: "#777",
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.BLUE,
  },
  statLabel: {
    color: "#777",
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
    fontWeight: "bold",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  tabText: {
    fontSize: 16,
    color: "#777",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.BLUE,
  },
  activeTabText: {
    color: COLORS.BLUE,
    fontWeight: "bold",
  },
  tabSpacer: {
    flex: 1,
  },
  allButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  allText: {
    color: "#777",
    marginRight: 4,
  },
  content: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    padding: 16,
  },
  filterBox: {
    backgroundColor: "#D1D5DB",
    padding: 12,
    borderRadius: 8,
  },
  filterText: {
    color: "#4B5563",
  },
});
