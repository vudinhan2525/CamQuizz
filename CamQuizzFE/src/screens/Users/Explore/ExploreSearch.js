import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../../constant/colors';
import { SearchResult } from './SearchResult';
import { SearchView } from './SearchView';
import Octicons from 'react-native-vector-icons/Octicons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { Modal } from '@ant-design/react-native';

export const ExploreSearch = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { categoryId } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [filterObj, setFilterObj] = useState({
    categoryId: categoryId,
    numberQuestion: [0, 10] //range
    ,
    popularSort: true,
    newestSort: true,
  });

  const handleSearchSubmit = () => {
    console.log('searchQuery', searchQuery);
    setShowResult(true);
  };

  const clearSearchQuery = () => {
    setSearchQuery('');
    setShowResult(false);
  };
  const handleSearchPress = (query) => {
    setSearchQuery(query);
    setShowResult(true);
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.searchContainer, {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
        }]}>
          <View style={styles.searchInputContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={COLORS.GRAY_LIGHT} style={styles.searchIcon} />
            </TouchableOpacity>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm bài kiểm tra"
              placeholderTextColor={COLORS.GRAY_LIGHT}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={categoryId == null}
              onSubmitEditing={handleSearchSubmit}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearchQuery}>
                <Ionicons name="close-circle" size={24} color={COLORS.BLUE} style={styles.clearIcon} />
              </TouchableOpacity>
            )}
          </View>
          {showResult && <Octicons name="filter" size={24} color={COLORS.WHITE} style={styles.filterIcon} />}
        </View>
      </View>
      <View style={styles.content}>
        {showResult ? (
          <SearchResult searchQuery={searchQuery} filters={filterObj} />
        ) : (
          <SearchView onSearchPress={handleSearchPress}/>
        )}
      </View>
      <Text>{categoryId}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    width: '100%',
    backgroundColor: COLORS.BLUE,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 20,
    height: 70,
  },
  searchContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: COLORS.GRAY_LIGHT,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'white',
    height: 50,
    flex: 1,
  },
  searchIcon: {
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 4,
  },
  clearIcon: {
    paddingHorizontal: 10,
  },
  content: {
    flex: 1,
  },
  filterIcon: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
  },
});

export default ExploreSearch;
