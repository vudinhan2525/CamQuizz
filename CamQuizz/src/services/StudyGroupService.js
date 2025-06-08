import apiClient from './ApiClient';
export default class StudyGroupService {

    static async createGroup(groupData) {
        try {
            const formattedData = {
                name: groupData.name,
                description: groupData.description || '',
                owner_id: parseInt(groupData.ownerId)
            };
            const response = await apiClient.post('/groups', formattedData);
            console.log('Create group response:', response.data);
            return response.data;
        }
        catch (error) {
            console.error('Error creating study group:', error);
            throw error;
        }
    }
    static async getGroups(userId, status, isOwner) {
        try {
            const response = await apiClient.get(`/groups/groups/${userId}`, {
                params: {
                    userId,
                    status,
                    isOwner
                }
            });
            console.log('Fetched study groups:', response);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching study groups:', error);
            throw error;
        }
    }
    static async changeGroupStatus(groupId, status) {
        try {
            const updateData = {
                status: status
            };

            console.log('Sending status update data:', updateData);

            const response = await apiClient.put(`/groups/${groupId}/status`, updateData,);

            return response.data;
        } catch (error) {
            console.error(`Error changing group ${groupId} status to ${status}:`, error);
        }
    }
    static async deleteGroup(groupId) {
        try {
            const response = await apiClient.delete(`/groups/${groupId}`);
            if (response.status !== 200) {
                throw new Error(`Failed to delete group ${groupId}`);
            }

            console.log('Group deleted successfully');
            return response.data;
        } catch (error) {
            console.error(`Error deleting group ${groupId}:`, error);
            throw error;
        }
    }
    static async deleteQuizFromGroup(groupId, quizId) {
        try {
            const response = await apiClient.delete(`/groups/${groupId}/quizzes/${quizId}`);
            if (response.status !== 200) {
                throw new Error(`Failed to delete quiz ${quizId} from group ${groupId}`);
            }
    
            console.log(`Quiz ${quizId} deleted from group ${groupId} successfully`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting quiz ${quizId} from group ${groupId}:`, error);
            throw error;
        }
    }
    
    static async updateGroup(groupId, groupData) {
        try {
            const formattedData = {
                name: groupData.name,
                description: groupData.description || ''
            };


            const response = await apiClient.put(`/groups/${groupId}`, formattedData);

            return response.data.data;
        } catch (error) {
            console.error(`Error updating group ${groupId}:`, error);
            throw error;
        }
    }

    static async removeMember(groupId, memberId, ownerId) {
        try {
            const response = await apiClient.delete(`/members/remove/${groupId}/${memberId}`, {
                params: { ownerId }
            });
            console.log(`Member ${memberId} removed from group ${groupId}`);
            console.log('response', response)
            return response.data;
        } catch (error) {
            console.error(`Error removing member ${memberId} from group ${groupId}:`, error);
            throw error;
        }
    }
    static async leaveGroup(groupId, userId) {
        try {
            const response = await apiClient.delete(`/members/leave/${groupId}`, {
                params: { userId }
            });
            console.log(`User ${userId} left group ${groupId}`);
            return response.data;
        } catch (error) {
            console.error(`Error leaving group ${groupId} for user ${userId}:`, error);
            throw error;
        }
    }
    static async getGroupQuizzes(groupId) {
        try {

            const response = await apiClient.get(`/groups/${groupId}/quizzes`);
            return response.data.data;
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

}