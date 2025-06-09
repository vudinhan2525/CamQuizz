import { StyleSheet, Text, View, TouchableOpacity, FlatList, Modal, Image, AppState } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constant/colors';
import QRCode from 'react-native-qrcode-svg';
import PackageService from '../../../services/PackageService'
import AsyncStorageService from '../../../services/AsyncStorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import * as Linking from 'expo-linking';
const UserPackage = ({ navigation }) => {
  const [currentQuota, setCurrentQuota] = useState(null);
  const [packages, setPackages] = useState();
  const [paymentRequestId, setPaymentRequestId] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    const fetchAllPackages = async () => {
      try {
        const packagess = await PackageService.getAllPackages();
        setPackages(packagess);
      } catch (error) {
        console.error('Error fetching packages:', error);
      }
    };
    const fetchCurrentQuota = async () => {
      try {
        const userId = await AsyncStorageService.getUserId();
        const quota = await PackageService.getCurrentQuota(userId);
        setCurrentQuota(quota);
      } catch (error) {
        console.error('Error fetching current quota:', error);
      }
    };
    fetchCurrentQuota();
    fetchAllPackages();
  }, []);

  // Payment status checking
  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (nextAppState === 'active' && paymentRequestId && !isProcessingPayment) {
        setIsProcessingPayment(true);
        // const userId = await AsyncStorageService.getUserId();
        // const updatedQuota = await PackageService.getCurrentQuota(userId);
        // setCurrentQuota(updatedQuota);
        setIsProcessingPayment(false);
        setPaymentRequestId(null);
        
      }
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [paymentRequestId, isProcessingPayment]);
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      const data = Linking.parse(url);
      if (data.path === 'payment-result') {
        (async () => {
          try {
            setIsProcessingPayment(true);
            const userId = await AsyncStorageService.getUserId();
            const updatedQuota = await PackageService.getCurrentQuota(userId);
            setCurrentQuota(updatedQuota);
            Toast.show({
              type: 'success',
              text1: `Thanh toán thành công lúc ${new Date(new Date(updatedQuota.updated_at).getTime() + 7 * 60 * 60 * 1000).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              })}`,
              text2: 'Đã cập nhật số lượng quiz',
            });
            
          } catch (error) {
            console.error('Error updating quota after payment redirect:', error);
            Toast.show({
              type: 'error',
              text1: 'Cập nhật quota thất bại',
              text2: 'Xin hãy thử lại.',
            });
          } finally {
            setIsProcessingPayment(false);
            setPaymentRequestId(null);
          }
        })();
      }
    });

    return () => subscription.remove();
  }, []);

  const handlePackagePress = async (pkg) => {
    try {
      setSelectedPackage(pkg);
      const userId = await AsyncStorageService.getUserId();
      const paymentData = await PackageService.getMomoPaymentUrl(pkg.id, userId);
      if (paymentData?.payUrl) {
        setPaymentRequestId(paymentData.requestId);
        await Linking.openURL(paymentData.payUrl);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không thể tạo liên kết thanh toán',
          position: 'top',
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      console.error('Error handling package selection:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể xử lý yêu cầu thanh toán',
        position: 'top',
        visibilityTime: 3000,
      });
    }
  };

  const renderPackageItem = ({ item }) => {
    return (
      <View style={styles.packageCard}>
        <Text style={styles.packageName}>{item?.name}</Text>
        <View style={styles.packageDetails}>
          <Text style={styles.detailText}>Bài kiểm tra công khai: {item?.max_number_of_quizz}</Text>
          <Text style={styles.detailText}>Người tham gia: {item?.max_number_of_attended}</Text>
          <Text style={styles.priceText}>
            {item.price === 0 ? 'Miễn phí' : `${item?.price.toLocaleString()}đ`}
          </Text>
        </View>
        {
          item.price !== 0 &&
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => handlePackagePress(item)}
          >
            <Text style={styles.upgradeButtonText}>Mua gói</Text>
          </TouchableOpacity>
        }
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Gói dịch vụ</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={COLORS.BLUE} />
        </TouchableOpacity>
      </View>

      {/* Current Quota Info */}
      <View style={styles.currentPackageContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quota hiện tại của bạn</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={async () => {
              try {
                const userId = await AsyncStorageService.getUserId();
                const quota = await PackageService.getCurrentQuota(userId);
                setCurrentQuota(quota);
                Toast.show({
                  type: 'success',
                  text1: `Thanh toán lần gấn nhất lúc ${new Date(new Date(updatedQuota.updated_at).getTime() + 7 * 60 * 60 * 1000).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`,
                  position: 'top',
                  visibilityTime: 2000,
                });
                
              } catch (error) {
                console.error('Error refreshing quota:', error);
                Toast.show({
                  type: 'error',
                  text1: 'Không thể cập nhật quota',
                  position: 'top',
                  visibilityTime: 2000,
                });
              }
            }}
          >
            <Ionicons name="refresh" size={20} color={COLORS.BLUE} />
          </TouchableOpacity>
        </View>
        <View style={styles.currentPackageInfo}>
          {[
            { label: 'Tổng số bài kiểm tra có thể tạo:', value: currentQuota?.total_quizz ?? '-' },
            { label: 'Số bài kiểm tra còn lại:', value: currentQuota?.remaining_quizz ?? '-' },
            { label: 'Số lượng người tham gia tối đa:', value: currentQuota?.total_participants ?? '-' },
          ].map((item, idx) => (
            <Text key={idx} style={styles.currentPackageDetail}>
              {item.label} {item.value}
            </Text>
          ))}
        </View>
      </View>

      {/* Available Packages */}
      <View style={styles.availablePackagesContainer}>
        <Text style={styles.sectionTitle}>Các gói dịch vụ</Text>
        <FlatList
          data={packages}
          renderItem={renderPackageItem}
          keyExtractor={item => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.packagesList}
        />
      </View>
    </View>
  );
};

export default UserPackage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.BLUE,
  },
  closeButton: {
    padding: 8,
  },
  currentPackageContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  refreshButton: {
    padding: 8,
  },
  currentPackageInfo: {
    backgroundColor: COLORS.BLUE,
    padding: 16,
    borderRadius: 12,
  },
  currentPackageDetail: {
    fontSize: 16,
    color: COLORS.WHITE,
    marginBottom: 4,
  },
  availablePackagesContainer: {
    flex: 1,
    padding: 16,
  },
  packagesList: {
    paddingHorizontal: 8,
  },
  packageCard: {
    width: 250,
    padding: 16,
    marginHorizontal: 8,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    elevation: 4,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  packageName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  packageDetails: {
    gap: 4,
    flex: 1
  },
  detailText: {
    fontSize: 14,
    color: COLORS.GRAY,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    color: COLORS.BLUE,
  },
  upgradeButton: {
    backgroundColor: COLORS.BLUE,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
});
