import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
const TestCard = ({ test, onViewReport }) => {
  const totalAttempts = test.attempts;
  const totalResults = test.results.length;

  const averageScore =
    test.results.length > 0
      ? Math.round(
          test.results.reduce(
            (sum, result) =>
              sum + (result.score / result.totalQuestions) * 100,
            0
          ) / test.results.length
        )
      : 0;

  const passCount = test.results.filter(
    (result) => (result.score / result.totalQuestions) * 100 >= 70
  ).length;

  const passRate =
    totalResults > 0 ? Math.round((passCount / totalResults) * 100) : 0;

  return (
    <View
      style={{
        margin: 8,
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      }}
    >
      {/* Header */}
      <View style={{ marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Ionicons name="documents-outline" size={20} color="#6b46c1" />
          <Text style={{ fontSize: 18, marginLeft: 8, fontWeight: 'bold' }}>
            {test.title}
          </Text>
        </View>
        <Text style={{ color: '#6b7280' }}>{test.description}</Text>
      </View>

      {/* Nội dung thống kê */}
      <View style={{ marginTop: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="account-multiple-outline" size={16} color="#6b7280" />
            <Text style={{ marginLeft: 4 }}>Số lượt làm bài</Text>
          </View>
          <Text style={{ fontWeight: '600' }}>{totalAttempts}</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="percent-outline" size={16} color="#6b7280" />
            <Text style={{ marginLeft: 4 }}>Điểm trung bình</Text>
          </View>
          <Text style={{ fontWeight: '600' }}>{averageScore}%</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text>Questions</Text>
          <Text style={{ fontWeight: '600' }}>{test.questions.length}</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text>Pass Rate</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {passRate >= 70 ? (
              <MaterialCommunityIcons name="check-circle-outline" size={16} color="#10b981" />
            ) : (
              <Ionicons name="close-circle-outline" size={16} color="#ef4444" />
            )}
            <Text style={{ marginLeft: 4, fontWeight: '600' }}>{passRate}%</Text>
          </View>
        </View>
      </View>

      {/* Badges */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
        <View
          style={{
            backgroundColor: '#f3e8ff',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: '#6b46c1' }}>{test.organizationName}</Text>
        </View>
        <View
          style={{
            backgroundColor: '#dbeafe',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: '#2563eb' }}>{test.results.length} results</Text>
        </View>
        {passRate >= 70 ? (
          <View
            style={{
              backgroundColor: '#d1fae5',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#047857' }}>Good pass rate</Text>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: '#fee2e2',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#b91c1c' }}>Low pass rate</Text>
          </View>
        )}
      </View>

      {/* Nút View Report */}
      <TouchableOpacity
        style={{
          marginTop: 8,
          paddingVertical: 10,
          backgroundColor: '#3b82f6',
          borderRadius: 8,
          alignItems: 'center',
        }}
        onPress={() => onViewReport(test)}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="eye" size={16} color="white" style={{ marginRight: 4 }} />
          <Text style={{ color: 'white', fontWeight: '600' }}>Xem báo cáo</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default TestCard;
