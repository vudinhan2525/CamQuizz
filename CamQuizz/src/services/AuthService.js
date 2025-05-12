import AsyncStorage from '@react-native-async-storage/async-storage';

// Dữ liệu người dùng mẫu
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
    roles: ['Student'],
    token: 'user-mock-token-67890'
  }
];

// Giả lập API đăng nhập
export const login = async (email, password) => {
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
  
  await AsyncStorage.setItem('userToken', user.token);
  await AsyncStorage.setItem('userData', JSON.stringify(userData));
  
  return userData;
};

// Giả lập API đăng ký
export const signup = async (userData) => {
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
};

// Kiểm tra trạng thái đăng nhập
export const checkAuthStatus = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const userDataString = await AsyncStorage.getItem('userData');
    
    if (token && userDataString) {
      return JSON.parse(userDataString);
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