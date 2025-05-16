import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './ApiClient';

// Fallback mock users for development/testing when API is unavailable
const MOCK_USERS = [
  {
    id: 1,
    email: 'admin@gmail.com',
    password: 'admin123',
    first_name: 'Admin',
    last_name: 'User',
    gender: 'Nam',
    roles: ['Admin'],
    token: 'admin-mock-token-12345'
  },
  {
    id: 2,
    email: 'user@gmail.com',
    password: 'user123',
    first_name: 'User',
    last_name: 'User',
    gender: 'Nữ',
    roles: ['User'],
    token: 'user-mock-token-67890'
  }
];

// Flag to use mock data instead of real API (for development/testing)
const USE_MOCK_DATA = false; 

// API đăng nhập
export const login = async (email, password) => {
  try {
    if (USE_MOCK_DATA) {
      // Giả lập độ trễ mạng
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user = MOCK_USERS.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!user) {
        throw new Error('Email hoặc mật khẩu không đúng');
      }

      // Lưu thông tin người dùng vào AsyncStorage
      const userData = { ...user };
      delete userData.password; // Không lưu mật khẩu

      console.log('Mock user data:', userData);

      // Kiểm tra token trước khi lưu
      if (!userData.token) {
        console.error('Token is missing in mock user data');
        userData.token = `mock-token-${Date.now()}`; // Tạo token tạm thời nếu không có
      }

      await AsyncStorage.setItem('userToken', userData.token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      return userData;
    } else {
      // Gọi API thực tế
      const response = await apiClient.post('/auth/login', {
        email: email,
        password: password
      });

      // Lấy dữ liệu người dùng từ response
      const userData = response.data;

      // Xử lý trường roles nếu nó có định dạng đặc biệt
      if (userData.roles && userData.roles.$values) {
        // Nếu roles có dạng {"$id": "2", "$values": ["Admin"]}
        userData.roles = userData.roles.$values;
      } else if (!Array.isArray(userData.roles)) {
        // Nếu roles không phải là mảng và không có $values, đặt mặc định
        userData.roles = [];
      }

      console.log('Processed user data:', userData);

      // Kiểm tra token trước khi lưu
      if (!userData.token) {
        console.error('Token is missing in API response');
        userData.token = `api-token-${Date.now()}`; // Tạo token tạm thời nếu không có
      }

      // Lưu token và thông tin người dùng
      await AsyncStorage.setItem('userToken', userData.token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      return userData;
    }
  } catch (error) {
    console.log('Login error details:', error);

    if (error.response) {
      // Nếu server trả về thông báo lỗi cụ thể
      const errorData = error.response.data;

      if (typeof errorData === 'string') {
        throw new Error(errorData);
      } else if (errorData && typeof errorData === 'object') {
        // Nếu là object lỗi, có thể chứa nhiều thông báo lỗi
        if (errorData.message) {
          throw new Error(errorData.message);
        } else if (errorData.error) {
          throw new Error(errorData.error);
        } else {
          throw new Error('Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.');
        }
      }
    } else if (error.request) {
      // Lỗi kết nối đến server
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
    }

    // Các lỗi khác
    throw new Error(error.message || 'Đăng nhập thất bại. Vui lòng thử lại sau.');
  }
};

// API đăng ký
export const signup = async (userData) => {
  try {
    if (USE_MOCK_DATA) {
      // Giả lập độ trễ mạng
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Kiểm tra email đã tồn tại chưa
      const existingUser = MOCK_USERS.find(
        u => u.email.toLowerCase() === userData.email.toLowerCase()
      );

      if (existingUser) {
        throw new Error('Email đã được sử dụng');
      }

      return { success: true, message: 'Đăng ký thành công' };
    } else {
      // Chuẩn bị dữ liệu đăng ký theo định dạng API
      const registerData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        gender: userData.gender,
        role: userData.role || 'Student'
      };

      // Gọi API đăng ký
      const response = await apiClient.post('/auth/signup', registerData);

      return {
        success: true,
        message: 'Đăng ký thành công',
        user: response.data
      };
    }
  } catch (error) {
    console.log('Signup error details:', error);

    if (error.response) {
      // Nếu server trả về thông báo lỗi cụ thể
      const errorData = error.response.data;

      if (typeof errorData === 'string') {
        throw new Error(errorData);
      } else if (errorData && typeof errorData === 'object') {
        // Nếu là object lỗi, có thể chứa nhiều thông báo lỗi
        if (errorData.message) {
          throw new Error(errorData.message);
        } else if (errorData.error) {
          throw new Error(errorData.error);
        } else if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          // Nếu là mảng các lỗi validation
          throw new Error(errorData.errors[0].description || 'Thông tin đăng ký không hợp lệ');
        } else {
          throw new Error('Đăng ký thất bại. Vui lòng kiểm tra thông tin đăng ký.');
        }
      }
    } else if (error.request) {
      // Lỗi kết nối đến server
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
    }

    // Các lỗi khác
    throw new Error(error.message || 'Đăng ký thất bại. Vui lòng thử lại sau.');
  }
};

