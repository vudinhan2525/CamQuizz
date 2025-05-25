import apiClient from './ApiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

class GroupService {

    static async getAllGroups(search = null, page = 1, pageSize = 10, sort = null) {
        try {
            const params = {
                page,
                pageSize,
            };

            if (search) params.search = search;
            if (sort) params.sort = sort;

            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('Unauthorized - Please log in again');
            }

            console.log('Calling getAllGroups API with token:', token.substring(0, 15) + '...');

            const response = await apiClient.get('/groups', { params });
            console.log('getAllGroups API response:', response.data);

            if (response.data && response.data.data) {
                return response.data;
            } else {
                return { data: response.data };
            }
        } catch (error) {
            console.error('Error fetching all groups:', error);

            if (error.response && error.response.status === 401) {
                throw new Error('Unauthorized - Please log in again');
            }

            throw error;
        }
    }

    static async getMyGroups(userId, search = null, page = 1, pageSize = 10, sort = null) {
        try {
            const params = {
                page,
                pageSize,
            };

            if (search) params.search = search;
            if (sort) params.sort = sort;

            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('Unauthorized - Please log in again');
            }

            console.log('Calling getMyGroups API with token:', token.substring(0, 15) + '...');

            const response = await apiClient.get(`/groups/my-groups/${userId}`, { params });
            console.log('getMyGroups API response:', response.data);

            if (response.data && response.data.data) {
                return response.data;
            } else if (response.data) {
                return { data: response.data };
            } else {
                return { data: [] };
            }
        } catch (error) {
            console.error(`Error fetching groups for user ${userId}:`, error);

            if (error.response && error.response.status === 401) {
                throw new Error('Unauthorized - Please log in again');
            }

            if (error.response && error.response.status === 404) {
                console.log('No groups found for user');
                return { data: [] };
            }

            throw error;
        }
    }

    static async getGroupById(groupId) {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('Unauthorized - Please log in again');
            }

            console.log('Calling getGroupById API with token:', token.substring(0, 15) + '...');
            console.log(`API URL: GET /groups/${groupId}`);

            const response = await apiClient.get(`/groups/${groupId}`, {
                timeout: 10000 // 10 giây
            });

            console.log('getGroupById response:', JSON.stringify(response.data, null, 2));

            // Xử lý dữ liệu trả về
            let groupData = null;

            if (response.data) {
                if (typeof response.data === 'object') {
                    groupData = response.data;
                } else if (typeof response.data === 'string') {
                    try {
                        groupData = JSON.parse(response.data);
                    } catch (e) {
                        console.error('Error parsing group data:', e);
                    }
                }
            }

            return groupData;
        } catch (error) {
            console.error(`Error fetching group with ID ${groupId}:`, error);

            if (error.response && error.response.status === 401) {
                throw new Error('Unauthorized - Please log in again');
            }

            throw error;
        }
    }

    // Tạo nhóm học tập mới
    static async createGroup(groupData) {
        try {
            const formattedData = {
                name: groupData.name,
                description: groupData.description || '',
                owner_id: parseInt(groupData.ownerId)
            };

            console.log('Formatted data for API:', formattedData);

            console.log('Sending group data:', formattedData);

            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('Unauthorized - Please log in again');
            }

            console.log('Calling createGroup API with token:', token.substring(0, 15) + '...');

            const response = await apiClient.post('/groups', formattedData, {
                timeout: 10000
            });

            if (response.status === 401) {
                throw new Error('Unauthorized - Please log in again');
            }

            if (response.status !== 201) {
                throw new Error('Failed to create group');
            }

            if (!response.data) {
                throw new Error('No data received from server');
            }

            console.log('Group created successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error creating group:', error);

            if (error.response && error.response.status === 401) {
                throw new Error('Unauthorized - Please log in again');
            }

            if (error.response && error.response.status === 500) {
                console.log('Server error, please try again later');
                console.log('Error occurred at:', new Date().toISOString());
                console.log('Request URL:', error.config?.url);
                console.log('Request method:', error.config?.method);

                if (error.response.data) {
                    console.log('Server error details:', JSON.stringify(error.response.data));
                }

                let errorMessage = 'Lỗi máy chủ - Vui lòng thử lại sau';
                if (error.response.data && error.response.data.message) {
                    errorMessage += `: ${error.response.data.message}`;
                }

                throw new Error(errorMessage);
            }

            if (error.response && error.response.status === 400) {
                console.log('Bad request error:', JSON.stringify(error.response.data));

                let errorMessage = 'Dữ liệu không hợp lệ - Vui lòng kiểm tra lại thông tin nhóm';
                if (error.response.data && error.response.data.message) {
                    errorMessage += `: ${error.response.data.message}`;
                }

                if (error.response.data && error.response.data.errors) {
                    const errors = error.response.data.errors;
                    const errorDetails = Object.keys(errors)
                        .map(key => `${key}: ${errors[key].join(', ')}`)
                        .join('; ');

                    if (errorDetails) {
                        errorMessage += ` (${errorDetails})`;
                    }
                }

                throw new Error(errorMessage);
            }

            throw error;
        }
    }

    // Tham gia vào nhóm học tập
    static async joinGroup(groupId, userId) {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('Unauthorized - Please log in again');
            }

            console.log('Calling joinGroup API with token:', token.substring(0, 15) + '...');

            const response = await apiClient.post(`/groups/${groupId}/join`, { userId });
            return response.data;
        } catch (error) {
            console.error(`Error joining group ${groupId}:`, error);

            if (error.response && error.response.status === 401) {
                throw new Error('Unauthorized - Please log in again');
            }

            throw error;
        }
    }

    // Cập nhật nhóm học tập
    static async updateGroup(groupId, groupData) {
        try {
            // Đảm bảo dữ liệu đúng định dạng theo yêu cầu của API từ Swagger
            // API chỉ yêu cầu name và description
            const formattedData = {
                name: groupData.name,
                description: groupData.description || ''
            };

            // Log chi tiết dữ liệu gửi đi để debug
            console.log('=== THÔNG TIN GỬI ĐI ===');
            console.log('Formatted data for updateGroup API:', JSON.stringify(formattedData, null, 2));
            console.log('Group ID:', groupId);
            console.log('=== KẾT THÚC THÔNG TIN GỬI ĐI ===');

            // Kiểm tra token trước khi gọi API
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('Unauthorized - Please log in again');
            }

            console.log('Calling updateGroup API with token:', token.substring(0, 15) + '...');

            // Log URL và method
            console.log(`Calling API: PUT /groups/${groupId}`);

            // Gọi API với timeout dài hơn (10 giây)
            const response = await apiClient.put(`/groups/${groupId}`, formattedData, {
                timeout: 10000 // 10 giây
            });

            // Log response chi tiết
            console.log('=== THÔNG TIN PHẢN HỒI TỪ SERVER ===');
            console.log('API response status:', response.status);
            console.log('API response data type:', typeof response.data);
            console.log('API response data:', JSON.stringify(response.data, null, 2));

            // Kiểm tra xem response có đúng định dạng không
            if (response.data === null || response.data === undefined) {
                console.log('CẢNH BÁO: Server trả về dữ liệu null hoặc undefined');
            } else if (typeof response.data === 'string') {
                console.log('CẢNH BÁO: Server trả về dữ liệu dạng string thay vì object');
                try {
                    // Thử parse string thành JSON
                    const parsedData = JSON.parse(response.data);
                    console.log('Parsed string data:', JSON.stringify(parsedData, null, 2));
                } catch (e) {
                    console.log('Không thể parse string thành JSON:', e.message);
                }
            }

            // Log các thuộc tính của response.data nếu là object
            if (response.data && typeof response.data === 'object') {
                console.log('Response data properties:');
                for (const key in response.data) {
                    console.log(`- ${key}: ${JSON.stringify(response.data[key])}`);
                }

                // Kiểm tra xem response có chứa thông tin nhóm đã cập nhật không
                if (response.data.name) {
                    console.log('✅ Server trả về tên nhóm đã cập nhật:', response.data.name);
                } else {
                    console.log('❌ Server không trả về tên nhóm đã cập nhật');
                }

                if (response.data.id) {
                    console.log('✅ Server trả về ID nhóm:', response.data.id);
                } else {
                    console.log('❌ Server không trả về ID nhóm');
                }
            }

            console.log('API response headers:', JSON.stringify(response.headers, null, 2));
            console.log('=== KẾT THÚC THÔNG TIN PHẢN HỒI ===');

            // Kiểm tra response status
            if (response.status === 401) {
                throw new Error('Unauthorized - Please log in again');
            }

            // Xử lý dữ liệu trả về từ API
            let returnData;

            // Kiểm tra xem response.data có phải là string không
            if (typeof response.data === 'string') {
                try {
                    // Thử parse string thành JSON
                    returnData = JSON.parse(response.data);
                    console.log('Đã parse string thành object:', JSON.stringify(returnData, null, 2));
                } catch (e) {
                    console.log('Không thể parse string thành JSON, sử dụng dữ liệu mặc định');
                    returnData = {
                        id: groupId,
                        name: formattedData.name,
                        description: formattedData.description,
                        message: 'Group updated successfully but string data could not be parsed'
                    };
                }
            }
            // Kiểm tra xem response.data có phải là null hoặc undefined không
            else if (response.data === null || response.data === undefined) {
                console.log('Server trả về null hoặc undefined, sử dụng dữ liệu mặc định');
                returnData = {
                    id: groupId,
                    name: formattedData.name,
                    description: formattedData.description,
                    message: 'Group updated successfully but no data returned'
                };
            }
            // Nếu response.data là object, sử dụng nó
            else {
                returnData = response.data;

                // Đảm bảo returnData có đủ thông tin cần thiết
                if (!returnData.id) {
                    console.log('Server không trả về ID, thêm ID vào dữ liệu');
                    returnData.id = groupId;
                }

                if (!returnData.name) {
                    console.log('Server không trả về tên, thêm tên vào dữ liệu');
                    returnData.name = formattedData.name;
                }

                if (!returnData.description && formattedData.description) {
                    console.log('Server không trả về mô tả, thêm mô tả vào dữ liệu');
                    returnData.description = formattedData.description;
                }
            }

            console.log('Group updated successfully:', JSON.stringify(returnData, null, 2));
            return returnData;
        } catch (error) {
            console.error(`Error updating group ${groupId}:`, error);

            // Xử lý lỗi token
            if (error.response && error.response.status === 401) {
                throw new Error('Unauthorized - Please log in again');
            }

            // Xử lý lỗi server
            if (error.response && error.response.status === 500) {
                console.log('Server error, please try again later');
                console.log('Error occurred at:', new Date().toISOString());
                console.log('Request URL:', error.config?.url);
                console.log('Request method:', error.config?.method);

                // Kiểm tra nếu có thông tin lỗi chi tiết từ server
                if (error.response.data) {
                    console.log('Server error details:', JSON.stringify(error.response.data));
                }

                throw new Error('Lỗi máy chủ - Vui lòng thử lại sau');
            }

            // Xử lý lỗi dữ liệu không hợp lệ
            if (error.response && error.response.status === 400) {
                console.log('Bad request error:', JSON.stringify(error.response.data));

                let errorMessage = 'Dữ liệu không hợp lệ - Vui lòng kiểm tra lại thông tin nhóm';
                if (error.response.data && error.response.data.message) {
                    errorMessage += `: ${error.response.data.message}`;
                }

                throw new Error(errorMessage);
            }

            // Xử lý lỗi không tìm thấy nhóm
            if (error.response && error.response.status === 404) {
                throw new Error('Không tìm thấy nhóm học tập');
            }

            throw error;
        }
    }

    // Xóa nhóm học tập
    static async deleteGroup(groupId) {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('Unauthorized - Please log in again');
            }

            console.log('Calling deleteGroup API with token:', token.substring(0, 15) + '...');

            const response = await apiClient.delete(`/groups/${groupId}`, {
                timeout: 10000 // 10 giây
            });

            if (response.status === 401) {
                throw new Error('Unauthorized - Please log in again');
            }

            console.log('Group deleted successfully');
            return response.data;
        } catch (error) {
            console.error(`Error deleting group ${groupId}:`, error);

            if (error.response && error.response.status === 401) {
                throw new Error('Unauthorized - Please log in again');
            }

            if (error.response && error.response.status === 500) {
                console.log('Server error, please try again later');
                console.log('Error occurred at:', new Date().toISOString());
                console.log('Request URL:', error.config?.url);
                console.log('Request method:', error.config?.method);

                if (error.response.data) {
                    console.log('Server error details:', JSON.stringify(error.response.data));
                }

                throw new Error('Lỗi máy chủ - Vui lòng thử lại sau');
            }

            if (error.response && error.response.status === 404) {
                throw new Error('Không tìm thấy nhóm học tập');
            }

            if (error.response && error.response.status === 403) {
                throw new Error('Bạn không có quyền xóa nhóm học tập này');
            }

            throw error;
        }
    }

    static async changeGroupStatus(groupId, status) {
        try {
            // Kiểm tra token trước khi gọi API
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('Unauthorized - Please log in again');
            }

            console.log(`Changing group ${groupId} status to ${status}`);
            console.log('Using token:', token.substring(0, 15) + '...');

            // Server expects enum string values: "Active", "Deleted", "OnHold"
            const updateData = {
                status: status
            };

            console.log('Sending status update data:', updateData);

            const response = await apiClient.put(`/groups/${groupId}/status`, updateData, {
                timeout: 10000 // 10 giây
            });

            if (response.status === 401) {
                throw new Error('Unauthorized - Please log in again');
            }

            console.log(`Group status changed to ${status} successfully`);
            return response.data;
        } catch (error) {
            console.error(`Error changing group ${groupId} status to ${status}:`, error);

            if (error.response && error.response.status === 401) {
                throw new Error('Unauthorized - Please log in again');
            }

            if (error.response && error.response.status === 500) {
                throw new Error('Lỗi máy chủ - Vui lòng thử lại sau');
            }

            if (error.response && error.response.status === 404) {
                throw new Error('Không tìm thấy nhóm học tập');
            }

            if (error.response && error.response.status === 403) {
                throw new Error('Bạn không có quyền thay đổi trạng thái nhóm học tập này');
            }

            throw error;
        }
    }

    // Lấy danh sách quiz được chia sẻ trong nhóm theo GroupId
    static async getSharedQuizzesByGroupId(groupId) {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('Unauthorized - Please log in again');
            }

            console.log('Calling getSharedQuizzesByGroupId API with token:', token.substring(0, 15) + '...');
            console.log(`API URL: GET /groups/${groupId}/quizzes`);

            const response = await apiClient.get(`/groups/${groupId}/quizzes`, {
                timeout: 10000
            });

            console.log('getSharedQuizzesByGroupId API response:', response.data);

            if (response.status === 401) {
                throw new Error('Unauthorized - Please log in again');
            }

            return response.data;
        } catch (error) {
            console.error(`Error fetching shared quizzes for group ${groupId}:`, error);

            if (error.response && error.response.status === 401) {
                throw new Error('Unauthorized - Please log in again');
            }

            if (error.response && error.response.status === 404) {
                throw new Error('Group not found or no shared quizzes');
            }

            if (error.response && error.response.status === 403) {
                throw new Error('You do not have permission to view shared quizzes in this group');
            }

            throw error;
        }
    }

    // Lấy danh sách thành viên trong nhóm theo GroupId
    static async getMembersByGroupId(groupId) {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('Unauthorized - Please log in again');
            }

            console.log('Calling getMembersByGroupId API with token:', token.substring(0, 15) + '...');
            console.log(`API URL: GET /members/${groupId}`);

            const response = await apiClient.get(`/members/${groupId}`, {
                timeout: 10000
            });

            console.log('getMembersByGroupId API response:', response.data);

            if (response.status === 401) {
                throw new Error('Unauthorized - Please log in again');
            }

            return response.data;
        } catch (error) {
            console.error(`Error fetching members for group ${groupId}:`, error);

            if (error.response && error.response.status === 401) {
                throw new Error('Unauthorized - Please log in again');
            }

            if (error.response && error.response.status === 404) {
                throw new Error('Group not found or no members');
            }

            if (error.response && error.response.status === 403) {
                throw new Error('You do not have permission to view members in this group');
            }

            throw error;
        }
    }
}

export default GroupService;
