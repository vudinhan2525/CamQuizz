import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constant/colors';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 0.8) => `rgba(20, 50, 247, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 3.7,       
  decimalPlaces: 0,         
  useShadowColorFromDataset: false, 
};


const OrganizationTestReport = ({ tests, onGoBack }) => {
  const [selectedTest, setSelectedTest] = useState(tests.length > 0 ? tests[0] : null);

  if (tests.length === 0) {
    return <Text style={{ textAlign: 'center', padding: 16 }}>No organization tests found.</Text>;
  }

  const totalTests = tests.length;
  const totalParticipants = tests.reduce((acc, test) => acc + test.results.length, 0);

  const generateTestAttemptStats = () => {
    return tests.map(test => ({
      name: test.title,
      attempts: test.attempts,
    }));
  };

  const generateTestScoreStats = () => {
    return tests.map(test => {
      const avgScore = test.results.length > 0
        ? test.results.reduce((sum, result) =>
            sum + (result.score / result.totalQuestions) * 100, 0
          ) / test.results.length
        : 0;
      return {
        name: test.title,
        avgScore: Math.round(avgScore),
      };
    });
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 80}}>
      <TouchableOpacity style={styles.backButton} onPress={() => onGoBack && onGoBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.BLUE} />
          <Text style={styles.backText}>Trở về</Text>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 16 }}>
        <View style={styles.summaryBox}>
          <Ionicons name="bar-chart-outline" size={20} color={COLORS.BLUE}  />
          <Text style={styles.summaryTitle}>Số lần thi</Text>
          <Text style={styles.summaryValue}>{totalTests}</Text>
        </View>

        <View style={styles.summaryBox}>
          <Ionicons name="people-outline" size={20} color={COLORS.BLUE} />
          <Text style={styles.summaryTitle}>Số người tham gia</Text>
          <Text style={styles.summaryValue}>{totalParticipants}</Text>
        </View>
      </View>

      <View style={{ margin: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>Số lượt làm bài</Text>
      <BarChart
        data={{
          labels: generateTestAttemptStats().map(item => "Số lượt làm bài"),
          datasets: [{ data: generateTestAttemptStats().map(item => item.attempts) }],
        }}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        verticalLabelRotation={0}     
        fromZero={true}               
        yAxisSuffix=""                
        yAxisLabel=""                 
        showValuesOnTopOfBars={true}  
        withInnerLines={true}         
        flatColor={true}              
      />
    </View>



      <View style={{ margin: 16 }}>
        <Text style={{ fontSize: 18, marginBottom: 8 }}>Điểm trung bình</Text>
        <BarChart
          data={{
            labels: generateTestScoreStats().map(item => "Điểm trung bình"),
            datasets: [{ data: generateTestScoreStats().map(item => item.avgScore) }],
          }}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          verticalLabelRotation={0}
          fromZero={true}               
          yAxisSuffix=""                
          yAxisLabel=""                 
          showValuesOnTopOfBars={true}  
          withInnerLines={true}         
          flatColor={true}              
        />
      </View>
    </ScrollView>
  );
};

// Styles cho phần tổng hợp

const styles = StyleSheet.create({
  summaryBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    margin: 8,
    width: '45%',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.BLUE,
  },
  summaryTitle: {
    fontSize: 13,
    color: '#555',
    marginTop: 8,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    flexDirection: 'row',
    marginBottom: 20
  },
  backText: {
    marginLeft: 8,        
    fontSize: 16,         
    
  },
});


export default OrganizationTestReport;
