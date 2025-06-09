import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../../constant/colors';
import { Ionicons } from 'react-native-vector-icons';
import { login } from '../../services/AuthService';

export const Login = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      // Gọi API đăng nhập
      const userData = await login(email, password);

      // Điều hướng đến màn hình chính dựa trên vai trò
      navigation.reset({
        index: 0,
        routes: [{ name: 'Root' }], // Điều hướng đến Root navigator
      });
    } catch (error) {
      // Xử lý lỗi và hiển thị thông báo thân thiện
      let errorMessage = 'Có lỗi xảy ra khi đăng nhập';

      if (error.message) {
        // Kiểm tra các loại lỗi phổ biến và hiển thị thông báo phù hợp
        if (error.message.includes('User with this email does not exist') ||
            error.message.includes('Email hoặc mật khẩu không đúng')) {
          errorMessage = 'Email hoặc mật khẩu không đúng';
        } else if (error.message.includes('Invalid password')) {
          errorMessage = 'Mật khẩu không đúng';
        } else if (error.message.includes('kết nối') || error.message.includes('network')) {
          errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet';
        } else if (error.message.includes('máy chủ') || error.message.includes('server')) {
          errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau';
        } else {
          // Chỉ hiển thị thông báo lỗi đơn giản, không hiển thị chi tiết kỹ thuật
          errorMessage = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin';
        }
      }

      Alert.alert('Đăng nhập thất bại', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/logo.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Đăng nhập</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={COLORS.GRAY} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.GRAY} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={COLORS.GRAY} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.WHITE} />
          ) : (
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          )}
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signupLink}>Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 150,
    height: 150,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.BLUE,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: COLORS.BLACK,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: COLORS.WHITE,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: COLORS.BLACK,
  },
  eyeIcon: {
    padding: 10,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: COLORS.BLUE,
  },
  loginButton: {
    backgroundColor: COLORS.BLUE,
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  signupText: {
    color: COLORS.GRAY,
  },
  signupLink: {
    color: COLORS.BLUE,
    fontWeight: 'bold',
  },
  testAccountsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
  },
  testAccountsTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  testAccount: {
    fontSize: 12,
    color: COLORS.DARK_GRAY,
    marginBottom: 3,
  },
});
