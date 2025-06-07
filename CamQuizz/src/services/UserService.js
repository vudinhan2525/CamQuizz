import apiClient from './ApiClient';

export default class UserService {
    static async getAllUsers(kw = null, limit = 10, page = 1, sort = null) {
        try {
            const params = { limit, page };
            if (kw) params.kw = kw;
            if (sort) params.sort = sort;

            const response = await apiClient.get('/auth', { params });
            console.log('response', response.data);
            return {data: response.data.items, pagination: {
                limit: response.data.limit,
                page: response.data.page,
                totalItems: response.data.total_items,
                hasNextPage: true? response.data.page*response.data.limit < response.data.total_items : false,
            }};
        } catch (error) {
                console.error('Error fetching users:', error);
                throw error;
        }
    }

    static async updateUserBanStatus(userId, isBanned) {
        try {
            const requestBody = { is_banned: isBanned };
            console.log('Sending ban request:', { userId, requestBody });

            const response = await apiClient.put(`/auth/${userId}/ban`, requestBody);
            console.log('Ban response:', response.data);
            return response.data;
        } catch (error) {
                console.error('Error updating user ban status:', error);
                throw error;
        }
    }
}
