import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  ActivityIndicator, 
  Dimensions,
  TouchableOpacity 
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import PackageService from '../../../services/PackageService';
import COLORS from '../../../constant/colors';

const Revenue = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const screenWidth = Dimensions.get('window').width;

  // Generate years for selector (e.g., last 5 years)
  const years = Array.from(
    {length: 5}, 
    (_, i) => new Date().getFullYear() - i
  );

  useEffect(() => {
    fetchRevenueStats();
  }, [selectedYear]); // Add selectedYear as dependency

  const fetchRevenueStats = async () => {
    try {
      const data = await PackageService.getStatistics(selectedYear);
      setStats(data);
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.BLUE} />
      </View>
    );
  }

  const monthlyData = {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    datasets: [{
      data: stats?.monthly_revenue?.map(item => item.revenue) || Array(12).fill(0)
    }]
  };

  const packageData = {
    labels: stats?.package_sales?.map(item => item.package_name) || [],
    datasets: [{
      data: stats?.package_sales?.map(item => item.sold_count) || []
    }]
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.BLUE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Báo cáo</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView>
        <View style={styles.yearSelectorContainer}>
          <Text style={styles.yearLabel}>Năm:</Text>
          <View style={styles.yearPickerContainer}>
            <TouchableOpacity 
              style={styles.yearArrowButton}
              onPress={() => setSelectedYear(prev => Math.min(prev + 1, new Date().getFullYear()))}
            >
              <Ionicons name="chevron-up" size={20} color={COLORS.BLUE} />
            </TouchableOpacity>
            
            <Text style={styles.selectedYear}>{selectedYear}</Text>
            
            <TouchableOpacity 
              style={styles.yearArrowButton}
              onPress={() => setSelectedYear(prev => prev - 1)}
            >
              <Ionicons name="chevron-down" size={20} color={COLORS.BLUE} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Tổng doanh thu</Text>
            <Text style={styles.statValue}>
              {stats?.total_revenue?.toLocaleString('vi-VN')} VNĐ
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Tổng gói đã bán</Text>
            <Text style={styles.statValue}>{stats?.total_sold_packages || 0}</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Doanh thu theo tháng</Text>
          <LineChart
            data={monthlyData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: COLORS.WHITE,
              backgroundGradientFrom: COLORS.WHITE,
              backgroundGradientTo: COLORS.WHITE,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              style: {
                borderRadius: 16
              }
            }}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Số lượng bán theo gói</Text>
          <BarChart
            data={packageData}
            width={screenWidth - 40}
            height={260}
            chartConfig={{
              backgroundColor: COLORS.WHITE,
              backgroundGradientFrom: COLORS.WHITE,
              backgroundGradientTo: COLORS.WHITE,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              style: {
                borderRadius: 16
              }
            }}
            style={styles.chart}
            verticalLabelRotation={30}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.BLUE,
  },
  headerRight: {
    width: 40, // To balance the header layout
  },
  yearSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  yearLabel: {
    fontSize: 16,
    color: COLORS.BLUE,
  },
  yearPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yearArrowButton: {
    padding: 8,
  },
  selectedYear: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.BLUE,
    marginHorizontal: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    elevation: 3,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLUE,
  },
  chartContainer: {
    padding: 20,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  chart: {
    borderRadius: 16,
    elevation: 3,
    backgroundColor: COLORS.WHITE,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default Revenue;