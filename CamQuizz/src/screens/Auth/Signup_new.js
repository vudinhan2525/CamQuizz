import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../../constant/colors';
import { Ionicons } from 'react-native-vector-icons';
import { signup, validateSignup } from '../../services/AuthService';

export const Signup = () => {
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    // Kiểm tra dữ liệu đầu vào
    if (!firstName || !lastName || !email || !password || !confirmPassword || !gender) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    const userData = {
      firstName,
      lastName,
      email,
      password,
      gender,
      role: 'Student' // Mặc định là học sinh
    };

    setLoading(true);
    try {
      // Bước 1: Kiểm tra thông tin đăng ký hợp lệ
      try {
        await validateSignup(userData);
      } catch (validationError) {
        console.error('Validation error:', validationError);
        Alert.alert(
          'Thông tin không hợp lệ',
          validationError.message || 'Thông tin đăng ký không hợp lệ'
        );
        setLoading(false);
        return;
      }

      // Bước 2: Gọi API đăng ký
      try {
        const result = await signup(userData);
        console.log('Signup result:', result);

        Alert.alert(
          'Đăng ký thành công',
          'Vui lòng đăng nhập để tiếp tục',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } catch (signupError) {
        console.error('Signup API error:', signupError);
        throw signupError; 
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert(
        'Đăng ký thất bại',
        error.message || 'Có lỗi xảy ra khi đăng ký'
      );
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
          <Text style={styles.appName}>CamQuizz</Text>
        </View>

        <Text style={styles.title}>Đăng ký</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color={COLORS.GRAY} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Họ"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color={COLORS.GRAY} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Tên"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

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
          <Ionicons name="male-female-outline" size={20} color={COLORS.GRAY} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Giới tính (Nam/Nữ)"
            value={gender}
            onChangeText={setGender}
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

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.GRAY} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
          />
        </View>

        <TouchableOpacity
          style={styles.signupButton}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.WHITE} />
          ) : (
            <Text style={styles.signupButtonText}>Đăng ký</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Đăng nhập</Text>
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
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.BLUE,
    marginTop: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
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
  signupButton: {
    backgroundColor: COLORS.BLUE,
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  signupButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginText: {
    color: COLORS.GRAY,
  },
  loginLink: {
    color: COLORS.BLUE,
    fontWeight: 'bold',
  },
});
