import React from 'react';
import { View, Text, FlatList, StyleSheet,TouchableOpacity } from 'react-native';
import Antdesign from 'react-native-vector-icons/AntDesign';
export const SearchView = ({onSearchPress}) => {
  const recentSearches = ['Quiz 1', 'Quiz 2 Quiz 2 Quiz 2', 'Quiz 3', 'Quiz 1', 'Quiz 2', 'Quiz 3'];
  const popularSearches = ['Popular Quiz 1', 'Popular Quiz 2', 'Popular Quiz 3'];

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
      <Text style={styles.title}>TÌM KIẾM HÀNG ĐẦU</Text>
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
