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
      const loginData = {
        "email": email.trim().toLowerCase(),
        "password": password
      };

      console.log('Sending login data:', JSON.stringify(loginData, null, 2));

      // Log the full URL for debugging
      const loginUrl = `${apiClient.defaults.baseURL}/auth/login`;
      console.log('Login URL:', loginUrl);

      try {
        // Use axios instead of fetch for better error handling
        const response = await apiClient.post('/auth/login', loginData);

        console.log('Login response status:', response.status);
        console.log('Login response data:', response.data);

        // Process the response data
        if (typeof response.data === 'string') {
          console.error('API returned string instead of user data:', response.data);
          throw new Error(response.data || 'Đăng nhập thất bại');
        }

        if (!response.data || typeof response.data !== 'object') {
          console.error('API returned invalid data format:', response.data);
          throw new Error('Định dạng dữ liệu không hợp lệ từ máy chủ');
        }

        const userData = response.data;

        // Process roles
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

        // Lấy thông tin chi tiết người dùng mới nhất từ máy chủ nếu có ID
        if (userData.id) {
          try {
            console.log('Fetching latest user data from server...');
            const userDetailResponse = await apiClient.get(`/auth/${userData.id}`);

            if (userDetailResponse.data) {
              console.log('Got latest user details:', userDetailResponse.data);

              // Cập nhật thông tin người dùng với dữ liệu mới nhất từ máy chủ
              // nhưng giữ lại token và roles từ phản hồi đăng nhập
              const token = userData.token;
              const roles = userData.roles;

              // Merge dữ liệu
              Object.assign(userData, userDetailResponse.data);

              // Đảm bảo giữ lại token và roles
              userData.token = token;
              userData.roles = roles;
            }
          } catch (detailError) {
            // Chỉ log lỗi, không dừng quá trình đăng nhập
            console.error('Failed to fetch latest user details:', detailError);
          }
        }

        // Sau khi đăng nhập thành công
        if (userData.token) {
          console.log('Token length:', userData.token.length);
          console.log('Token first 20 chars:', userData.token.substring(0, 20));

          // Đảm bảo token không có khoảng trắng ở đầu hoặc cuối
          const cleanToken = userData.token.trim();

          // Lưu token vào AsyncStorage
          await AsyncStorage.setItem('userToken', cleanToken);

          // Lưu userData bao gồm cả token
          const userDataToStore = { ...userData, token: cleanToken };
          await AsyncStorage.setItem('userData', JSON.stringify(userDataToStore));

          console.log('Token saved to AsyncStorage');
          console.log('User data with token saved to AsyncStorage');
        }

        return userData;
      } catch (axiosError) {
        console.error('Axios error:', axiosError);

        // Handle axios error response
        if (axiosError.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log('Error response status:', axiosError.response.status);
          console.log('Error response data:', axiosError.response.data);

          const errorMessage =
            typeof axiosError.response.data === 'string'
              ? axiosError.response.data
              : axiosError.response.data?.message || 'Đăng nhập thất bại';

          throw new Error(errorMessage);
        } else if (axiosError.request) {
          // The request was made but no response was received
          console.log('No response received:', axiosError.request);
          throw new Error('Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng.');
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error setting up request:', axiosError.message);
          throw new Error(`Lỗi kết nối: ${axiosError.message}`);
        }
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

        // Use axios instead of fetch
        const response = await apiClient.post('/auth/validate-signup', validateData);

        console.log('Validate response status:', response.status);
        console.log('Validate response data:', response.data);

        return { isValid: true, data: response.data };
      } catch (axiosError) {
        console.error('API validation error:', axiosError);

        if (axiosError.response) {
          const responseData = axiosError.response.data;

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
        } else if (axiosError.request) {
          throw new Error('Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng.');
        } else {
          throw new Error(`Lỗi kết nối: ${axiosError.message}`);
        }
      }
    }
  } catch (error) {
    console.log('Validation error details:', error);
    throw error;
  }
};

