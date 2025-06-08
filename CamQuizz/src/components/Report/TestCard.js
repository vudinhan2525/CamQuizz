import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import COLORS from '../../constant/colors';
import AsyncStorageService from '../../services/AsyncStorageService';
import ReportQuizzService from '../../services/ReportQuizzService';

const TestCard = ({
  test,
  onViewReport,
  reportType = 'general',
  showBadges = false,
  customLabels = {}
}) => {

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const [message, setMessage] = React.useState('');
  const [showReportModal, setShowReportModal] = React.useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = React.useState(false);

  const onReport = async () => {
    setShowReportModal(true);
  };

  const handleSubmitReport = async () => {
    if (!message.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do báo cáo');
      return;
    }

    try {
      setIsSubmittingReport(true);
      const quiz_id = test.id;
      const reporter_id = await AsyncStorageService.getUserId();

      await ReportQuizzService.createReport(quiz_id, reporter_id, message.trim());

      Alert.alert('Thành công', 'Báo cáo đã được gửi thành công');
      setShowReportModal(false);
      setMessage('');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi báo cáo. Vui lòng thử lại.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleCancelReport = () => {
    setShowReportModal(false);
    setMessage('');
  };

  const getTestData = () => {
    switch (reportType) {
      case 'candidate':
        const rawScore = test.bestScore || test.best_score || 0;
        const totalQuestions = test.questions || test.total_questions || 0;

        let scorePercentage = 0;
        if (test.accuracy_rate) {
          scorePercentage = test.accuracy_rate;
        } else if (totalQuestions > 0) {
          scorePercentage = Math.round((rawScore / totalQuestions) * 100);
        }

        const candidateData = {
          totalAttempts: test.attempts || test.attempt_count || 0,
          totalResults: test.attempts || test.attempt_count || 0,
          totalQuestions: totalQuestions,
          averageScore: scorePercentage,
          passRate: scorePercentage >= 70 ? 100 : 0,
          latestScore: scorePercentage,
          lastAttemptDate: test.lastAttempt || test.last_attempt_date
        };

        return candidateData;

      case 'author':
        const authorData = {
          totalAttempts: test.numberOfAttended || test.attempts || 0,
          totalResults: test.numberOfAttended || test.attempts || 0,
          totalQuestions: test.numberOfQuestions || test.questions || 0,
          averageScore: test.averageScore || 0,
          passRate: test.passRate || 0 
        };

        return authorData;

      case 'organization':
        const organizationData = {
          totalAttempts: test.numberOfAttended || test.attempts || test.totalResults || 0, 
          totalResults: test.numberOfAttended || test.attempts || test.totalResults || 0,
          totalQuestions: test.numberOfQuestions || test.questions || 0,
          averageScore: test.averageScore || 0,
          passRate: test.passRate || 0
        };

        return organizationData;

      default:
        return {
          totalAttempts: test.attempts || 0,
          totalResults: test.results?.length || 0,
          totalQuestions: test.questions?.length || 0,
          averageScore: 0,
          passRate: 0
        };
    }
  };

  const { totalAttempts, totalResults, totalQuestions, averageScore, passRate, latestScore, lastAttemptDate } = getTestData();

  const getLabels = () => {
    let baseLabels = {};

    switch (reportType) {
      case 'candidate':
        baseLabels = {
          attempts: 'Số lần làm bài',
          averageScore: 'Điểm cao nhất',
          questions: 'Số câu hỏi',
          passRate: 'Trạng thái',
          viewReport: 'Xem báo cáo'
        };
        break;
      case 'organization':
        baseLabels = {
          attempts: 'Số phiên tổ chức',
          averageScore: 'Điểm trung bình',
          questions: 'Số câu hỏi',
          passRate: 'Tỉ lệ đạt',
          viewReport: 'Xem báo cáo'
        };
        break;
      case 'author':
      default:
        baseLabels = {
          attempts: 'Số lượt làm bài',
          averageScore: 'Điểm trung bình',
          questions: 'Số câu hỏi',
          passRate: 'Tỉ lệ vượt qua',
          viewReport: 'Xem báo cáo'
        };
        break;
    }

    return { ...baseLabels, ...customLabels };
  };

  const labels = getLabels();

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
                {formatDate(test.createdAt)}
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
                <Text style={styles.statLabelText}>Tổng người tham gia</Text>
              </View>
              <Text style={styles.statValue}>{totalAttempts}</Text>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statLabel}>
                <Ionicons name="time-outline" size={16} color={COLORS.BLUE} />
                <Text style={styles.statLabelText}>Thời gian gần nhất</Text>
              </View>
              <Text style={styles.statValue}>
                {test.organizationDate ? formatDate(test.organizationDate) : 'N/A'}
              </Text>
            </View>
          </>
        );
        
      case 'candidate':
        return (
          <>
            <View style={styles.statRow}>
              <View style={styles.statLabel}>
                <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.BLUE} />
                <Text style={styles.statLabelText}>Điểm cao nhất</Text>
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
                {lastAttemptDate ? new Date(lastAttemptDate).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          </>
        );
        
      default: 
        return null;
    }
  };

  return (
    <View style={styles.card}>

      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="documents-outline" size={20} color={COLORS.BLUE} />
          <Text style={styles.title}>
            {test.title || test.name || 'Bài kiểm tra'}
          </Text>
        </View>
      </View>


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
            {reportType === 'candidate' ? (
              <>
                {latestScore >= 70 ? (
                  <MaterialCommunityIcons name="check-circle-outline" size={16} color="#10B981" />
                ) : (
                  <Ionicons name="close-circle-outline" size={16} color="#ef4444" />
                )}
                <Text style={[styles.passRateText, { color: latestScore >= 70 ? '#10B981' : '#ef4444' }]}>
                  {latestScore >= 70 ? 'Đạt' : 'Chưa đạt'}
                </Text>
              </>
            ) : (
              <>
                {passRate >= 70 ? (
                  <MaterialCommunityIcons name="check-circle-outline" size={16} color={COLORS.BLUE} />
                ) : (
                  <Ionicons name="close-circle-outline" size={16} color="#ef4444" />
                )}
                <Text style={styles.passRateText}>{passRate}%</Text>
              </>
            )}
          </View>
        </View>

        {renderReportTypeSpecificInfo()}
      </View>


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


      <TouchableOpacity
        style={styles.viewReportButton}
        onPress={() => onViewReport(test)}
      >
        <View style={styles.viewReportContent}>
          <Ionicons name="eye" size={16} color="white" style={styles.viewReportIcon} />
          <Text style={styles.viewReportText}>{labels.viewReport}</Text>
        </View>
      </TouchableOpacity>

      {reportType === 'candidate' && (
        <TouchableOpacity
          style= {{marginTop: 8, paddingVertical: 10, backgroundColor: COLORS.WHITE, borderRadius: 8, alignItems: 'center'}}
          onPress={() => onReport()}
        >
          <View style={{backgroundColor: COLORS.WHITE, padding: 8, borderRadius: 8}}>
            <Text style={{color: COLORS.BLUE}}>Báo cáo bài kiểm tra</Text>
          </View>
        </TouchableOpacity>
      )}


      <Modal
        visible={showReportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelReport}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Báo cáo bài kiểm tra</Text>
              <TouchableOpacity onPress={handleCancelReport}>
                <Ionicons name="close" size={24} color={COLORS.GRAY_TEXT} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Lý do báo cáo:</Text>
              <TextInput
                style={styles.messageInput}
                placeholder="Nhập lý do báo cáo (ví dụ: nội dung không phù hợp, vi phạm bản quyền...)"
                value={message}
                onChangeText={setMessage}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelReport}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmitReport}
                disabled={isSubmittingReport}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmittingReport ? 'Đang gửi...' : 'Gửi báo cáo'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  modalBody: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.BLACK,
    marginBottom: 8,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    backgroundColor: COLORS.WHITE,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.GRAY_BG,
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
  },
  submitButton: {
    backgroundColor: COLORS.BLUE,
  },
  cancelButtonText: {
    color: COLORS.GRAY_TEXT,
    fontWeight: '500',
  },
  submitButtonText: {
    color: COLORS.WHITE,
    fontWeight: '500',
  },
});

export default TestCard;