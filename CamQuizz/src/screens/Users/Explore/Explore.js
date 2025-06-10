import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, Image, StyleSheet, TextInput, TouchableOpacity, Animated,
  Platform, FlatList, Alert, KeyboardAvoidingView, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as signalR from '@microsoft/signalr';
import { useNavigation } from '@react-navigation/native';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Octicons from 'react-native-vector-icons/Octicons';
import COLORS from '../../../constant/colors';
import CategorySection from '../../../components/CategorySection';
import QuizCard from '../../../components/QuizCard';
import SCREENS from '../../index';
import GenreService from '../../../services/GenreService';
import QuizzService from '../../../services/QuizzService';
import { mockPlayers, mockQuiz } from '../../../components/data/MockQuizPlayData';
import { useHubConnection } from '../../../contexts/SignalRContext';
import AsyncStorageService from '../../../services/AsyncStorageService';
import PackageService from '../../../services/PackageService'

import { API_URL } from '@env';
import JoinSection from './JoinSection';
export const Explore = ({ navigation }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [userName, setUserName] = useState('Nguyen Duy An');
  const [avatar, setAvatar] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState({ id: 0, name: 'All' });
  const [quizzes, setQuizzes] = useState([]);
  const [isAll, setIsAll] = useState(false);
  const [userId,setUserId]= useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
  });
  const { setHubConnection, hubConnection } = useHubConnection();
  const [isJoining, setIsJoining] = useState(false);

  React.useEffect(() => {
    const fetchCategories = async () => {
      const genres = await GenreService.getAllGenres();
      console.log('Fetching categories');
      setCategories([{ id: 0, name: 'All' }, ...genres.data]);
    };
    fetchCategories();
    AsyncStorageService.getUserData().then((data) => {
      if (data) {
        setUserName(data.first_name + " " + data.last_name);
        setAvatar(data.photos);
        setUserId(data.id)
      }
    }
    ).catch((error) => {
      console.error('Error fetching user data:', error);
    });
  }, []);


  React.useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        console.log('Fetching quizzes for category:', selectedCategory.id);
        const { data, pagination: serverPagination } = await QuizzService.getAllQuizz(null, selectedCategory.id, 1, pagination.limit);
        if (data) {
          setQuizzes(data);
          setPagination({
            page: 1,
            limit: 5,
          });
        }
        if (serverPagination) {
          setIsAll(serverPagination.total_pages === 1);
        }
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    };
    if (selectedCategory.id !== 0)
      fetchQuizzes();
  }, [selectedCategory]);

  React.useEffect(() => {
    if (!hubConnection) return;

    const handlePlayerJoined = (room) => {
      console.log("Successfully joined room:", room);
      navigation.navigate(SCREENS.LOBBY, {
        quizId: room.QuizId,
        isHost: false,
        roomCode: room.RoomId,
        playerList: room.PlayerList,
        HostId: room.HostId
      });
      setJoinCode('');
      setIsJoining(false);
    };

    const handleError = (error) => {
      // console.error("Hub error:", error);
      // Alert.alert("Lỗi", error.Message || "Không thể tham gia phòng");
      setIsJoining(false);
    };

    hubConnection.on("playerJoined", handlePlayerJoined);
    hubConnection.on("error", handleError);

    return () => {
      hubConnection.off("playerJoined", handlePlayerJoined);
      hubConnection.off("error", handleError);
    };
  }, [hubConnection]);
  const handleCreateQuiz = async ()=>{
    const quota = await PackageService.getCurrentQuota(userId);
    if(quota.remaining_quizz>0)
      navigation.navigate(SCREENS.QUIZ_CREATION) 
    else 
      Alert.alert("Thông báo", `Bạn đã sử dụng hết ${quota.total_quizz} bài kiểm tra được tạo\n\nCó thể mua thêm ở Gói giới hạn`)
  }
  const handleSeeMore = async (category, navigate) => {
    // Xử lý sự kiện khi nhấn nút "Xem thêm"
    if (navigate) {
      navigation.navigate(SCREENS.EXPLORE_SEARCH, { categoryId: category.id });
      return;
    }
    try {
      const { data, pagination: paginationn } = await QuizzService.getAllQuizz(null, category.id, pagination.page + 1, pagination.limit);
      if (data) {
        setIsAll(paginationn.total_pages === pagination.page + 1);
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
  const connectToHub = async (connectionId) => {
    try {
      console.log("Connecting to SignalR hub with connection ID:", connectionId);
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_URL}/quizHub?id=${connectionId}`, {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets
        })
        .configureLogging(signalR.LogLevel.Information)
        .withAutomaticReconnect()
        .build();



      await connection.start();
      console.log("Connected to SignalR hub");
      setHubConnection(connection);

      return connection;
    } catch (error) {
      console.error("Error connecting to SignalR hub:", error);
      throw error;
    }
  };

  // const handleJoinGame = async () => {
  //   if (!joinCode.trim()) {
  //     Alert.alert('Thông báo', 'Vui lòng nhập mã tham gia');

  //     return;
  //   }

  //   try {
  //     console.log(API_URL)
  //     const response = await fetch(`${API_URL}/tmpHub/negotiate`, {
  //       method: 'POST',
  //       headers: {
  //         'Accept': 'application/json',
  //         'Content-Type': 'application/json'
  //       },
  //     });
  //     const data = await response.json();
  //     const connectionId = data.connectionId;
  //     console.log('Connection data:', data);

  //     if (response.ok) {
  //       // Connect to SignalR hub
  //       const hubConnection = await connectToHub(connectionId); 
  //       setIsJoining(true);
  //       const userId = await AsyncStorageService.getUserId();

  //       await hubConnection.invoke("JoinRoom", {
  //         userId: userId,
  //         roomId: joinCode
  //       });
  //     } 
  //   }catch (error) {
  //       console.error('Error joining room:', error);
  //       Alert.alert(
  //         'Lỗi',
  //         'Không thể tham gia phòng. Vui lòng kiểm tra mã phòng và thử lại!'
  //       );
  //       setIsJoining(false);
  //     }
  //   };
  const handleJoinGame = useCallback(async () => {
    if (!joinCode.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã tham gia');
      return;
    }

    try {
      setIsJoining(true);
      const response = await fetch(`${API_URL}/tmpHub/negotiate`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error('Negotiation failed');

      const hubConnection = await connectToHub(data.connectionId);
      const userId = await AsyncStorageService.getUserId();

      await hubConnection.invoke("JoinRoom", {
        userId: userId,
        roomId: joinCode
      });
    } catch (error) {
      let message = 'Không thể tham gia phòng. Vui lòng kiểm tra mã phòng và thử lại!';
      if (error && error.message) {
        if (
          error.message.includes("permission") ||
          error.message.includes("permission to access") ||
          error.message.includes("không có quyền")
        ) {
          message = 'Bạn không có quyền tham gia phòng này!';
        } else if (
          error.message.includes("Room is full") ||
          error.message.includes("đã đủ người")
        ) {
          message = 'Phòng đã đủ người tham gia!';
        }
      }
      Alert.alert('Lỗi', message);
      setIsJoining(false);
    }
  }, [joinCode, connectToHub]);
  const handleJoinCodeChange = useCallback((text) => {
    setJoinCode(text);
  }, []);

  const chunkArray = (array, size) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };

  const content = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >

      <Text style={styles.title}>Khám phá</Text>
      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      >
        {categories.map((item) => (
          <TouchableOpacity
            key={item.id.toString()}
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
        ))}
      </ScrollView>


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
        )))
        : (
          <View style={styles.gridContainer}>

            {chunkArray(quizzes, 2).map((row, rowIndex) => (
              <View key={rowIndex} style={{ flexDirection: 'row' }}>
                {row.map((item, colIndex) => (
                  <View key={colIndex} style={{ flex: 1, margin: 5 }}>
                    <QuizCard quiz={item} onPress={() => navigation.navigate(SCREENS.QUIZ_DETAIL, { quiz: item })} />
                  </View>
                ))}
                {row.length < 2 && <View style={{ flex: 1, margin: 5 }} />}
              </View>
            ))}
            {selectedCategory.name !== 'All' && !isAll && quizzes.length !== 0 && (
              <TouchableOpacity style={styles.seeMoreButton}
                onPress={() => handleSeeMore(selectedCategory, false)}>
                <Text style={styles.seeMoreButtonText}>Xem thêm</Text>
              </TouchableOpacity>
            )}

          </View>
        )
      }

    </KeyboardAvoidingView>
  )


  return (
    <SafeAreaView 
      style={styles.container} 
      edges={['top']} // Chỉ áp dụng safe area cho phần top, không áp dụng cho bottom
    >

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
              <Ionicons name="create-outline" size={30} color={COLORS.BLUE} onPress={() => { handleCreateQuiz()}} />
            </View>
            <Text style={styles.buttonText}>Tạo quiz</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <View style={styles.iconContainer}>
              <Fontisto name="shopping-package" size={30} color={COLORS.BLUE} onPress={() => { navigation.navigate(SCREENS.USER_PACKAGE) }} />
            </View>
            <Text style={styles.buttonText}>Gói giới hạn</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <View style={styles.iconContainer}>
              <Octicons name="report" size={30} color={COLORS.BLUE} onPress={() => { navigation.navigate(SCREENS.REPORT_HISTORY) }} />
            </View>
            <Text style={styles.buttonText}>Lịch sử báo cáo</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
      <JoinSection
        joinCode={joinCode}
        onChangeJoinCode={handleJoinCodeChange}
        onJoinGame={handleJoinGame}
        isJoining={isJoining}
      />
      <Animated.ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 20 }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: animatedValue } } }],
          { useNativeDriver: false }
        )}
      >
        {content()}

      </Animated.ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
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
  joinButtonDisabled: {
    backgroundColor: COLORS.GRAY_LIGHT,
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
