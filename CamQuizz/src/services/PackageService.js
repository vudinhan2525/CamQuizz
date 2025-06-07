import apiClient from './ApiClient';

class PackageService {
    static async getAllPackages() {
        try {
            const response = await apiClient.get('/packages');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching packages:', error);
            throw error;
        }
    }

    static getMomoPaymentUrl = async (packageId, userId) => {
        try {
            const response = await apiClient.post('/packages/get-qr', {
                package_id: packageId,
                user_id: userId,
            });
            console.log("response", response)
            console.log('Momo deeplink response:', response.data);
            console.log('Momo deeplink requestId:', response.data.data.requestId);
            console.log('Momo deeplink payUrl:', response.data.data.payUrl);
            return {
                payUrl: response.data.data.payUrl,
                requestId: response.data.data.requestId,
            };
        } catch (error) {
            console.error('Error getting Momo deeplink:', error);
            throw error;
        }
    };

    static async getCurrentPackage(userId) {
        try {
            const response = await apiClient.get(`/packages/current/${userId}`);
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching current package for user ${userId}:`, error);
            throw error;
        }
    }

    static checkPaymentStatus = async (requestId) => {
        try {
            const response = await apiClient.get(`/packages/payment-status/${requestId}`);
            return response.data;
        } catch (error) {
            console.error('Error checking payment status:', error);
            throw error;
        }
    };
    static async getStatistics(year = 2025) {
        try {
            const response = await apiClient.get(`/packages/stats/${year}`);
            console.log("response", response.data)
            return response.data;

        } catch (error) {
            console.error(`Error fetching statistics for year ${year}:`, error);
            throw error;
        }
    }
    static async updatePackage(packageId, packageData) {
        try {
            const response = await apiClient.put(`/packages`, packageData);
            return response.data.data;
        } catch (error) {
            console.error('Error updating package:', error);
            throw error;
        }
    }
    static async deletePackage(packageId) {
        try {
            const response = await apiClient.delete(`/packages/${packageId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting package:', error);
            throw error;
        }
    }
    static async createPackage(packageData) {
        try {
            const response = await apiClient.post('/packages', packageData);
            console.log("response", response.data.data)
            return response.data.data;
        } catch (error) {
            console.error('Error creating package:', error);
            throw error;
        }
    }
    static async getCurrentQuota(userId){
        try {
            const response = await apiClient.get(`/auth/quota/${userId}`);
            console.log("response", response.data)
            return response.data;
        }
        catch (error) {
            console.error('Error get quota:', error);
            throw error;
        }
    }
}
export default PackageService;