// Kiểm tra token có hợp lệ không
export const validateToken = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const userDataString = await AsyncStorage.getItem('userData');

    console.log('Validating token...');
    console.log('Token exists:', !!token);
    console.log('UserData exists:', !!userDataString);

    if (!token || !userDataString) {
      console.log('No token or user data found');
      return false;
    }

    // Parse user data to check stored token
    const userData = JSON.parse(userDataString);
    if (userData.token !== token) {
      console.log('Token mismatch between storage and user data');
      // Fix the mismatch by updating userData
      userData.token = token;
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
    }

    // Thực hiện một request đơn giản để kiểm tra token với server
    try {
      console.log('Making validation request to server...');
      const response = await apiClient.get('/auth/debug-token', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const isValid = response.status === 200;
      console.log('Token validation result:', isValid);

      if (!isValid) {
        // If token is invalid, clear both token and user data
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        console.log('Invalid token cleared from storage');
      }

      return isValid;
    } catch (error) {
      console.error('Token validation request failed:', error.message);
      if (error.response?.status === 401) {
        // Clear invalid token
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        console.log('Invalid token cleared from storage');
      }
      return false;
    }
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

// Kiểm tra trạng thái đăng nhập
export const checkAuthStatus = async () => {
  try {
    console.log('Checking auth status...');
    const token = await AsyncStorage.getItem('userToken');
    const userDataString = await AsyncStorage.getItem('userData');

    console.log('Token exists:', !!token);
    console.log('UserData exists:', !!userDataString);

    // Kiểm tra cả token và userData có tồn tại không
    if (token && userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        console.log('Raw user data from storage:', userData);

        // Validate token with server
        const isTokenValid = await validateToken();
        if (!isTokenValid) {
          console.log('Token validation failed, clearing auth data');
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userData');
          return null;
        }

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

        console.log('Processed user data from storage:', userData);
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
        // Use axios instead of fetch
        const response = await apiClient.post('/auth/signup', registerData);

        console.log('Signup response status:', response.status);
        console.log('Signup response data:', response.data);

        return {
          success: true,
          message: 'Đăng ký thành công',
          user: response.data
        };
      } catch (axiosError) {
        console.error('Signup error:', axiosError);

        if (axiosError.response) {
          const responseData = axiosError.response.data;
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
        } else if (axiosError.request) {
          throw new Error('Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng.');
        } else {
          throw new Error(`Lỗi kết nối: ${axiosError.message}`);
        }
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
    // Lấy thông tin người dùng hiện tại trước khi đăng xuất
    const userDataString = await AsyncStorage.getItem('userData');
    const token = await AsyncStorage.getItem('userToken');

    if (userDataString && token) {
      try {
        // Parse dữ liệu người dùng
        const userData = JSON.parse(userDataString);

        // Kiểm tra xem có ID người dùng không
        if (userData.id) {
          console.log('Syncing user data with server before logout...');

          // Tạo dữ liệu cập nhật từ thông tin người dùng hiện tại
          const syncData = {
            "first_name": userData.first_name,
            "last_name": userData.last_name,
            "gender": userData.gender,
            "date_of_birth": userData.date_of_birth || userData.dateOfBirth
          };

          // Gọi API để đồng bộ dữ liệu
          try {
            await apiClient.put(`/auth/${userData.id}`, syncData);
            console.log('User data synced successfully with server');
          } catch (syncError) {
            // Chỉ log lỗi, không dừng quá trình đăng xuất
            console.error('Failed to sync user data with server:', syncError);
          }
        }
      } catch (parseError) {
        console.error('Error parsing user data before logout:', parseError);
      }
    }

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
      console.log('🔄 Using mock data for user profile update due to server API issues');
      console.log('📝 Update data received:', updateData);

      // Giả lập độ trễ mạng
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Lấy thông tin người dùng hiện tại từ AsyncStorage
      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      const userData = JSON.parse(userDataString);

      // Cập nhật thông tin với tất cả các format có thể
      const updatedUserData = {
        ...userData,
        // Xử lý FirstName/firstName
        first_name: updateData.FirstName || updateData.firstName || userData.first_name,
        // Xử lý LastName/lastName
        last_name: updateData.LastName || updateData.lastName || userData.last_name,
        // Xử lý Gender/gender
        gender: updateData.Gender || updateData.gender || userData.gender,
        // Xử lý DateOfBirth/dateOfBirth
        date_of_birth: updateData.DateOfBirth || updateData.dateOfBirth || userData.date_of_birth
      };

      // Cũng cập nhật dateOfBirth cho compatibility
      if (updateData.DateOfBirth || updateData.dateOfBirth) {
        updatedUserData.dateOfBirth = updateData.DateOfBirth || updateData.dateOfBirth;
      }

      // Lưu lại thông tin đã cập nhật
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));

      console.log('✅ Mock update completed successfully');
      console.log('💾 Updated user data:', updatedUserData);

      return {
        success: true,
        message: 'Cập nhật thông tin thành công (Mock Mode)',
        data: updatedUserData
      };
    } else {
      // Gọi API cập nhật thông tin người dùng
      console.log('Calling API to update user profile:', userId, updateData);

      // Initialize response variable
      let apiResponse = null;

      try {
        // Lấy thông tin user hiện tại để gửi đầy đủ
        const userDataString = await AsyncStorage.getItem('userData');
        const currentUserData = userDataString ? JSON.parse(userDataString) : {};

        // Server API mong đợi PascalCase và có thể cần tất cả các field
        const apiUpdateData = {
          FirstName: updateData.FirstName || updateData.firstName || currentUserData.first_name,
          LastName: updateData.LastName || updateData.lastName || currentUserData.last_name,
          Gender: updateData.Gender || updateData.gender || currentUserData.gender
        };

        // Xử lý DateOfBirth
        if (updateData.DateOfBirth || updateData.dateOfBirth) {
          const dateValue = updateData.DateOfBirth || updateData.dateOfBirth;
          console.log('Processing date value:', dateValue, 'Type:', typeof dateValue);

          // Đảm bảo format ngày đúng cho DateOnly (.NET)
          if (typeof dateValue === 'string') {
            // Nếu đã là string format YYYY-MM-DD thì giữ nguyên
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
              apiUpdateData.DateOfBirth = dateValue;
              console.log('Using date as-is:', dateValue);
            } else {
              // Nếu là format khác, chuyển đổi
              const date = new Date(dateValue);
              if (!isNaN(date.getTime())) {
                // Sử dụng UTC để tránh timezone issues
                const year = date.getUTCFullYear();
                const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                const day = String(date.getUTCDate()).padStart(2, '0');
                apiUpdateData.DateOfBirth = `${year}-${month}-${day}`;
                console.log('Converted date to:', apiUpdateData.DateOfBirth);
              }
            }
          } else if (dateValue instanceof Date) {
            // Nếu là Date object, chuyển thành YYYY-MM-DD
            const year = dateValue.getUTCFullYear();
            const month = String(dateValue.getUTCMonth() + 1).padStart(2, '0');
            const day = String(dateValue.getUTCDate()).padStart(2, '0');
            apiUpdateData.DateOfBirth = `${year}-${month}-${day}`;
            console.log('Converted Date object to:', apiUpdateData.DateOfBirth);
          }
        } else if (currentUserData.date_of_birth) {
          // Nếu không update DateOfBirth nhưng có giá trị hiện tại, giữ nguyên
          apiUpdateData.DateOfBirth = currentUserData.date_of_birth;
        }

        console.log('API URL:', `${apiClient.defaults.baseURL}/auth/${userId}`);
        console.log('Final API update data:', JSON.stringify(apiUpdateData, null, 2));

        // Kiểm tra nếu không có dữ liệu nào để cập nhật
        if (Object.keys(apiUpdateData).length === 0) {
          console.log('No data to update, skipping API call');
          return {
            success: true,
            message: 'Không có thay đổi nào để cập nhật',
            data: { message: 'No changes to update' }
          };
        }

        // Thử gửi với headers khác để debug
        const response = await apiClient.put(`/auth/${userId}`, apiUpdateData, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        console.log('API response status:', response.status);
        console.log('API response data:', response.data);

        // Store response data for later use
        apiResponse = {
          status: response.status,
          data: response.data
        };
      } catch (axiosError) {
        console.error('API update error:', axiosError);

        // Continue with local storage update even if API fails
        if (axiosError.response) {
          console.log('Error response status:', axiosError.response.status);
          console.log('Error response data:', axiosError.response.data);
        } else if (axiosError.request) {
          console.log('No response received:', axiosError.request);
        } else {
          console.log('Error setting up request:', axiosError.message);
        }
      }

      // Cập nhật thông tin trong AsyncStorage
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);

        // Create updated user data object
        const updatedUserData = {
          ...userData,
          first_name: updateData.FirstName || userData.first_name,
          last_name: updateData.LastName || userData.last_name,
          gender: updateData.Gender || userData.gender,
          date_of_birth: updateData.DateOfBirth || userData.date_of_birth
        };

        // Also set dateOfBirth for compatibility
        if (updateData.DateOfBirth) {
          updatedUserData.dateOfBirth = updateData.DateOfBirth;
        }

        console.log('Updating AsyncStorage with:', updatedUserData);

        // Nếu API đã thành công, lấy thông tin mới nhất từ máy chủ
        if (apiResponse && apiResponse.status >= 200 && apiResponse.status < 300) {
          try {
            console.log('Fetching latest user data after update...');
            const refreshResponse = await apiClient.get(`/auth/${userId}`);

            if (refreshResponse.data) {
              console.log('Got latest user details after update:', refreshResponse.data);

              // Giữ lại token và roles từ dữ liệu hiện tại
              const token = updatedUserData.token;
              const roles = updatedUserData.roles;

              // Cập nhật dữ liệu từ máy chủ
              Object.assign(updatedUserData, refreshResponse.data);

              // Đảm bảo giữ lại token và roles
              updatedUserData.token = token;
              updatedUserData.roles = roles;
            }
          } catch (refreshError) {
            console.error('Failed to fetch latest user data after update:', refreshError);
            // Tiếp tục với dữ liệu đã cập nhật cục bộ
          }
        }

        // Save to AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));

        // Verify the data was saved correctly
        const verifyData = await AsyncStorage.getItem('userData');
        console.log('Verification - data in AsyncStorage after update:', verifyData);
      }

      return {
        success: true,
        message: 'Cập nhật thông tin thành công',
        data: apiResponse?.data || { message: 'Đã cập nhật thông tin trong bộ nhớ cục bộ' }
      };
    }
  } catch (error) {
    console.log('Update profile error details:', error);
    throw error;
  }
};

// Thêm hàm này để kiểm tra định dạng token
export const checkTokenFormat = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return false;

    console.log('Token format check:');
    console.log('- Length:', token.length);
    console.log('- First 20 chars:', token.substring(0, 20));
    console.log('- Contains whitespace:', /\s/.test(token));

    // Đảm bảo token không có khoảng trắng
    if (/\s/.test(token)) {
      const cleanToken = token.trim();
      await AsyncStorage.setItem('userToken', cleanToken);
      console.log('Token cleaned and saved');
    }

    return true;
  } catch (error) {
    console.error('Error checking token format:', error);
    return false;
  }
};

// Hàm làm mới token
export const refreshToken = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    if (!userData) return false;

    const user = JSON.parse(userData);

    // Gọi API để làm mới token
    const response = await apiClient.post('/auth/refresh-token', {
      email: user.email,
      refreshToken: user.refreshToken // Nếu có
    });

    if (response.data && response.data.token) {
      await AsyncStorage.setItem('userToken', response.data.token);

      // Cập nhật userData với token mới
      const updatedUserData = { ...user, token: response.data.token };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));

      console.log('Token refreshed successfully');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};


