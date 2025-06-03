import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import Antdesign from 'react-native-vector-icons/AntDesign';
import AsyncStorageService from '../../../services/AsyncStorageService';
import QuizzService from '../../../services/QuizzService';
export const SearchView = ({ onSearchPress }) => {
  const [recentSearches, setRecentSearches] = React.useState([]);
  const [popularSearches, setPopularSearches] =React.useState([]); ;
  React.useEffect(() => {
    const fetchRecentSearches = async () => {
      try {
        const recentSearches = await AsyncStorageService.get5RecentSearches();
        if (recentSearches) {
          setRecentSearches(recentSearches);
        }
      } catch (error) {
        console.error('Error fetching recent searches:', error);
      }
    };
    const fetchPopularSearches = async () => {
      try {
        const topQuizzes = await QuizzService.getTop5Quizzes();
        if (topQuizzes) {
          setPopularSearches(topQuizzes.map(quiz => quiz.name));
        }
      } catch (error) {
        console.error('Error fetching popular searches:', error);
      }
    };
    fetchPopularSearches();
    fetchRecentSearches();
  }, []);
  const renderPopular = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => onSearchPress(item)}>
      <Text style={styles.itemText}>{item}</Text>
      <Antdesign name="right" size={20} color="black" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={recentSearches.length > 0 ? {} : { display: 'none' }}>
        <Text style={styles.title}>GẦN ĐÂY</Text>
        <View style={styles.containerRecent}>
          {
            recentSearches.map((item, index) => (
              <TouchableOpacity style={styles.recentItemContainer} key={index} onPress={() => onSearchPress(item)}>
                <Text style={styles.recentItemText}>{item}</Text>
              </TouchableOpacity>
            ))
          }
        </View>
      </View>
      <Text style={styles.title}>BÀI KIỂM TRA PHỔ BIẾN</Text>
      <FlatList
        data={popularSearches}
        renderItem={renderPopular}
        keyExtractor={(item, index) => index.toString()}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  list: {
    marginBottom: 20,
  },
  itemContainer: {
    padding: 10,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemText: {
    fontSize: 16,
  },
  recentItemContainer: {
    margin: 5,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentItemText: {
    fontSize: 16,
    color: 'black',
  },
  containerRecent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  }
});

export default SearchView;
