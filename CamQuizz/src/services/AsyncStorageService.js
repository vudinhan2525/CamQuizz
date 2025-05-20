import AsyncStorage from '@react-native-async-storage/async-storage';
class AsyncStorageService {
    static getUserId = async () => {
        try {
            const userDataString = await AsyncStorage.getItem("userData");
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                const userId = userData.id;
                console.log("User ID:", userId);
                return userId;
            }
        } catch (error) {
            console.error("Error getting user ID from storage", error);
        }
    };
    static saveConnectionId = async (connectionId) => {
        try {
            await AsyncStorage.setItem("connectionId", connectionId);
        } catch (error) {
            console.error("Error saving connection ID to storage", error);
        }
    }
    static getConnectionId = async () => {
        try {
            const connectionId = await AsyncStorage.getItem("connectionId");
            return connectionId;
        } catch (error) {
            console.error("Error getting connection ID from storage", error);
        }
    };
    static clearConnectionId = async () => {
        try {
            await AsyncStorage.removeItem("connectionId");
        } catch (error) {
            console.error("Error clearing connection ID from storage", error);
        }
    };

}

export default AsyncStorageService;