import apiClient from './ApiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

class StudySetService {
    // Lấy tất cả study set của người dùng hiện tại
    static async getMyStudySets(userId, keyword = null, limit = 10, page = 1) {
        try {
            const params = {
                limit,
                page,
            };
            if (keyword) params.kw = keyword;

            // Kiểm tra token trước khi gọi API
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('Unauthorized - Please log in again');
            }

            console.log('Calling API with token:', token.substring(0, 15) + '...');
            
            // Tạo URL với query params
            let url = `${apiClient.defaults.baseURL}/study-sets/my-study-sets/${userId}`;
            if (Object.keys(params).length > 0) {
                const queryString = Object.entries(params)
                    .map(([key, value]) => `${key}=${value}`)
                    .join('&');
                url += `?${queryString}`;
            }
            
            // Sử dụng fetch thay vì axios
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            
            console.log('Fetch response status:', response.status);
            
            if (response.status === 401) {
                throw new Error('Unauthorized - Please log in again');
            }
            
            const responseText = await response.text();
            console.log('Response text preview:', responseText.substring(0, 100) + '...');
            
            // Parse JSON nếu có thể
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Error parsing response as JSON:', e);
                throw new Error('Invalid response format from server');
            }
            
            return data;
        } catch (error) {
            console.error(`Error fetching study sets for user ${userId}:`, error);
            throw error;
        }
    }

    // Lấy tất cả study set (có thể lọc theo nhiều tiêu chí)
    static async getAllStudySets(keyword = null, limit = 10, page = 1, sort = null, userId = null) {
        try {
            const params = {
                limit,
                page,
            };
            if (keyword) params.kw = keyword;
            if (sort) params.sort = sort;
            if (userId) params.user_id = userId;

            const response = await apiClient.get('/study-sets', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching all study sets:', error);
            throw error;
        }
    }

    // Lấy thông tin một study set cụ thể
    static async getStudySetById(id) {
        try {
            const response = await apiClient.get(`/study-sets/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching study set with ID ${id}:`, error);
            throw error;
        }
    }

    // Tạo study set mới
    static async createStudySet(studySetData) {
        try {
            // Đảm bảo dữ liệu đúng định dạng
            const formattedData = {
                name: studySetData.name,
                user_id: parseInt(studySetData.user_id)
            };

            console.log('Sending study set data:', formattedData);

            // Gọi API
            const response = await apiClient.post('/study-sets', formattedData);

            // Kiểm tra response status
            if (response.status === 401) {
                throw new Error('Unauthorized - Please log in again');
            }

            if (response.status !== 201) {
                throw new Error('Failed to create study set');
            }

            // Trả về dữ liệu phản hồi
            if (!response.data) {
                throw new Error('No data received from server');
            }

            console.log('Study set created successfully:', response.data);
            return response.data;

        } catch (error) {
            console.error('Error creating study set:', error);
            throw error;
        }
    }

    // Cập nhật study set
    static async updateStudySet(studySetData) {
        try {
            // Đảm bảo dữ liệu đúng định dạng theo backend API
            const formattedData = {
                id: parseInt(studySetData.id),
                user_id: parseInt(studySetData.user_id),
                name: studySetData.name
            };

            console.log('Updating study set with data:', formattedData);

            const response = await apiClient.put('/study-sets', formattedData);

            if (response.status !== 200) {
                throw new Error('Failed to update study set');
            }

            console.log('Study set updated successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error updating study set:`, error);

            if (error.response?.status === 401) {
                throw new Error('Unauthorized - Please log in again');
            }

            throw error;
        }
    }

    // Xóa study set
    static async deleteStudySet(id) {
        try {
            const response = await apiClient.delete(`/study-sets/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting study set with ID ${id}:`, error);
            throw error;
        }
    }

    // Thêm hàm này để kiểm tra API với token trực tiếp
    static async testApiWithToken(userId) {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('No token available');
            }
            
            console.log('Testing API with token:', token.substring(0, 20) + '...');
            
            // Thử gọi API với fetch thay vì axios
            const response = await fetch(`${apiClient.defaults.baseURL}/study-sets/my-study-sets/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            
            console.log('Fetch response status:', response.status);
            const responseText = await response.text();
            console.log('Fetch response text:', responseText);
            
            return {
                status: response.status,
                text: responseText
            };
        } catch (error) {
            console.error('Error testing API with token:', error);
            return {
                status: 'error',
                text: error.message
            };
        }
    }
}

export default StudySetService;



