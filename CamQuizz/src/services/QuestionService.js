import apiClient from './ApiClient';

class QuestionService {
    
    static async getQuestionsByQuizId(quizId, page = 1, limit = 50) {
        try {
            const params = {
                quizId,
                page,
                limit,
                sort: 'created_at'
            };

            const response = await apiClient.get('/question', { params });
            return {
                data: response.data.data,
                pagination: response.data.pagination,
            };
        } catch (error) {
            console.error(`Error fetching questions for quiz ${quizId}:`, error);
            throw error;
        }
    }

    static async getQuestionById(questionId) {
        try {
            const response = await apiClient.get(`/question/${questionId}`);
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching question ${questionId}:`, error);
            throw error;
        }
    }

    static async createQuestion(createQuestionDto) {
        try {
            if (!createQuestionDto.name || createQuestionDto.name.trim().length < 3) {
                throw new Error('Question name must be at least 3 characters long');
            }

            if (!createQuestionDto.description || createQuestionDto.description.trim().length < 10) {
                throw new Error('Question description must be at least 10 characters long');
            }

            if (!createQuestionDto.quizId && !createQuestionDto.quiz_id) {
                throw new Error('Quiz ID is required');
            }

            const apiDto = {
                name: createQuestionDto.name.trim(),
                description: createQuestionDto.description.trim(),
                duration: createQuestionDto.duration || 30,
                score: createQuestionDto.score || 1,
                quiz_id: createQuestionDto.quizId || createQuestionDto.quiz_id
            };

            console.log('Creating question with validated DTO:', apiDto);
            const response = await apiClient.post('/question', apiDto);
            console.log('Question create response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error creating question:', error);
            console.error('Original DTO was:', createQuestionDto);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            throw error;
        }
    }

    static async updateQuestion(updateQuestionDto) {
        try {
            if (!updateQuestionDto.questionId && !updateQuestionDto.question_id) {
                throw new Error('Question ID is required');
            }

            if (!updateQuestionDto.name || updateQuestionDto.name.trim().length < 3) {
                throw new Error('Question name must be at least 3 characters long');
            }

            if (!updateQuestionDto.description || updateQuestionDto.description.trim().length < 10) {
                throw new Error('Question description must be at least 10 characters long');
            }

            const apiDto = {
                question_id: updateQuestionDto.questionId || updateQuestionDto.question_id,
                name: updateQuestionDto.name.trim(),
                description: updateQuestionDto.description.trim(),
                duration: updateQuestionDto.duration || 30,
                score: updateQuestionDto.score || 1
            };

            console.log('Updating question with validated DTO:', apiDto);
            console.log('Original DTO was:', updateQuestionDto);

            const response = await apiClient.put('/question', apiDto);
            console.log('Question update response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error updating question:', error);
            console.error('Original DTO was:', updateQuestionDto);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            }
            throw error;
        }
    }

    static async deleteQuestion(questionId) {
        try {
            const response = await apiClient.delete(`/question/${questionId}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting question ${questionId}:`, error);
            throw error;
        }
    }
}

export default QuestionService;
