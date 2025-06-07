import apiClient from './ApiClient'
export default class ReportQuizzService {
    static async getMyTicket(page = 1, limit = 20) {
        try {
            const response = await apiClient.get(`/quiz-reports/my-reports`, {
                params: { page, limit }
            });
            console.log("my report",response.data.data)
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }
}