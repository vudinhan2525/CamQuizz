import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './ApiClient';


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


const USE_MOCK_DATA = false;

// API đăng nhập
export const login = async (email, password) => {
  try {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user = MOCK_USERS.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!user) {
        throw new Error('Email hoặc mật khẩu không đúng');
      }

      // Lưu thông tin người dùng vào AsyncStorage
      const userData = { ...user };
      delete userData.password;

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
      try {
        const loginData = {
          "email": email.trim().toLowerCase(),
          "password": password
        };

        console.log('Sending login data:', JSON.stringify(loginData, null, 2));

        const response = await fetch(`${apiClient.defaults.baseURL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(loginData)
        });

        console.log('Login response status:', response.status);

        const responseData = await response.json();
        console.log('Login response data:', responseData);

        if (!response.ok) {
          console.error('API returned error status:', response.status);
          if (typeof responseData === 'string') {
            throw new Error(responseData || 'Đăng nhập thất bại');
          } else if (responseData && responseData.message) {
            throw new Error(responseData.message);
          } else {
            throw new Error('Đăng nhập thất bại');
          }
        }

        if (typeof responseData === 'string') {
          console.error('API returned string instead of user data:', responseData);
          throw new Error(responseData || 'Đăng nhập thất bại');
        }

        if (!responseData || typeof responseData !== 'object') {
          console.error('API returned invalid data format:', responseData);
          throw new Error('Định dạng dữ liệu không hợp lệ từ máy chủ');
        }

        const userData = responseData;

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

          // Chỉ lưu token khi nó có giá trị
          if (userData.token) {
            await AsyncStorage.setItem('userToken', userData.token);
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
          } else {
            console.error('Cannot save undefined token to AsyncStorage');
            throw new Error('Đăng nhập thất bại: Token không hợp lệ');
          }

          return userData;
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        throw fetchError;
      }
    }
  } catch (error) {
    console.log('Login error details:', error);
    throw error;
  }
};

// Kiểm tra hợp lệ trước khi đăng ký
export const validateSignup = async (registerData) => {
  try {
    // Kiểm tra dữ liệu đầu vào
    if (!registerData.firstName) {
      throw new Error('Họ không được để trống');
    }
    if (!registerData.lastName) {
      throw new Error('Tên không được để trống');
    }
    if (!registerData.email) {
      throw new Error('Email không được để trống');
    }
    if (!registerData.password) {
      throw new Error('Mật khẩu không được để trống');
    }
    if (!registerData.gender) {
      throw new Error('Giới tính không được để trống');
    }

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
      try {
        const validateData = {
          "first_name": registerData.firstName,
          "last_name": registerData.lastName,
          "email": registerData.email.trim().toLowerCase(),
          "password": registerData.password,
          "gender": registerData.gender,
          "role": registerData.role || "Student"
        };

        console.log('Sending validate data:', JSON.stringify(validateData, null, 2));

        const response = await fetch(`${apiClient.defaults.baseURL}/auth/validate-signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(validateData)
        });

        const responseData = await response.json();
        console.log('Validate response status:', response.status);
        console.log('Validate response data:', responseData);

        if (!response.ok) {
          if (typeof responseData === 'string') {
            throw new Error(responseData);
          } else if (responseData && responseData.message) {
            throw new Error(responseData.message);
          } else if (responseData && responseData.errors) {
            // Xử lý lỗi validation
            const errors = responseData.errors;
            let errorMessages = [];

            // Kiểm tra các trường lỗi phổ biến
            if (errors.first_name) {
              errorMessages.push(errors.first_name[0]);
            }
            if (errors.last_name) {
              errorMessages.push(errors.last_name[0]);
            }
            if (errors.email) {
              errorMessages.push(errors.email[0]);
            }
            if (errors.password) {
              errorMessages.push(errors.password[0]);
            }
            if (errors.gender) {
              errorMessages.push(errors.gender[0]);
            }

            if (errorMessages.length > 0) {
              throw new Error(errorMessages.join(', '));
            } else {
              throw new Error('Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại.');
            }
          } else {
            throw new Error('Kiểm tra thông tin đăng ký thất bại');
          }
        }

        return { isValid: true, data: responseData };
      } catch (apiError) {
        console.error('API validation error:', apiError);
        throw apiError;
      }
    }
  } catch (error) {
    console.log('Validation error details:', error);
    throw error;
  }
};