// Kiểm tra trạng thái đăng nhập
export const checkAuthStatus = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const userDataString = await AsyncStorage.getItem('userData');

    if (token && userDataString) {
      const userData = JSON.parse(userDataString);

      // Xử lý trường roles nếu nó có định dạng đặc biệt
      if (userData.roles && userData.roles.$values) {
        // Nếu roles có dạng {"$id": "2", "$values": ["Admin"]}
        userData.roles = userData.roles.$values;
      } else if (!Array.isArray(userData.roles)) {
        // Nếu roles không phải là mảng và không có $values, đặt mặc định
        userData.roles = [];
      }

      console.log('User data from storage:', userData);
      return userData;
    }
    return null;
  } catch (error) {
    console.error('Error checking auth status:', error);
    return null;
  }
};

// Đăng xuất
export const logout = async () => {
  try {
    // Đảm bảo xóa cả token và dữ liệu người dùng
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');

    console.log('Logged out successfully, token and user data removed');

    return true;
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

// Kiểm tra hợp lệ trước khi đăng ký
export const validateSignup = async (registerData) => {
  try {
    if (USE_MOCK_DATA) {
      // Giả lập độ trễ mạng
      await new Promise(resolve => setTimeout(resolve, 500));

      // Kiểm tra email đã tồn tại chưa
      const existingUser = MOCK_USERS.find(
        u => u.email.toLowerCase() === registerData.email.toLowerCase()
      );

      if (existingUser) {
        throw new Error('Email đã được sử dụng');
      }

      return { isValid: true };
    } else {
      // Gọi API kiểm tra
      const response = await apiClient.post('/auth/validate-signup', {
        email: registerData.email,
        password: registerData.password
      });

      return { isValid: true, data: response.data };
    }
  } catch (error) {
    console.log('Validation error details:', error);

    if (error.response) {
      // Nếu server trả về thông báo lỗi cụ thể
      const errorData = error.response.data;

      if (typeof errorData === 'string') {
        throw new Error(errorData);
      } else if (errorData && typeof errorData === 'object') {
        // Nếu là object lỗi, có thể chứa nhiều thông báo lỗi
        if (errorData.message) {
          throw new Error(errorData.message);
        } else if (errorData.error) {
          throw new Error(errorData.error);
        } else if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          // Nếu là mảng các lỗi validation
          throw new Error(errorData.errors[0].description || 'Thông tin đăng ký không hợp lệ');
        } else {
          throw new Error('Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại.');
        }
      }
    } else if (error.request) {
      // Lỗi kết nối đến server
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
    }

    // Các lỗi khác
    throw new Error(error.message || 'Kiểm tra thông tin đăng ký thất bại. Vui lòng thử lại sau.');
  }
};