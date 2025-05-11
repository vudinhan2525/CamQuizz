import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import COLORS from '../../constant/colors';

const TestCard = ({ 
  test, 
  onViewReport, 
  reportType = 'general', // 'general', 'author', 'organization', 'candidate'
  showBadges = false,
  customLabels = {}
}) => {
  const totalAttempts = test.attempts || 0;
  const totalResults = test.results?.length || 0;
  const totalQuestions = test.questions?.length || 0;

  const averageScore =
    totalResults > 0
      ? Math.round(
          test.results.reduce(
            (sum, result) =>
              sum + (result.score / result.totalQuestions) * 100,
            0
          ) / totalResults
        )
      : 0;

  const passCount = test.results?.filter(
    (result) => (result.score / result.totalQuestions) * 100 >= 70
  ).length || 0;

  const passRate =
    totalResults > 0 ? Math.round((passCount / totalResults) * 100) : 0;

  // Các nhãn mặc định
  const labels = {
    attempts: 'Số lượt làm bài',
    averageScore: 'Điểm trung bình',
    questions: 'Số câu hỏi',
    passRate: 'Tỉ lệ vượt qua',
    viewReport: 'Xem báo cáo',
    ...customLabels
  };

  // Hiển thị các thông tin khác nhau dựa trên loại báo cáo
  const renderReportTypeSpecificInfo = () => {
    switch (reportType) {
      case 'author':
        return (
          <>
            <View style={styles.statRow}>
              <View style={styles.statLabel}>
                <MaterialCommunityIcons name="account-group-outline" size={16} color={COLORS.BLUE} />
                <Text style={styles.statLabelText}>Số người tham gia</Text>
              </View>
              <Text style={styles.statValue}>{totalResults}</Text>
            </View>
            
            <View style={styles.statRow}>
              <View style={styles.statLabel}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.BLUE} />
                <Text style={styles.statLabelText}>Ngày tạo</Text>
              </View>
              <Text style={styles.statValue}>
                {test.createdAt ? new Date(test.createdAt).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          </>
        );
        
      case 'organization':
        return (
          <>
            <View style={styles.statRow}>
              <View style={styles.statLabel}>
                <Ionicons name="people-outline" size={16} color={COLORS.BLUE} />
                <Text style={styles.statLabelText}>Số người tham gia</Text>
              </View>
              <Text style={styles.statValue}>{totalResults}</Text>
            </View>
            
            <View style={styles.statRow}>
              <View style={styles.statLabel}>
                <Ionicons name="time-outline" size={16} color={COLORS.BLUE} />
                <Text style={styles.statLabelText}>Thời gian tổ chức</Text>
              </View>
              <Text style={styles.statValue}>
                {test.organizationDate ? new Date(test.organizationDate).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          </>
        );
        
      case 'candidate':
        const latestResult = test.results && test.results.length > 0 ? test.results[0] : null;
        const latestScore = latestResult ? 
          Math.round((latestResult.score / latestResult.totalQuestions) * 100) : 0;
        
        return (
          <>
            <View style={styles.statRow}>
              <View style={styles.statLabel}>
                <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.BLUE} />
                <Text style={styles.statLabelText}>Điểm gần nhất</Text>
              </View>
              <Text style={[styles.statValue, { color: latestScore >= 70 ? '#10B981' : '#EF4444' }]}>
                {latestScore}%
              </Text>
            </View>
            
            <View style={styles.statRow}>
              <View style={styles.statLabel}>
                <Ionicons name="time-outline" size={16} color={COLORS.BLUE} />
                <Text style={styles.statLabelText}>Ngày làm gần nhất</Text>
              </View>
              <Text style={styles.statValue}>
                {latestResult?.completedAt ? new Date(latestResult.completedAt).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          </>
        );
        
      default: // general
        return null;
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="documents-outline" size={20} color={COLORS.BLUE} />
          <Text style={styles.title}>
            {test.title}
          </Text>
        </View>
        <Text style={styles.description}>{test.description}</Text>
      </View>

      {/* Nội dung thống kê */}
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <View style={styles.statLabel}>
            <MaterialCommunityIcons name="account-multiple-outline" size={16} color={COLORS.BLUE} />
            <Text style={styles.statLabelText}>{labels.attempts}</Text>
          </View>
          <Text style={styles.statValue}>{totalAttempts}</Text>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statLabel}>
            <MaterialCommunityIcons name="percent-outline" size={16} color={COLORS.BLUE} />
            <Text style={styles.statLabelText}>{labels.averageScore}</Text>
          </View>
          <Text style={styles.statValue}>{averageScore}%</Text>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statLabel}>
            <Ionicons name="list-outline" size={16} color={COLORS.BLUE} />
            <Text style={styles.statLabelText}>{labels.questions}</Text>
          </View>
          <Text style={styles.statValue}>{totalQuestions}</Text>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statLabel}>
            <Text style={styles.statLabelText}>{labels.passRate}</Text>
          </View>
          <View style={styles.passRateContainer}>
            {passRate >= 70 ? (
              <MaterialCommunityIcons name="check-circle-outline" size={16} color={COLORS.BLUE} />
            ) : (
              <Ionicons name="close-circle-outline" size={16} color="#ef4444" />
            )}
            <Text style={styles.passRateText}>{passRate}%</Text>
          </View>
        </View>

        {renderReportTypeSpecificInfo()}
      </View>

      {/* Badges */}
      {showBadges && (
        <View style={styles.badgesContainer}>
          {test.organizationName && (
            <View style={[styles.badge, { backgroundColor: '#f3e8ff' }]}>
              <Text style={{ color: '#6b46c1' }}>{test.organizationName}</Text>
            </View>
          )}
          
          <View style={[styles.badge, { backgroundColor: '#dbeafe' }]}>
            <Text style={{ color: '#2563eb' }}>{totalResults} kết quả</Text>
          </View>
          
          {passRate >= 70 ? (
            <View style={[styles.badge, { backgroundColor: '#d1fae5' }]}>
              <Text style={{ color: '#047857' }}>Tỉ lệ đạt tốt</Text>
            </View>
          ) : (
            <View style={[styles.badge, { backgroundColor: '#fee2e2' }]}>
              <Text style={{ color: '#b91c1c' }}>Tỉ lệ đạt thấp</Text>
            </View>
          )}
        </View>
      )}

      {/* Nút View Report */}
      <TouchableOpacity
        style={styles.viewReportButton}
        onPress={() => onViewReport(test)}
      >
        <View style={styles.viewReportContent}>
          <Ionicons name="eye" size={16} color="white" style={styles.viewReportIcon} />
          <Text style={styles.viewReportText}>{labels.viewReport}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
    shadowColor: COLORS.BLUE,
        shadowOffset: {
            width: 0,
            height: 2,
        },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: COLORS.BLUE,
  },
  header: {
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  description: {
    color: '#6b7280',
  },
  statsContainer: {
    marginTop: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabelText: {
    marginLeft: 4,
  },
  statValue: {
    fontWeight: '600',
  },
  passRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passRateText: {
    marginLeft: 4,
    fontWeight: '600',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  viewReportButton: {
    marginTop: 8,
    paddingVertical: 10,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  viewReportContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewReportIcon: {
    marginRight: 4,
  },
  viewReportText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default TestCard;