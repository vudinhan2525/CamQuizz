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

    static async getAllReports(search = null, status = null, page = 1, limit = 10) {
        try {
            const params = { page, limit };

            if (search && search.trim()) {
                params.search = search.trim();
            }

            if (status && status !== 'All') {
                params.status = status;
            }

            console.log('Getting quiz reports with params:', params);

            const response = await apiClient.get('/quiz-reports', { params });
            console.log('Quiz reports response:', response.data);

            return {
                data: response.data?.data?.items || [],
                pagination: {
                    limit: response.data?.data?.limit || 10,
                    page: response.data?.data?.page || 1,
                    totalItems: response.data?.data?.total_items || 0,
                    hasNextPage: response.data?.data ? (response.data.data.page * response.data.data.limit < response.data.data.total_items) : false,
                }
            };
        } catch (error) {
            console.error('Error fetching quiz reports:', error);
            throw error;
        }
    }

    static async createReport(quiz_id, reporter_id, message) {
        try {
            const requestBody = {
                quiz_id: quiz_id,
                reporter_id: reporter_id,
                message: message
            };

            console.log('Creating report with data:', requestBody);

            const response = await apiClient.post('/quiz-reports', requestBody);
            console.log('Report created successfully:', response.data);

            return response.data;
        } catch (error) {
            console.error('Error creating report:', error);
            throw error;
        }
    }

    static async updateReport(reportId, updateData) {
        try {
            console.log('Updating report with data:', { reportId, updateData });

            const response = await apiClient.put(`/quiz-reports/${reportId}`, updateData);
            console.log('Report updated successfully:', response);


            return response.data;
        } catch (error) {
            console.error('Error updating report:', error);
            throw error;
        }
    }

    static async getStatistics() {
        try {
            console.log('Getting quiz report statistics...');

            const response = await apiClient.get('/quiz-reports/statistics');
            console.log('Statistics response:', response.data);

            return response.data?.data || null;
        } catch (error) {
            console.error('Error fetching statistics:', error);
            throw error;
        }
    }

    static async getReportsForQuiz(quizId, page = 1, limit = 10) {
        try {
            console.log(`Getting reports for quiz ${quizId} with page=${page}, limit=${limit}`);

            const response = await apiClient.get(`/quiz-reports/quiz/${quizId}`, {
                params: { page, limit }
            });
            console.log('Quiz reports response:', response.data);

            return {
                data: response.data?.data?.items || [],
                pagination: {
                    limit: response.data?.data?.limit || 10,
                    page: response.data?.data?.page || 1,
                    totalItems: response.data?.data?.total_items || 0,
                    hasNextPage: response.data?.data ? (response.data.data.page * response.data.data.limit < response.data.data.total_items) : false,
                }
            };
        } catch (error) {
            console.error('Error fetching quiz reports:', error);
            throw error;
        }
    }
}