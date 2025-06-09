import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../../constant/colors';
import { SearchResult } from './SearchResult';
import { SearchView } from './SearchView';
import Octicons from 'react-native-vector-icons/Octicons';
import BottomSheet from '../../../components/BottomSheet';
import { Dropdown } from 'react-native-element-dropdown';
import GenreService from '../../../services/GenreService';
import QuizzService from '../../../services/QuizzService';
import AsyncStorageService from '../../../services/AsyncStorageService';

export const ExploreSearch = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { categoryId } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [categories, setCategories] = useState([
    { label: 'Category 1', value: '1' },
    { label: 'Category 2', value: '2' },
    { label: 'Category 3', value: '3' },
  ]);
  const bottomSheetRef = useRef();
  const [filterObj, setFilterObj] = useState({
    categoryId: 0,
    popularSort: 'anttend_num',
    newestSort: 'created_at',
  });
  const [originalFilterObj, setOriginalFilterObj] = useState({
    categoryId: 0,
    popularSort: 'anttend_num',
    newestSort: 'created_at',
  });

  useEffect(() => {
    if (categoryId !== null) {
      setFilterObj(prev => ({
        ...prev,
        categoryId: categoryId
      }));
      setOriginalFilterObj(prev => ({
        ...prev,
        categoryId: categoryId
      }));
      setShowResult(true);
    }

  }, [categoryId])
  React.useEffect(() => {
    const fetchCategories = async () => {
      const genres = await GenreService.getAllGenres();
      console.log('Fetching categories');
      genres.data = genres.data.map((item) => ({
        label: item.name,
        value: item.id,
      }));
      setCategories([{ value: 0, label: 'All' }, ...genres.data]);
    };
    fetchCategories();
    return () => {
      resetState();
    };
  }, []);
  const handleSearchSubmit = async () => {
    console.log('searchQuery', searchQuery);
    await AsyncStorageService.saveRecentSearch(searchQuery);
    setShowResult(true);
  };
  const resetState = () => {
    setSearchQuery('');
    setShowResult(false);
    setFilterObj({
      categoryId: 0,
      popularSort: 'anttend_num',
      newestSort: 'created_at',
    });
    setOriginalFilterObj({
      categoryId: 0,
      popularSort: 'anttend_num',
      newestSort: 'created_at',
    });
  };

  const clearSearchQuery = () => {
    setSearchQuery('');
    setShowResult(false);
  };

  const handleSearchPress = async (query) => {
    setSearchQuery(query);
    console.log('Search query:', query);
    await AsyncStorageService.saveRecentSearch(query);

    setShowResult(true);
  };

  const resetFilters = () => {
    setOriginalFilterObj({
      categoryId: 0,
      popularSort: 'anttend_num',
      newestSort: 'created_at',
    });
  };

  const applyFilters = () => {
    bottomSheetRef.current.close();
    setOriginalFilterObj(filterObj);
  };






  const timeSortOptions = [
    { label: 'Mới nhất', value: 'created_at' },
    { label: 'Cũ nhất', value: '-created_at' },
  ];
  const popularSortOptions = [
    { label: 'Phổ biến', value: 'anttend_num' },
    { label: 'Ít phổ biến', value: '-anttend_num' },
  ]


  return (
    <SafeAreaView style={styles.container}>
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
          {showResult && (
            <TouchableOpacity onPress={() => bottomSheetRef.current.open()}>
              <Octicons name="filter" size={24} color={COLORS.WHITE} style={styles.filterIcon} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.content}>
        {showResult ? (
          <SearchResult searchQuery={searchQuery} filters={originalFilterObj} categories={categories} />
        ) : (
          <SearchView onSearchPress={handleSearchPress} />
        )}
      </View>

      <BottomSheet ref={bottomSheetRef} title="Bộ lọc">
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <View>
            <View style={styles.dropdownContainer}>
              <Text style={styles.label}>Danh mục</Text>
              <Dropdown
                style={styles.dropdown}
                data={categories}
                labelField="label"
                valueField="value"
                value={filterObj.categoryId}
                onChange={(item) => {
                  setFilterObj({ ...filterObj, categoryId: item.value });
                }}
              />
            </View>

            <View style={styles.dropdownContainer}>
              <Text style={styles.label}>Độ phổ biến</Text>
              <Dropdown
                style={styles.dropdown}
                data={popularSortOptions}
                labelField="label"
                valueField="value"
                value={filterObj.popularSort}
                onChange={(item) => {
                  setFilterObj({ ...filterObj, popularSort: item.value });
                }}
              />
            </View>

            <View style={styles.dropdownContainer}>
              <Text style={styles.label}>Thời gian</Text>
              <Dropdown
                style={styles.dropdown}
                data={timeSortOptions}
                labelField="label"
                valueField="value"
                value={filterObj.newestSort}
                onChange={(item) => {
                  setFilterObj({ ...filterObj, newestSort: item.value });
                }}
              />
            </View>
          </View>

          {/* Buttons at bottom */}
          <View style={styles.modalButtons}>
            <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={resetFilters}>
              <Text style={[styles.buttonText, styles.resetButtonText]}>Đặt lại bộ lọc</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.applyButton]} onPress={applyFilters}>
              <Text style={[styles.buttonText, styles.applyButtonText]}>Áp dụng bộ lọc</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>

    </SafeAreaView>
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
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: COLORS.BLUE_LIGHT,
  },
  resetButtonText: {
    color: COLORS.BLUE,
  },
  applyButton: {
    backgroundColor: COLORS.BLUE,
  },
  applyButtonText: {
    color: COLORS.WHITE,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: COLORS.BLUE,
    marginRight: 8
  },
  dropdown: {
    flex: 1,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  colorBlue: {
    color: COLORS.BLUE
  },


});

export default ExploreSearch;
