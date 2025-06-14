import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Plus, FileText, Trash2 } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import PropTypes from 'prop-types';
import COLORS from '../../../constant/colors';
import SCREENS from '../..';
import StudySetService from '../../../services/StudySetService';
import FlashCardService from '../../../services/FlashCardService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkAuthStatus, validateToken } from '../../../services/AuthService';

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
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [setToDelete, setSetToDelete] = useState(null);
  const [newSetName, setNewSetName] = useState('');
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const debugAsyncStorage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      console.log('All AsyncStorage keys:', keys);

      const cardStudyKeys = keys.filter(key => key.startsWith('cardStudy_'));
      console.log('Card study keys:', cardStudyKeys);

      for (const key of cardStudyKeys) {
        const data = await AsyncStorage.getItem(key);
        console.log(`${key}:`, JSON.parse(data));
      }

      const reviewCountKeys = keys.filter(key => key.startsWith('reviewCount_'));
      console.log('Review count keys:', reviewCountKeys);

      for (const key of reviewCountKeys) {
        const data = await AsyncStorage.getItem(key);
        console.log(`${key}:`, data);
      }
    } catch (error) {
      console.error('Error debugging AsyncStorage:', error);
    }
  };



  const getSetReviewCount = async (setId) => {
    try {
      const savedCount = await AsyncStorage.getItem(`reviewCount_${setId}`);
      return savedCount ? parseInt(savedCount) : 0;
    } catch (error) {
      console.error('Error loading set review count:', error);
      return 0;
    }
  };





  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('No token found');
        return;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log('Invalid token format - not a JWT');
        return;
      }

      try {
        const payload = JSON.parse(atob(parts[1]));
        console.log('Token payload:', payload);

        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
          console.log('Token has expired');
        } else {
          console.log('Token is still valid');
        }

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

  useEffect(() => {
    checkToken();
    debugAsyncStorage(); 
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

      const parts = token.split('.');
      if (parts.length === 3) {
        try {
          const payload = JSON.parse(atob(parts[1]));
          const tokenUserId = payload.nameid;

          console.log('Token user ID:', tokenUserId);
          console.log('Request user ID:', userId);

          if (tokenUserId && tokenUserId !== userId.toString()) {
            console.warn('User ID mismatch between token and request');
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

      const studySets = response.items || response.data || response;

      const formattedSets = await Promise.all(studySets.map(async (set) => {
        let flashCards = set.flashCards || set.flash_cards || [];

        if (flashCards.length === 0 && (set.flashcardNumber || set.flashcard_number) > 0) {
          try {
            const flashcardsResponse = await FlashCardService.getFlashCardsByStudySetId(set.id);
            flashCards = flashcardsResponse.data || flashcardsResponse || [];
          } catch (error) {
            console.error(`Error fetching flashcards for set ${set.id}:`, error);
            flashCards = [];
          }
        }

        const totalCards = flashCards.length;
        let stats;

        console.log(`Set ${set.id}: totalCards=${totalCards}`);

        if (totalCards === 0) {
          stats = { newCards: 0, learningCards: 0, reviewCards: 0 };
        } else {
          const reviewCount = await getSetReviewCount(set.id);
          console.log(`Set ${set.id}: reviewCount=${reviewCount}`);

          if (reviewCount === 0) {
            stats = { newCards: totalCards, learningCards: 0, reviewCards: 0 };
          } else if (reviewCount <= 2) {
            const learningCards = Math.min(totalCards, Math.ceil(totalCards * 0.8));
            const newCards = Math.max(0, totalCards - learningCards);
            stats = { newCards, learningCards, reviewCards: 0 };
          } else if (reviewCount <= 5) {
            const learningCards = Math.min(totalCards, Math.ceil(totalCards * 0.6));
            const reviewCards = Math.min(totalCards - learningCards, Math.ceil(totalCards * 0.3));
            const newCards = Math.max(0, totalCards - learningCards - reviewCards);
            stats = { newCards, learningCards, reviewCards };
          } else {
            const reviewCards = Math.min(totalCards, Math.ceil(totalCards * 0.7));
            const learningCards = Math.min(totalCards - reviewCards, Math.ceil(totalCards * 0.2));
            const newCards = Math.max(0, totalCards - reviewCards - learningCards);
            stats = { newCards, learningCards, reviewCards };
          }
        }

        console.log(`Set ${set.id} final stats:`, stats);

        return {
          id: set.id.toString(),
          title: set.name,
          totalCards: set.flashcardNumber || set.flashcard_number || 0,
          newCards: stats.newCards,
          learningCards: stats.learningCards,
          reviewCards: stats.reviewCards,
          flashCards: flashCards
        };
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

  const handleDeleteSet = async (setId, setTitle) => {
    try {
      if (!await validateToken()) {
        handleAuthError(navigation);
        return;
      }

      setSetToDelete({ id: setId, title: setTitle });
      setIsDeleteConfirmOpen(true);
    } catch (error) {
      console.error('Error preparing delete:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể xóa bộ thẻ. Vui lòng thử lại sau.'
      });
    }
  };

  const confirmDeleteSet = async () => {
    if (!setToDelete) return;

    try {
      if (!await validateToken()) {
        handleAuthError(navigation);
        return;
      }

      await StudySetService.deleteStudySet(parseInt(setToDelete.id));

      // Remove from local state
      setFlashcardSets(flashcardSets.filter(set => set.id !== setToDelete.id));

      // Close modal and reset state
      setIsDeleteConfirmOpen(false);
      setSetToDelete(null);

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: `Đã xóa bộ thẻ "${setToDelete.title}" thành công`
      });

    } catch (error) {
      console.error('Lỗi khi xóa bộ thẻ:', error);

      if (error.message === 'Unauthorized - Please log in again' || error.response?.status === 401) {
        handleAuthError(navigation);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không thể xóa bộ thẻ. Vui lòng thử lại sau.'
        });
      }

      // Close modal and reset state even on error
      setIsDeleteConfirmOpen(false);
      setSetToDelete(null);
    }
  };

  const cancelDeleteSet = () => {
    setIsDeleteConfirmOpen(false);
    setSetToDelete(null);
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
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.studyButton} onPress={() => handleOpenSet(set.id)}>
                      <Text style={styles.studyButtonText}>Học</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteSet(set.id, set.title)}
                  >
                    <Trash2 size={16} color="white" />
                  </TouchableOpacity>
                </View>
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

      {/* Delete Confirmation Modal */}
      <Modal visible={isDeleteConfirmOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Xác nhận xóa</Text>
            <Text style={styles.deleteConfirmText}>
              Bạn có chắc chắn muốn xóa bộ thẻ "{setToDelete?.title}"?
            </Text>
            <Text style={styles.deleteWarningText}>
              Hành động này không thể hoàn tác.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={cancelDeleteSet}>
                <Text style={styles.modalCancel}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDeleteSet}>
                <Text style={styles.deleteConfirmButton}>Xóa</Text>
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
    alignItems: 'center',
    marginBottom: 8
  },
  flashcardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8
  },
  studyButton: {
    backgroundColor: COLORS.BLUE,
    padding: 8,
    borderRadius: 8,
  },
  studyButtonText: {
    color: 'white'
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
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
  deleteConfirmText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#333'
  },
  deleteWarningText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    fontStyle: 'italic'
  },
  deleteConfirmButton: {
    color: '#dc3545',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
