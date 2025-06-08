import apiClient from './ApiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

class QuizzService {
    static async getAllQuizz(keyword = null, genreId = null, page = 1, limit = 5, sort = 'created_at', anttend_num = 'anttend_num') {
        try {
            const params = {
                limit,
                page,
                sort,
            };
            if (genreId !== null) params.genre_id = genreId;
            if (keyword !== null) params.kw = keyword;
            if (anttend_num !== null) params.anttend_num = anttend_num;
            const response = await apiClient.get('/quiz', { params });
            return {
                data: response.data.data,
                pagination: response.data.pagination,
            };

        } catch (error) {
            console.error(`category: ${genreId}Error fetching quizzes:`, error);
            throw error;
        }
    }
    static async getQuizzById(id) {
        try {
            const response = await apiClient.get(`/quiz/${id}`);
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching quiz with ID ${id}:`, error);
            throw error;
        }
    }
    static async createQuizz(createQuizDto) {
        try {
            const response = await apiClient.post('/quiz', createQuizDto);
            return response.data;
        } catch (error) {
            if (error.response) {
                console.error('API error response:', error.response.data);
            } else {
                console.error('Network or other error:', error.message);
            }
            throw error;
        }
    }
    static async updateQuizz(updateQuizDto) {
        try {
            const response = await apiClient.put('/quiz', updateQuizDto);
            return response.data;
        } catch (error) {
            console.error(`Error updating quiz with ID ${updateQuizDto.id}:`, error);
            throw error;
        }
    }
    static async deleteQuizz(id) {
        try {
            const response = await apiClient.delete(`/quiz/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting quiz with ID ${id}:`, error);
            throw error;
        }
    }


    // Lấy danh sách quiz của user hiện tại
    static async getMyQuizzes(keyword = null, page = 1, limit = 10, sort = 'created_at') {
        try {
            const params = {
                limit,
                page,
                sort,
            };
            if (keyword !== null) params.kw = keyword;

            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('Unauthorized - Please log in again');
            }

            console.log('Calling getMyQuizzes API with token:', token.substring(0, 15) + '...');

            const response = await apiClient.get('/quiz/my-quizzes', { params });
            console.log('getMyQuizzes API response:', response.data);

            return {
                data: response.data.data,
                pagination: response.data.pagination,
            };

        } catch (error) {
            console.error('Error fetching my quizzes:', error);

            if (error.response && error.response.status === 401) {
                throw new Error('Unauthorized - Please log in again');
            }

            throw error;
        }
    }

    static async getTop5Quizzes() {
        try {
            const response = await apiClient.get('/quiz/top5');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching top 5 quizzes:', error);
            throw error;
        }
    }

    // Lấy danh sách quiz được chia sẻ với user hiện tại
    static async getSharedQuizzes(keyword = null, page = 1, limit = 10, sort = 'created_at') {
        try {
            const params = {
                limit,
                page,
                sort,
            };
            if (keyword !== null) params.kw = keyword;

            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('Unauthorized - Please log in again');
            }

            console.log('Calling getSharedQuizzes API with token:', token.substring(0, 15) + '...');

            const response = await apiClient.get('/quiz/shared-with-me', { params });
            console.log('getSharedQuizzes API response:', response.data);

            if (response.status === 401) {
                throw new Error('Unauthorized - Please log in again');
            }

            return {
                data: response.data.data,
                pagination: response.data.pagination,
            };

        } catch (error) {
            console.error('Error fetching shared quizzes:', error);

            if (error.response?.status === 401) {
                throw new Error('Unauthorized - Please log in again');
            }

            throw error;
        }
    }
    static async updateQuizAccess(quizId, updateData){
        try {
            const response = await apiClient.put('/quiz/access', updateData);
            return response.data;
        } catch (error) {
            console.log(`Error updating quiz with ID ${updateData.quizId}:`, error);
            throw error;
        }
    }
}

export default QuizzService;