// Kiểm tra trạng thái đăng nhập
export const checkAuthStatus = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const userDataString = await AsyncStorage.getItem('userData');

    // Kiểm tra cả token và userData có tồn tại không
    if (token && userDataString) {
      try {
        const userData = JSON.parse(userDataString);

        // Đảm bảo token được gán vào userData
        userData.token = token;

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
      } catch (parseError) {
        console.error('Error parsing user data:', parseError);
        // Nếu có lỗi khi parse JSON, xóa dữ liệu không hợp lệ
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error('Error checking auth status:', error);
    return null;
  }
};

// API đăng ký
export const signup = async (userData) => {
  try {
    // Kiểm tra dữ liệu đầu vào
    if (!userData.firstName) {
      throw new Error('Họ không được để trống');
    }
    if (!userData.lastName) {
      throw new Error('Tên không được để trống');
    }
    if (!userData.email) {
      throw new Error('Email không được để trống');
    }
    if (!userData.password) {
      throw new Error('Mật khẩu không được để trống');
    }
    if (!userData.gender) {
      throw new Error('Giới tính không được để trống');
    }

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
        "first_name": userData.firstName,
        "last_name": userData.lastName,
        "email": userData.email.trim().toLowerCase(),
        "password": userData.password,
        "gender": userData.gender,
        "role": userData.role || "Student"
      };

      // Log dữ liệu trước khi gửi để debug
      console.log('Sending signup data to server:', JSON.stringify(registerData, null, 2));

      try {
        const response = await fetch(`${apiClient.defaults.baseURL}/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(registerData)
        });

        const responseData = await response.json();
        console.log('Signup response status:', response.status);
        console.log('Signup response data:', responseData);

        if (response.ok) {
          console.log('Signup API response:', responseData);

          return {
            success: true,
            message: 'Đăng ký thành công',
            user: responseData
          };
        } else {
          // Xử lý lỗi từ server
          console.error('Signup API error response:', responseData);

          if (typeof responseData === 'string') {
            throw new Error(responseData);
          } else if (responseData && responseData.message) {
            throw new Error(responseData.message);
          } else if (responseData && responseData.errors) {
            // Xử lý lỗi validation
            const errors = responseData.errors;
            let errorMessages = [];

            if (errors.first_name) {
              errorMessages.push(errors.first_name[0]);
            }
            if (errors.last_name) {
              errorMessages.push(errors.last_name[0]);
            }
            if (errors.email) {
              errorMessages.push(errors.email[0]);
            }
            if (errors.password) {
              errorMessages.push(errors.password[0]);
            }
            if (errors.gender) {
              errorMessages.push(errors.gender[0]);
            }

            if (errorMessages.length > 0) {
              throw new Error(errorMessages.join(', '));
            } else {
              throw new Error('Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại.');
            }
          } else {
            throw new Error('Đăng ký thất bại. Vui lòng thử lại sau.');
          }
        }
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        throw fetchError;
      }
    }
  } catch (error) {
    console.log('Signup error details:', error);
    throw error;
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

// Cập nhật thông tin người dùng
export const updateUserProfile = async (userId, updateData) => {
  try {
    if (USE_MOCK_DATA) {
      // Giả lập độ trễ mạng
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Lấy thông tin người dùng hiện tại từ AsyncStorage
      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      const userData = JSON.parse(userDataString);

      // Cập nhật thông tin
      const updatedUserData = {
        ...userData,
        first_name: updateData.firstName || userData.first_name,
        last_name: updateData.lastName || userData.last_name,
        gender: updateData.gender || userData.gender,
        dateOfBirth: updateData.dateOfBirth || userData.dateOfBirth
      };

      // Lưu lại thông tin đã cập nhật
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));

      return { success: true, message: 'Cập nhật thông tin thành công' };
    } else {
      // Gọi API cập nhật thông tin người dùng
      const response = await apiClient.put(`/auth/${userId}`, updateData);

      // Cập nhật thông tin trong AsyncStorage
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);

        const updatedUserData = {
          ...userData,
          first_name: updateData.firstName || userData.first_name,
          last_name: updateData.lastName || userData.last_name,
          gender: updateData.gender || userData.gender,
          dateOfBirth: updateData.dateOfBirth || userData.dateOfBirth
        };

        await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
      }

      return { success: true, message: 'Cập nhật thông tin thành công', data: response.data };
    }
  } catch (error) {
    console.log('Update profile error details:', error);
    throw error;
  }
};