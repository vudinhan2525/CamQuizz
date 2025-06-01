import apiClient from './ApiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ReportService {
    // Lấy lịch sử quiz của user hiện tại
    static async getMyQuizHistory(limit = 10, page = 1) {
        try {
            const params = {
                limit,
                page,
            };

            // Kiểm tra token trước khi gọi API
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('Unauthorized - Please log in again');
            }

            console.log('Calling getMyQuizHistory API with params:', params);

            const response = await apiClient.get('/reports/my-quiz-history', { params });
            console.log('getMyQuizHistory API response:', response.data);
            console.log('getMyQuizHistory API response.data.data:', response.data.data);

            // Kiểm tra cấu trúc response
            if (response.data && response.data.Data) {
                // Nếu response có cấu trúc ApiResponse<T>
                return {
                    data: response.data.Data,
                    message: response.data.Status,
                };
            } else if (response.data && response.data.data) {
                // Nếu response có cấu trúc thông thường
                return {
                    data: response.data.data,
                    message: response.data.message,
                };
            } else {
                // Fallback: trả về toàn bộ response.data
                return {
                    data: response.data,
                    message: 'success',
                };
            }
        } catch (error) {
            console.error('Error fetching quiz history:', error);
            throw error;
        }
    }

    // Lấy danh sách attempts của user cho một quiz cụ thể
    static async getQuizAttempts(quizId) {
        try {
            if (!quizId) {
                throw new Error('Quiz ID is required');
            }

            // Kiểm tra token trước khi gọi API
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('Unauthorized - Please log in again');
            }

            console.log('Calling getQuizAttempts API for quiz:', quizId);

            const response = await apiClient.get(`/reports/quiz/${quizId}/attempts`);
            console.log('getQuizAttempts API response:', response.data);
            console.log('getQuizAttempts API response.data.data:', response.data.data);

            // Kiểm tra cấu trúc response
            if (response.data && response.data.Data) {
                // Nếu response có cấu trúc ApiResponse<T>
                return {
                    data: response.data.Data,
                    message: response.data.Status,
                };
            } else if (response.data && response.data.data) {
                // Nếu response có cấu trúc thông thường
                return {
                    data: response.data.data,
                    message: response.data.message,
                };
            } else {
                // Fallback: trả về toàn bộ response.data
                return {
                    data: response.data,
                    message: 'success',
                };
            }
        } catch (error) {
            console.error(`Error fetching attempts for quiz ${quizId}:`, error);
            throw error;
        }
    }

    // Lấy chi tiết một attempt cụ thể
    static async getAttemptReport(attemptId) {
        try {
            if (!attemptId) {
                throw new Error('Attempt ID is required');
            }

            // Kiểm tra token trước khi gọi API
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('Unauthorized - Please log in again');
            }

            console.log('Calling getAttemptReport API for attempt:', attemptId);

            const response = await apiClient.get(`/reports/attempt/${attemptId}`);
            console.log('getAttemptReport API response:', response.data);

            return {
                data: response.data.data,
                message: response.data.message,
            };
        } catch (error) {
            console.error(`Error fetching attempt report ${attemptId}:`, error);
            throw error;
        }
    }

    // Lấy tất cả attempts của user hiện tại
    static async getMyAttempts(limit = 10, page = 1, sort = 'attempt_date') {
        try {
            const params = {
                limit,
                page,
                sort,
            };

            // Kiểm tra token trước khi gọi API
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('Unauthorized - Please log in again');
            }

            console.log('Calling getMyAttempts API with params:', params);

            const response = await apiClient.get('/reports/my-attempts', { params });
            console.log('getMyAttempts API response:', response.data);

            return {
                data: response.data.data,
                message: response.data.message,
            };
        } catch (error) {
            console.error('Error fetching my attempts:', error);
            throw error;
        }
    }
}

export default ReportService;
