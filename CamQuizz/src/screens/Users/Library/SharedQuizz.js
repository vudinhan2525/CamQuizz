import React, { useState } from "react";
import {View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import QuizCard from "../../../components/QuizCard";
import COLORS from "../../../constant/colors";

const FILTERS = [
  { id: "newest", label: "Mới nhất" },
  { id: "1month", label: "1 tháng trước" },
  { id: "2months", label: "2 tháng trước" },
];

const SharedQuizz = () => {
  const [quizzes, setQuizzes] = useState([
    {
      id: "1",
      title: "Math Quiz",
      questions: 10,
      attempts: 5,
      image: "https://i.imgur.com/7h7Z5K6.jpg",
      date: "2024-03-10", 
    },
    {
      id: "2",
      title: "Science Quiz",
      questions: 15,
      attempts: 10,
      image: "https://i.imgur.com/oYiTqum.jpg",
      date: "2024-02-15",
    },
    {
      id: "3",
      title: "History Quiz",
      questions: 12,
      attempts: 7,
      image: "https://i.imgur.com/QnqcdEO.jpg",
      date: "2024-01-20",
    },
    {
      id: "4",
      title: "Geography Quiz",
      questions: 8,
      attempts: 4,
      image: "https://i.imgur.com/Mnyv9Dc.jpg",
      date: "2024-01-05",
    },
  ]);

  const [selectedFilter, setSelectedFilter] = useState("newest");

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
            onPress={() => setSelectedFilter(filter.id)}
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

      {/* Hiển thị danh sách QuizCard sau khi lọc */}
      <FlatList
        data={filterQuizzesByTime()}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => <QuizCard quiz={item} attemptText="người thi" />}
      />

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
});
