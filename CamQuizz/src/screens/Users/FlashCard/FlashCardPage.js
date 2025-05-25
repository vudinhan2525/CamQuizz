import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Plus, FileText } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import PropTypes from 'prop-types';
import COLORS from '../../../constant/colors';
import SCREENS from '../..';
import StudySetService from '../../../services/StudySetService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkAuthStatus, validateToken } from '../../../services/AuthService';

// Helper function for handling auth errors
const handleAuthError = (navigation, message = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.') => {
  Toast.show({
    type: 'error',
    text1: 'Lỗi xác thực',
    text2: message
  });
  navigation.getParent()?.reset({
    index: 0,
    routes: [{ name: 'AuthStack' }],
  });
};

const FlashCardPage = () => {
  const navigation = useNavigation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateMethodDialogOpen, setIsCreateMethodDialogOpen] = useState(false);
  const [newSetName, setNewSetName] = useState('');
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Thêm hàm này để kiểm tra token
  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('No token found');
        return;
      }

      // Kiểm tra định dạng token
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log('Invalid token format - not a JWT');
        return;
      }

      // Giải mã phần payload
      try {
        const payload = JSON.parse(atob(parts[1]));
        console.log('Token payload:', payload);

        // Kiểm tra thời hạn
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
          console.log('Token has expired');
        } else {
          console.log('Token is still valid');
        }

        // Kiểm tra roles
        if (payload.role) {
          console.log('Roles in token:', payload.role);
        } else {
          console.log('No roles found in token');
        }
      } catch (e) {
        console.log('Error decoding token payload:', e);
      }
    } catch (error) {
      console.error('Error checking token:', error);
    }
  };

  // Lấy userId và kiểm tra token khi component mount
  useEffect(() => {
    checkToken();
    const getUserData = async () => {
      try {
        setLoading(true);
        const authStatus = await checkAuthStatus();

        if (!authStatus) {
          console.log('Authentication check failed, redirecting to login');
          handleAuthError(navigation, 'Vui lòng đăng nhập lại để tiếp tục');
          return;
        }

        console.log('Authentication valid, user data:', authStatus);
        if (authStatus.id) {
          setUserId(authStatus.id);
          await fetchStudySets(authStatus.id);
        } else {
          handleAuthError(navigation, 'Vui lòng đăng nhập lại để tiếp tục');
        }
      } catch (error) {
        console.error('Error in authentication check:', error);
        handleAuthError(navigation, 'Vui lòng đăng nhập lại để tiếp tục');
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  // Lấy danh sách study sets từ API
  const fetchStudySets = async (userId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token || !await validateToken()) {
        handleAuthError(navigation, 'Vui lòng đăng nhập lại để tiếp tục');
        return;
      }

      // Kiểm tra xem userId có khớp với token không
      const parts = token.split('.');
      if (parts.length === 3) {
        try {
          const payload = JSON.parse(atob(parts[1]));
          const tokenUserId = payload.nameid;

          console.log('Token user ID:', tokenUserId);
          console.log('Request user ID:', userId);

          if (tokenUserId && tokenUserId !== userId.toString()) {
            console.warn('User ID mismatch between token and request');
            // Sử dụng userId từ token thay vì từ state
            userId = parseInt(tokenUserId);
            setUserId(userId);
          }
        } catch (e) {
          console.log('Error decoding token payload:', e);
        }
      }

      setLoading(true);
      const response = await StudySetService.getMyStudySets(userId);

      if (!response || (!response.data && !response.items && !Array.isArray(response))) {
        throw new Error('Invalid response format from server');
      }

      // Handle different response formats: PagedResult with items, direct data, or array
      const studySets = response.items || response.data || response;
      const formattedSets = studySets.map(set => ({
        id: set.id.toString(),
        title: set.name,
        totalCards: set.flashcardNumber || set.flashcard_number || 0,
        newCards: 0,
        learningCards: 0,
        reviewCards: 0,
        flashCards: set.flashCards || set.flash_cards || []
      }));

      setFlashcardSets(formattedSets);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách bộ thẻ:', error);

      if (error.message === 'Unauthorized - Please log in again' || error.response?.status === 401) {
        handleAuthError(navigation);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không thể tải danh sách bộ thẻ học bài. Vui lòng thử lại sau.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật danh sách khi quay lại màn hình
  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        fetchStudySets(userId);
      }
      return () => {};
    }, [userId])
  );

  const handleOpenSet = async (id) => {
    try {
      if (!await validateToken()) {
        handleAuthError(navigation);
        return;
      }

      const selectedSet = flashcardSets.find(set => set.id === id);
      navigation.navigate("LibraryFlashcardSetDetail", {
        id: id,
        flashcardSet: selectedSet
      });
    } catch (error) {
      console.error('Error opening flashcard set:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể mở bộ thẻ. Vui lòng thử lại sau.'
      });
    }
  };

  const handleCreateSet = async () => {
    if (!newSetName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Tên bộ thẻ không được để trống'
      });
      return;
    }

    try {
      if (!await validateToken()) {
        handleAuthError(navigation);
        return;
      }

      const studySetData = {
        name: newSetName,
        user_id: userId
      };

      const response = await StudySetService.createStudySet(studySetData);
      const newSet = {
        id: response.id.toString(),
        title: response.name,
        totalCards: 0,
        newCards: 0,
        learningCards: 0,
        reviewCards: 0
      };

      setFlashcardSets([...flashcardSets, newSet]);
      setNewSetName('');
      setIsCreateDialogOpen(false);

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: `Đã tạo bộ thẻ "${newSetName}" thành công`
      });

      if (userId) {
        fetchStudySets(userId);
      }
    } catch (error) {
      console.error('Lỗi khi tạo bộ thẻ mới:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể tạo bộ thẻ mới. Vui lòng thử lại sau.'
      });
    }
  };

  const handleCreateFromQuiz = async () => {
    try {
      if (!await validateToken()) {
        handleAuthError(navigation);
        return;
      }

      setIsCreateMethodDialogOpen(false);
      navigation.navigate(SCREENS.SELECT_QUIZ_FOR_FLASHCARD);
    } catch (error) {
      console.error('Error navigating to quiz selection:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể chuyển trang. Vui lòng thử lại sau.'
      });
    }
  };

  const handleManualCreate = async () => {
    try {
      if (!await validateToken()) {
        handleAuthError(navigation);
        return;
      }

      setIsCreateMethodDialogOpen(false);
      setIsCreateDialogOpen(true);
    } catch (error) {
      console.error('Error showing create dialog:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể tạo bộ thẻ. Vui lòng thử lại sau.'
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Create Set Button */}
      <TouchableOpacity style={styles.createButton} onPress={() => setIsCreateMethodDialogOpen(true)}>
        <Plus size={20} color="white" />
        <Text style={styles.createButtonText}>Tạo bộ thẻ học bài</Text>
      </TouchableOpacity>

      {/* Flashcard Sets List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.BLUE} />
          <Text style={styles.loadingText}>Đang tải bộ thẻ học bài...</Text>
        </View>
      ) : flashcardSets.length > 0 ? (
        <ScrollView style={styles.flashcardList}>
          {flashcardSets.map((set) => (
            <View key={set.id} style={styles.flashcardItem}>
              <View style={styles.flashcardHeader}>
                <Text style={styles.flashcardTitle}>{set.title}</Text>
                <TouchableOpacity style={styles.studyButton} onPress={() => handleOpenSet(set.id)}>
                    <Text style={styles.studyButtonText}>Học</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.flashcardDetail}>Tổng cộng: {set.totalCards}/{set.totalCards}</Text>
              <View style={styles.separator} />
              <View style={styles.flashcardStats}>
                <Text>Mới: <Text style={styles.statBold}>{set.newCards}</Text></Text>
                <Text>Đang học: <Text style={styles.statBold}>{set.learningCards}</Text></Text>
                <Text>Ôn tập: <Text style={styles.statBold}>{set.reviewCards}</Text></Text>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Bạn chưa có bộ thẻ học bài nào.</Text>
          <Text style={styles.emptySubText}>Nhấn nút "Tạo bộ thẻ học bài" để bắt đầu.</Text>
        </View>
      )}

      {/* Create Method Selection Modal */}
      <Modal visible={isCreateMethodDialogOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Chọn phương thức tạo</Text>

            <TouchableOpacity style={styles.methodButton} onPress={handleManualCreate}>
              <Plus size={20} color={COLORS.BLUE} />
              <Text style={styles.methodButtonText}>Tạo thủ công</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.methodButton} onPress={handleCreateFromQuiz}>
              <FileText size={20} color={COLORS.BLUE} />
              <Text style={styles.methodButtonText}>Tạo từ bài kiểm tra</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsCreateMethodDialogOpen(false)}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create Set Modal */}
      <Modal visible={isCreateDialogOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Tạo bộ</Text>
            <TextInput
              style={styles.modalInput}
              value={newSetName}
              onChangeText={setNewSetName}
              placeholder="Bộ học bài"
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setIsCreateDialogOpen(false)}>
                <Text style={styles.modalCancel}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateSet}>
                <Text style={styles.modalOk}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

FlashCardPage.propTypes = {
  flashcardSets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      totalCards: PropTypes.number.isRequired,
      newCards: PropTypes.number.isRequired,
      learningCards: PropTypes.number.isRequired,
      reviewCards: PropTypes.number.isRequired,
    })
  ),
};

export default FlashCardPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.BLUE
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  emptySubText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.BLUE,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16
  },
  createButtonText: {
    color: 'white',
    marginLeft: 8
  },
  flashcardList: {
    padding: 16
  },
  flashcardItem: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.BLUE
  },
  flashcardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  flashcardTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  studyButton: {
    backgroundColor: COLORS.BLUE,
    padding: 8,
    borderRadius: 8,
  },
  studyButtonText: {
    color: 'white'
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  flashcardDetail: {
    color: '#666',
    marginBottom: 8,
  },
  flashcardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBold: {
    fontWeight: 'bold',
    color: COLORS.BLUE,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    width: '100%',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalCancel: {
    color: '#999',
    fontSize: 16,
  },
  modalOk: {
    color: COLORS.BLUE,
    fontWeight: 'bold',
    fontSize: 16,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
  },
  methodButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.BLUE,
  },
  cancelButton: {
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 16,
  },
});
