import React, { useState, useRef } from 'react';
import {
  View, Text, Image, StyleSheet, TextInput, TouchableOpacity, Animated,
  Platform, FlatList, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import COLORS from '../../../constant/colors';
import CategorySection from '../../../components/CategorySection';
import QuizCard from '../../../components/QuizCard';
import SCREENS from '../../index';
import GenreService from '../../../services/GenreService';
import QuizzService from '../../../services/QuizzService';
import { mockPlayers, mockQuiz } from '../../../components/data/MockQuizPlayData';
export const Explore = ({navigation}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [userName, setUserName] = useState('Nguyen Duy An');
  const [avatar, setAvatar] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState({ id: 0, name: 'All' });
  const [quizzes, setQuizzes] = useState([]);
  const [isAll, setIsAll] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
  });
  React.useEffect(() => {
    const fetchCategories = async () => {
      const genres = await GenreService.getAllGenres();
      console.log('Fetching categories');
      setCategories([{ id: 0, name: 'All' }, ...genres.data]);
    };
    fetchCategories();

  }, []);


  React.useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        console.log('Fetching quizzes for category:', selectedCategory.id);
        const {data, paginationn} = await QuizzService.getAllQuizz(null, selectedCategory.id, 1, pagination.limit);

        if (data) {
          setQuizzes(data);
          setPagination({
            page: 1,
            limit: 5,
          });
          setIsAll(paginationn.total_pages === 1);
        }
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    };
    if (selectedCategory.id !== 0)
      fetchQuizzes();
  }, [selectedCategory]);


  const handleSeeMore = async (category, navigate) => {
    // Xử lý sự kiện khi nhấn nút "Xem thêm"
    if (navigate) {
      navigation.navigate(SCREENS.EXPLORE_SEARCH, { categoryId: category.id });
      return;
    }
    try {
      const {data, paginationn} = await QuizzService.getAllQuizz(null, category.id, pagination.page + 1, pagination.limit);
      if (data) {
        setIsAll(paginationn.total_pages === pagination.page+1);
        setQuizzes((prev) => [...prev, ...data]);
        setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
      }


    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }

  };
  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
    setPagination({ page: 1, limit: 5 });
    setIsAll(false);
  };

  // Thêm hàm xử lý tham gia trò chơi
  const handleJoinGame = () => {
    if (!joinCode.trim()) {
      // Hiển thị thông báo nếu không nhập mã
      Alert.alert('Thông báo', 'Vui lòng nhập mã tham gia');
      return;
    }

    const roomFound = true;

    if (roomFound) {
      // Điều hướng đến màn hình Lobby với vai trò người chơi (không phải host)
      navigation.navigate(SCREENS.LOBBY, {
        quizId: mockQuiz.id,
        isHost: false,
        roomCode: joinCode
      });

      setJoinCode('');
    } else {
      Alert.alert('Thông báo', 'Không tìm thấy phòng với mã tham gia này');
    }
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
        <TouchableOpacity style={styles.joinButton} onPress={handleJoinGame}>
          <Text style={styles.joinButtonText}>Tham gia trò chơi</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Khám phá</Text>
      {/* Categories */}
      <FlatList
        nestedScrollEnabled={true}
        style={{ marginHorizontal: 10 }}
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryCard,
              selectedCategory.id === item.id && styles.selectedCategoryCard
            ]}
            onPress={() => handleCategoryPress(item)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory.id === item.id && styles.selectedCategoryText
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
      {selectedCategory.name === 'All' ? (
        categories.slice(1).map((category, index) => (
          <CategorySection
            key={category.id}
            category={category}
            onSeeMore={() => {
              handleSeeMore(category, true)
            }
            }
          />
        ))
      ) : (
        <FlatList
          nestedScrollEnabled={true}
          style={{ marginHorizontal: 10 }}
          data={quizzes}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <QuizCard quiz={item} onPress={() => navigation.navigate(SCREENS.QUIZ_DETAIL, { quiz: item })} />}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          ListFooterComponent={
            selectedCategory.name !== 'All' && !isAll && quizzes.length!=0&& (
              <TouchableOpacity style={styles.seeMoreButton} 
                onPress={()=>{
                  handleSeeMore(selectedCategory, false)}}>
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
          opacity: animatedValue.interpolate({
            inputRange: [0, 100],
            outputRange: [1, 0],
            extrapolate: 'clamp',
          }),
        },
        ]}
        >

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
            <TouchableOpacity
              onPress={() => { navigation.jumpTo(SCREENS.ACCOUNT) }}
            >
              <Text style={styles.viewSetting}>Xem cài đặt</Text>
            </TouchableOpacity>
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
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => { navigation.navigate(SCREENS.EXPLORE_SEARCH, { categoryId: null }) }}
            style={styles.searchInputContainer}>
            <EvilIcons name="search" size={24} color={COLORS.GRAY_LIGHT} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm bài kiểm tra"
              placeholderTextColor={COLORS.GRAY_LIGHT}
              value={searchQuery}
              onChangeText={setSearchQuery}
              disableFullscreenUI={false}
              editable={false}
            />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.buttonsContainer,
        {
          height: animatedValue.interpolate({
            inputRange: [0, 250],
            outputRange: [60, 0],
            extrapolate: 'clamp',
          }),
          opacity: animatedValue.interpolate({
            inputRange: [0, 100],
            outputRange: [1, 0],
            extrapolate: 'clamp',
          }),
        },
        ]}>
          <TouchableOpacity style={styles.button}>
            <View style={styles.iconContainer}>
              <Ionicons name="create-outline" size={30} color={COLORS.BLUE} onPress={() => { navigation.navigate(SCREENS.QUIZ_CREATION) }} />
            </View>
            <Text style={styles.buttonText}>Tạo quiz</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <View style={styles.iconContainer}>
              <Ionicons name="library-outline" size={30} color={COLORS.BLUE} onPress={() => { navigation.jumpTo(SCREENS.LIBRARY) }} />
            </View>
            <Text style={styles.buttonText}>Xem thư viện</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <View style={styles.iconContainer}>
              <Entypo name="line-graph" size={30} color={COLORS.BLUE} onPress={() => { navigation.jumpTo(SCREENS.REPORT) }} />
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
    height: 80,
    justifyContent: 'center',
  },

});
