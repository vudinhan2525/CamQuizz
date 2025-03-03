import React, { useState, useRef } from 'react';
import {
  View, Text, Image, StyleSheet, TextInput, TouchableOpacity, Animated,
  Platform, FlatList
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import COLORS from '../../constant/colors';
import CategorySection from '../../components/CategorySection';
import QuizCard from '../../components/QuizCard';
export const Explore = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [userName, setUserName] = useState('Nguyen Duy An');
  const [avatar, setAvatar] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [categories, setCategories] = useState(['All', 'Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quizzes, setQuizzes] = useState([
    { image: 'https://via.placeholder.com/100', title: 'Quiz 1', questions: 10, attempts: 100 },
    { image: 'https://via.placeholder.com/100', title: 'Quiz 2', questions: 15, attempts: 150 },
    { image: 'https://via.placeholder.com/100', title: 'Quiz 3', questions: 20, attempts: 200 },
    { image: 'https://via.placeholder.com/100', title: 'Quiz 4', questions: 25, attempts: 250 },
    { image: 'https://via.placeholder.com/100', title: 'Quiz 5', questions: 30, attempts: 300 },
    { image: 'https://via.placeholder.com/100', title: 'Quiz 6', questions: 35, attempts: 350 },
  ]);
  const handleSeeMore = () => {
    // Xử lý sự kiện khi nhấn nút "Xem thêm"
  };
  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
  };


  const content = () => (
    <>
      {/* Join Code */}
      <View style={styles.card}>
        <TextInput
          style={styles.joinInput}
          placeholder="Nhập mã tham gia"
          placeholderTextColor={COLORS.GRAY_LIGHT}
          value={joinCode}
          onChangeText={setJoinCode}
        />
        <TouchableOpacity style={styles.joinButton}>
          <Text style={styles.joinButtonText}>Tham gia trò chơi</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Khám phá</Text>
      {/* Categories */}
      <FlatList
        nestedScrollEnabled={true}
        style={{ marginHorizontal: 10 }}
        data={categories}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryCard,
              selectedCategory === item && styles.selectedCategoryCard
            ]}
            onPress={() => handleCategoryPress(item)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === item && styles.selectedCategoryText
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
      {selectedCategory === 'All' ? (
        categories.slice(1).map((category, index) => (
          <CategorySection
            key={index}
            category={category}
            quizzes={quizzes}
            onSeeMore={handleSeeMore}
          />
        ))
      ) : (
        <FlatList
          nestedScrollEnabled={true}
          style={{ marginHorizontal: 10 }}
          data={quizzes}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <QuizCard quiz={item} />}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          ListFooterComponent={
            selectedCategory !== 'All' && (
              <TouchableOpacity style={styles.seeMoreButton} onPress={handleSeeMore}>
                <Text style={styles.seeMoreButtonText}>Xem thêm</Text>
              </TouchableOpacity>
            )
          }
        />)

      }
    </>
  )


  return (
  <View style={styles.container}>
    
        {/* headers */}
        <Animated.View style={[styles.header,
          {
            height: animatedValue.interpolate({
              inputRange: [0, 250],
              outputRange: [250, 80], 
              extrapolate: 'clamp',
            }),
        
          }
        ]}>
        <Animated.View style={[styles.setting,
          {
            height: animatedValue.interpolate({
              inputRange: [0, 250],
              outputRange: [60, 0],
              extrapolate: 'clamp',
            }),
            opacity:animatedValue.interpolate({
              inputRange: [0, 100],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            }),
          },
      ]}>
          {
            avatar == null ?
              <EvilIcons name="user" size={60} color={COLORS.WHITE} />
              : <Image
                source={{ uri: avatar }}
                style={styles.avatar}
              />
          }
          <View>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.viewSetting}>Xem cài đặt</Text>
          </View>
        </Animated.View>
        <Animated.View style={[styles.searchContainer,
        {
          position: 'absolute',
          bottom: 0, 
          left: 0,
          right: 0,
        }
        ]}
      >
          <View style={styles.searchInputContainer}>
            <EvilIcons name="search" size={24} color={COLORS.GRAY_LIGHT} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm bài kiểm tra"
              placeholderTextColor={COLORS.GRAY_LIGHT}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </Animated.View>
        <Animated.View style={[styles.buttonsContainer,
          {
            height: animatedValue.interpolate({
              inputRange: [0, 250],
              outputRange: [60, 0],
              extrapolate: 'clamp',
            }),
            opacity:animatedValue.interpolate({
              inputRange: [0, 100],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            }),
          },
      ]}>
          <TouchableOpacity style={styles.button}>
            <View style={styles.iconContainer}>
              <Ionicons name="create-outline" size={30} color={COLORS.BLUE} />
            </View>
            <Text style={styles.buttonText}>Tạo quiz</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <View style={styles.iconContainer}>
              <Ionicons name="library-outline" size={30} color={COLORS.BLUE} />
            </View>
            <Text style={styles.buttonText}>Xem thư viện</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <View style={styles.iconContainer}>
              <Entypo name="line-graph" size={30} color={COLORS.BLUE} />
            </View>
            <Text style={styles.buttonText}>Xem báo cáo</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    <Animated.FlatList
      ListFooterComponent={content}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: animatedValue } } }],
        { useNativeDriver: false }
      )}

      scrollEventThrottle={16}
    />
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    height: 250,
    width: '100%',
    backgroundColor: COLORS.BLUE,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 20,

  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'white',
    marginRight: 10,
  },
  userName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  viewSetting: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  setting: {
    flexDirection: 'row',
  },
  searchContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: COLORS.GRAY_LIGHT,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  searchIcon: {
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  button: {
    alignItems: 'center',
  },
  buttonText: {
    marginTop: 4,
    color: COLORS.WHITE,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  card: {
    margin: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  joinInput: {
    height: 50,
    borderColor: COLORS.BLUE,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  joinButton: {
    backgroundColor: COLORS.BLUE,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginHorizontal: 20,
    fontFamily: 'Roboto-Bold',
  },
  categoryCard: {
    backgroundColor: COLORS.GRAY_BG,
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 5,
    marginVertical: 10,
    height: 40,
    justifyContent: 'center',
  },
  categoryText: {
    color: COLORS.GRAY_TEXT,
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedCategoryCard: {
    backgroundColor: COLORS.BLUE,
  },
  selectedCategoryText: {
    color: 'white',
  },
  categorySection: {
    marginHorizontal: 20
  },
  gridContainer: {
    paddingHorizontal: 10,
  },
  seeMoreButton: {
    marginVertical: 20,
    alignItems: 'center',
  },
  seeMoreButtonText: {
    color: COLORS.BLUE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerCollapsed: {
    height: 80, // Giữ lại chỉ phần thanh search
    justifyContent: 'center',
  },

});
