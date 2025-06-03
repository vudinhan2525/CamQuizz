import { StyleSheet, Text, View, TouchableOpacity, FlatList, Modal, Image, Linking, AppState } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constant/colors';
import QRCode from 'react-native-qrcode-svg';
import PackageService from '../../../services/PackageService'
import AsyncStorageService from '../../../services/AsyncStorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const mockLitmit = {
  usedQuiz: 4,
}
const defaultPackage = {
  id: -1,
  name: 'Mặc định',
  max_number_of_quizz: 2,
  max_number_of_attended: 10,
  price: 0,
  current: true,
}
const UserPackage = ({ navigation }) => {
  const [selectedPackage, setSelectedPackage] = useState();
  const [currentPackage, setCurrentPackage] = useState();
  const [currentLitmit, setCurrentLitmit] = useState(mockLitmit);
  const [packages, setPackages] = useState();
  const [paymentRequestId, setPaymentRequestId] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [oldPackage, setOldPackage] = useState(null);
  React.useEffect(() => {
    console.log('UserPackage mounted');
    const fetchAllPackages = async () => {
      try {
        const packagess = await PackageService.getAllPackages();
        console.log('Fetched packages:', packagess);
        setPackages([
          defaultPackage,
          ...packagess,
        ]);

      } catch (error) {
        console.error('Error fetching packages:', error);
      }
    };
    const fetchCurrentPackage = async () => {
      try {
        const userId = await AsyncStorageService.getUserId();
        const currentPackage = await PackageService.getCurrentPackage(userId);
        setCurrentPackage(currentPackage || defaultPackage);
        setOldPackage(currentPackage || defaultPackage);
      }
      catch (error) {
        console.error('Error fetching current package:', error);
      }
    };
    fetchCurrentPackage();
    fetchAllPackages();
  }, []);
  React.useEffect(() => {
    if (packages && currentPackage) {
      const currentPkg = packages.find(pkg => pkg.id === currentPackage.id);
      if (currentPkg) {
        setCurrentPackage(currentPkg);
        setCurrentLitmit({
          usedQuiz: currentPackage.usedQuiz || 0,
        })
      }
    }
  }, [packages, currentPackage]);

  // Add payment status checking
  useEffect(() => {
    let paymentCheckInterval;

    const handleAppStateChange = async (nextAppState) => {
      if (nextAppState === 'active' && paymentRequestId && !isProcessingPayment) {
        setIsProcessingPayment(true);

        // Gọi lại getCurrentPackage
        const userId = await AsyncStorageService.getUserId();
        const updatedPackage = await PackageService.getCurrentPackage(userId)|| oldPackage;

        const isUpgraded = updatedPackage?.id === selectedPackage?.id;

        if (isUpgraded) {
          Toast.show({
            type: 'success',
            text1: 'Thanh toán thành công',
            text2: 'Gói dịch vụ đã được nâng cấp',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Thanh toán chưa hoàn tất',
            text2: 'Vui lòng kiểm tra lại hoặc thử lại sau',
          });
        }

        setCurrentPackage(updatedPackage);
        setCurrentLitmit({
          usedQuiz: updatedPackage?.usedQuiz || 0,
        });

        setIsProcessingPayment(false);
        setModalVisible(false);
        setPaymentRequestId(null);
      }
    };


    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
      if (paymentCheckInterval) {
        clearInterval(paymentCheckInterval);
      }
    };
  }, [paymentRequestId, isProcessingPayment]);

  const refreshCurrentPackage = async () => {
    try {
      const userId = await AsyncStorageService.getUserId();
      const updatedPackage = await PackageService.getCurrentPackage(userId);
      setCurrentPackage(updatedPackage || defaultPackage);

      // Update limits
      setCurrentLitmit({
        usedQuiz: updatedPackage?.usedQuiz || 0,
      });
    } catch (error) {
      console.error('Error refreshing package data:', error);
    }
  };

  const handlePackagePress = async (pkg) => {
    try {
      if (pkg.id === currentPackage?.id) {
        Toast.show({
          type: 'info',
          text1: 'Thông báo',
          text2: 'Bạn đang sử dụng gói này',
          position: 'top',
          visibilityTime: 3000,
        });
        return;
      }

      // Prevent downgrade if current package is more expensive
      if (currentPackage?.price > pkg.price) {
        Toast.show({
          type: 'info',
          text1: 'Không thể nâng cấp',
          text2: 'Không thể chuyển sang gói có giá thấp hơn gói hiện tại',
          position: 'top',
          visibilityTime: 3000,
        });
        return;
      }

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
    const isDowngrade = currentPackage?.price > item.price;
    
    return (
      <View style={[
        styles.packageCard, 
        item.id === currentPackage?.id && styles.currentPackageCard
      ]}>
        <Text style={styles.packageName}>{item?.name}</Text>
        <View style={styles.packageDetails}>
          <Text style={styles.detailText}>Bài kiểm tra công khai: {item?.max_number_of_quizz}</Text>
          <Text style={styles.detailText}>Người tham gia: {item?.max_number_of_attended}</Text>
          <Text style={styles.priceText}>
            {item.price === 0 ? 'Miễn phí' : `${item?.price.toLocaleString()}đ`}
          </Text>
        </View>
        {item.id === currentPackage?.id ? (
          <View style={styles.currentBadge}>
            <Text style={styles.currentBadgeText}>Đang sử dụng</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.upgradeButton,
              isDowngrade && styles.disabledButton
            ]}
            onPress={() => handlePackagePress(item)}
            disabled={isDowngrade}
          >
            <Text style={[
              styles.upgradeButtonText,
              isDowngrade && styles.disabledButtonText
            ]}>
              {isDowngrade ? 'Không khả dụng' : 'Nâng cấp'}
            </Text>
          </TouchableOpacity>
        )}
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

      {/* Current Package Info */}
      <View style={styles.currentPackageContainer}>
        <Text style={styles.sectionTitle}>Tình trạng gói hiện tại của bạn</Text>
        <View style={styles.currentPackageInfo}>
          <Text style={styles.currentPackageName}>{currentPackage?.name}</Text>
          <Text style={styles.currentPackageDetail}>
            Bài kiểm tra công khai: {currentLitmit.usedQuiz}/{currentPackage?.max_number_of_quizz}
          </Text>
          <Text style={styles.currentPackageDetail}>
            Số lượng người tham gia tối đa: {currentPackage?.max_number_of_attended}
          </Text>
          <Text style={styles.currentPackagePrice}>
            {currentPackage?.price === 0 ? 'Miễn phí' : `${currentPackage?.price.toLocaleString()}đ`}
          </Text>
        </View>
      </View>

      {/* Available Packages */}
      <View style={styles.availablePackagesContainer}>
        <Text style={styles.sectionTitle}>Gói dịch vụ khác</Text>
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
  currentPackageInfo: {
    backgroundColor: COLORS.BLUE,
    padding: 16,
    borderRadius: 12,
  },
  currentPackageName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: 8,
  },
  currentPackageDetail: {
    fontSize: 16,
    color: COLORS.WHITE,
    marginBottom: 4,
  },
  currentPackagePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginTop: 8,
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
  currentPackageCard: {
    borderWidth: 2,
    borderColor: COLORS.BLUE,

  },
  packageName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  packageDetails: {
    gap: 4,
    flex:1
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
  currentBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.BLUE,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.BLUE,
    marginBottom: 20,
  },
  modalCloseButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: COLORS.BLUE,
    borderRadius: 8,
  },
  modalCloseText: {
    color: COLORS.WHITE,
    fontWeight: '500',
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
  disabledButton: {
    backgroundColor: COLORS.GRAY_LIGHT,
    opacity: 0.7,
  },
  disabledButtonText: {
    color: COLORS.GRAY,
  },
});