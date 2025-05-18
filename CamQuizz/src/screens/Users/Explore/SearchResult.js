import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import COLORS from '../../../constant/colors';
import Entypo from 'react-native-vector-icons/Entypo';
import QuizzService from '../../../services/QuizzService';

export const SearchResult = ({ searchQuery, filters , categories}) => {
  const [quizzes, setQuizzes] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 5,
  });
  const [isAll, setIsAll] = React.useState(false);
  React.useEffect(() => {
    return () => {
      resetState();
    };
  },[]);
  const resetState = () => {
    setQuizzes([]);
    setPagination({
      page: 1,
      limit: 5,
    });
    setIsAll(false);
  };
  React.useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const categoryId = filters.categoryId === 0 ? null : filters.categoryId;
        console.log('categoryId', categoryId);
        const { data, paginationn } = await QuizzService.getAllQuizz(searchQuery, categoryId, 1, pagination.limit, filters.newestSort, filters.popularSort);
        if (data) {
          setQuizzes(data);
          setPagination({
            page: 1,
            limit: 5,
          });
        }
        else
          setQuizzes([]);
        setIsAll(paginationn.total_pages === 1);

      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    };
    fetchQuizzes();
  }, [searchQuery, filters]);
  const handleSeeMore = async () => {
    try {
      const categoryId = filters.categoryId === 0 ? null : filters.categoryId;
      const { data, paginationn } = await QuizzService.getAllQuizz(searchQuery, categoryId, pagination.page + 1, pagination.limit, filters.newestSort, filters.popularSort);
      if (data) {
        setIsAll(paginationn.total_pages === pagination.page + 1);
        setQuizzes((prev) => [...prev, ...data]);
        setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
      }


    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }

  };
  const getCategoryName = (id) => {
    const category = categories.find((item) => item.value === id);
    return category ? category.label : 'Unknown';
  };
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image|| 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg'  }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.name}</Text>
        <View style={styles.row}>
          <Text style={styles.questions}>{item.number_of_questions} câu hỏi</Text>
          <Entypo name="dot-single" size={20} color={COLORS.GRAY} />
          <Text style={styles.plays}>{item.number_of_attended} lượt làm bài</Text>
        </View>
        <View style={styles.categoryContainer}>
          <Text style={styles.category}>{getCategoryName(item.genre_id)}</Text>
        </View>
      </View>
    </View>
  );

  const renderFooter = () => (
    !isAll && quizzes.length!=0 && <View style={styles.footerContainer}>
      <TouchableOpacity style={styles.footerButton} onPress={() => handleSeeMore()}>
        <Text style={styles.footerButtonText}>See More</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={quizzes}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListFooterComponent={renderFooter}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLUE
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginVertical: 5,
  },
  plays: {
    fontSize: 14,
    color: '#888',
  },
  questions: {
    fontSize: 14,
    color: '#888',
  },
  categoryContainer: {
    backgroundColor: COLORS.BLUE,
    borderRadius: 5,
    paddingVertical: 2,
    paddingHorizontal: 5,
    alignSelf: 'flex-start',
  },
  category: {
    fontSize: 14,
    color: '#fff',
  },
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  footerButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.WHITE,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButtonText: {
    color: COLORS.BLUE,
    fontSize: 16,
  },
});

export default SearchResult;
