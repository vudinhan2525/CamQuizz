import apiClient from './ApiClient';

class AnswerService {
    static async getAnswersByQuestionId(questionId, page = 1, limit = 50) {
        try {
            const params = {
                questionId,
                page,
                limit,
                sort: 'created_at'
            };

            const response = await apiClient.get('/answer', { params });
            return {
                data: response.data.data,
                pagination: response.data.pagination,
            };
        } catch (error) {
            console.error(`Error fetching answers for question ${questionId}:`, error);
            throw error;
        }
    }

    static async getAnswerById(answerId) {
        try {
            const response = await apiClient.get(`/answer/${answerId}`);
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching answer ${answerId}:`, error);
            throw error;
        }
    }

    static async createAnswer(createAnswerDto) {
        try {
            const dto = {
                answer: createAnswerDto.answer || createAnswerDto.Answer,
                is_correct: createAnswerDto.isCorrect !== undefined ? createAnswerDto.isCorrect : createAnswerDto.IsCorrect,
                question_id: createAnswerDto.questionId || createAnswerDto.QuestionId
            };
            const response = await apiClient.post('/answer', dto);
            return response.data;
        } catch (error) {
            console.error('Error creating answer:', error);
            console.error('Create DTO was:', createAnswerDto);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            throw error;
        }
    }

    static async updateAnswer(updateAnswerDto) {
        try {
            const dto = {
                answer_id: updateAnswerDto.answer_id || updateAnswerDto.answerID || updateAnswerDto.id || updateAnswerDto.AnswerID,
                answer: updateAnswerDto.answer || updateAnswerDto.Answer,
                is_correct: updateAnswerDto.is_correct !== undefined ? updateAnswerDto.is_correct :
                           (updateAnswerDto.isCorrect !== undefined ? updateAnswerDto.isCorrect : updateAnswerDto.IsCorrect)
            };
            const response = await apiClient.put('/answer', dto);
            return response.data;
        } catch (error) {
            console.error('Error updating answer:', error);
            console.error('Update DTO was:', updateAnswerDto);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            throw error;
        }
    }

    static async deleteAnswer(answerId) {
        try {
            const response = await apiClient.delete(`/answer/${answerId}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting answer ${answerId}:`, error);
            throw error;
        }
    }

    static async createMultipleAnswers(questionId, answers) {
        try {
            console.log('Creating multiple answers for question:', questionId, 'answers:', answers);

            const results = [];
            for (const answer of answers) {
                try {
                    const result = await this.createAnswer({
                        answer: answer.text,
                        isCorrect: answer.isCorrect,
                        questionId: questionId
                    });
                    results.push(result);
                    console.log('Created answer successfully:', result);
                } catch (answerError) {
                    console.error('Failed to create answer:', answer, answerError);
                }
            }

            console.log('Created answers results:', results);
            return results;
        } catch (error) {
            console.error('Error creating multiple answers:', error);
            console.error('Question ID:', questionId);
            console.error('Answers:', answers);
            throw error;
        }
    }

    static async updateMultipleAnswers(questionId, answers) {
        try {
            console.log('Updating multiple answers for question:', questionId);

            const existingAnswers = await this.getAnswersByQuestionId(questionId);
            console.log('Existing answers:', existingAnswers.data);

            if (existingAnswers.data && existingAnswers.data.length > 0) {
                for (const answer of existingAnswers.data) {
                    try {
                        await this.deleteAnswer(answer.id);
                        console.log('Deleted answer:', answer.id);
                    } catch (deleteError) {
                        console.warn('Failed to delete answer:', answer.id, deleteError);
                    }
                }
            }
            await new Promise(resolve => setTimeout(resolve, 200));
            return await this.createMultipleAnswers(questionId, answers);
        } catch (error) {
            console.error('Error updating multiple answers:', error);
            console.error('Question ID:', questionId);
            console.error('New answers:', answers);
            throw error;
        }
    }

    static async replaceAnswers(questionId, answers) {
        try {
            console.log('Replacing answers for question:', questionId);
            return await this.createMultipleAnswers(questionId, answers);
        } catch (error) {
            console.error('Error replacing answers:', error);
            throw error;
        }
    }

    static async smartUpdateAnswers(questionId, newAnswers, existingAnswers = []) {
        try {
            console.log('Smart updating answers for question:', questionId);
            console.log('New answers:', newAnswers);
            console.log('Existing answers:', existingAnswers);

            const results = [];

            for (let i = 0; i < newAnswers.length; i++) {
                const newAnswer = newAnswers[i];
                const existingAnswer = existingAnswers[i]; 

                if (existingAnswer) {
                    try {
                        console.log(`Updating existing answer ${existingAnswer.id}:`, newAnswer);
                        const updateResult = await this.updateAnswer({
                            answer_id: existingAnswer.id,
                            answer: newAnswer.text,
                            is_correct: newAnswer.isCorrect
                        });
                        results.push(updateResult);
                        console.log('Updated answer successfully:', updateResult);
                    } catch (updateError) {
                        console.error('Failed to update answer:', existingAnswer.id, updateError);
                    }
                } else {
                    try {
                        console.log('Creating new answer:', newAnswer);
                        const createResult = await this.createAnswer({
                            answer: newAnswer.text,
                            isCorrect: newAnswer.isCorrect,
                            questionId: questionId
                        });
                        results.push(createResult);
                        console.log('Created new answer successfully:', createResult);
                    } catch (createError) {
                        console.error('Failed to create new answer:', newAnswer, createError);
                    }
                }
            }

            if (existingAnswers.length > newAnswers.length) {
                const answersToDelete = existingAnswers.slice(newAnswers.length);
                console.log('Deleting extra answers:', answersToDelete);

                for (const answerToDelete of answersToDelete) {
                    try {
                        await this.deleteAnswer(answerToDelete.id);
                        console.log('Deleted extra answer:', answerToDelete.id);
                    } catch (deleteError) {
                        console.error('Failed to delete extra answer:', answerToDelete.id, deleteError);
                    }
                }
            }

            console.log('Smart update results:', results);
            return results;
        } catch (error) {
            console.error('Error in smart update answers:', error);
            throw error;
        }
    }
}

export default AnswerService;
