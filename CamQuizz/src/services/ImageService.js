import axios from 'axios';
import { CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_CLOUD_NAME } from '@env';

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

class ImageService {
    static async getImage(url) {
        try {
            const response = await axios.get(url, { responseType: 'blob' });
            return response.data;
        } catch (error) {
            console.error("Error fetching image:", error.message);
            throw error;
        }
    }

    static async uploadImage(image) {
        try {
            const formData = new FormData();
            formData.append('file', {
                uri: image.uri,
                type: image.type,
                name: image.name
            });
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            console.log("Form data:", formData);
            const response = await axios.post(CLOUDINARY_UPLOAD_URL, formData, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error uploading image:", error.response?.data || error.message);
            throw error;
        }
    }
}

export default ImageService;
