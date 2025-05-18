import apiClient from './ApiClient';
class GenreService {
    static async getAllGenres() {
        try {
            const response = await apiClient.get('/genres');
            console.log('Fetched genres:', response.data);
            
            return response.data;
        } catch (error) {
            console.error('Error fetching genres:', error);
            throw error;
        }
    }

    static async getGenreById(id) {
        try {
            const response = await apiClient.get(`/genres/${id}`);
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching genre with id ${id}:`, error);
            throw error;
        }
    }
}

export default GenreService;