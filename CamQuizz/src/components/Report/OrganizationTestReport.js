import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import COLORS from '../../constant/colors';
import ReportService from '../../services/ReportService';

const screenWidth = Dimensions.get('window').width;

const OrganizationTestReport = ({ tests, onGoBack, sessionsData }) => {
  const [hostedSessions, setHostedSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [gameReport, setGameReport] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState(null);
  const [showParticipantsList, setShowParticipantsList] = useState(false);
  const [showSessionsList, setShowSessionsList] = useState(true);

  const selectedQuiz = tests && tests.length > 0 ? tests[0] : null;

  useEffect(() => {
    if (selectedQuiz) {
      fetchHostedSessions();
    }
  }, [selectedQuiz]);

  const fetchHostedSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      let sessions = [];
      if (sessionsData && Array.isArray(sessionsData) && sessionsData.length > 0) {
        sessions = sessionsData;
      } else {
        const response = await ReportService.getHostedSessions(100, 1, 'attempt_date');
        sessions = response.data || [];
      }

      // Sắp xếp sessions theo thời gian mới nhất
      sessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setHostedSessions(sessions);

    } catch (err) {
      console.error('Error fetching hosted sessions:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionSelect = async (session) => {
    setSelectedSession(session);
    setShowSessionsList(false);
    if (session.room_id) {
      await fetchGameReport(session.room_id, hostedSessions);
    }
  };

  const fetchGameReport = async (roomId, sessionsArray = null) => {
    try {
      setLoadingReport(true);
      const response = await ReportService.getGameReport(roomId);
      setGameReport(response.data);

      await fetchParticipants(roomId, sessionsArray);
    } catch (err) {
      console.error('Error fetching game report:', err);
    } finally {
      setLoadingReport(false);
    }
  };

  const fetchParticipants = async (roomId, sessionsArray = null) => {
    try {
      const sessionsToUse = sessionsArray || hostedSessions;

      const roomParticipants = sessionsToUse.filter(session => {
        return session.room_id === roomId || session.roomId === roomId;
      });

      const uniqueParticipants = [];
      const seenUsers = new Set();

      roomParticipants.forEach((session) => {
        const roomIdField = session.room_id || session.roomId;
        const attemptNumberField = session.attempt_number || session.attemptNumber;
        const accuracyRateField = session.accuracy_rate || session.accuracyRate;

        const participantKey = `${roomIdField}-${attemptNumberField}`;

        if (!seenUsers.has(participantKey)) {
          seenUsers.add(participantKey);
          const participant = {
            id: attemptNumberField,
            name: `Người tham gia ${uniqueParticipants.length + 1}`,
            score: session.score,
            accuracy: (accuracyRateField || 0).toFixed(1),
            timestamp: session.timestamp,
            roomId: roomIdField,
            attemptId: attemptNumberField
          };
          uniqueParticipants.push(participant);
        }
      });

      setParticipants(uniqueParticipants);
    } catch (err) {
      console.error('Error processing participants:', err);
      setParticipants([]);
    }
  };



  // Show loading if no selectedQuiz or if still loading
  if (!selectedQuiz || loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.BLUE} />
        <Text style={styles.loadingText}>
          {!selectedQuiz ? 'Đang khởi tạo...' : 'Đang tải dữ liệu...'}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={48} color={COLORS.RED} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchHostedSessions()}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (hostedSessions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="document-text-outline" size={48} color={COLORS.GRAY} />
        <Text style={styles.emptyText}>Chưa có phiên tổ chức nào</Text>
        <Text style={styles.emptySubText}>Các phiên quiz bạn tổ chức sẽ hiển thị ở đây</Text>
      </View>
    );
  }

  // Hiển thị danh sách sessions nếu chưa chọn session cụ thể
  if (showSessionsList || !selectedSession) {
    return (
      <ScrollView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => onGoBack && onGoBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.BLUE} />
          <Text style={styles.backText}>Trở về</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>{selectedQuiz?.title || selectedQuiz?.name || 'Báo cáo tổ chức'}</Text>
          <Text style={styles.subtitle}>Chọn phiên tổ chức để xem báo cáo chi tiết</Text>
        </View>

        {hostedSessions.length > 0 ? hostedSessions.map((session, sessionIndex) => {
          const sessionDate = new Date(session.timestamp);
          const scorePercentage = session.total_questions > 0
            ? Math.round((session.score / session.total_questions) * 100)
            : 0;
          const scoreColor = scorePercentage >= 70 ? '#10B981' : scorePercentage >= 40 ? '#FBBF24' : '#EF4444';

          return (
            <TouchableOpacity
              key={`session-${sessionIndex}-${session.room_id || 'unknown'}`}
              style={styles.sessionCard}
              onPress={() => handleSessionSelect(session)}
            >
              <View style={styles.sessionHeader}>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionTitle}>Phiên tổ chức #{sessionIndex + 1}</Text>
                  <Text style={styles.sessionDate}>
                    {sessionDate.toLocaleDateString('vi-VN')} • {sessionDate.toLocaleTimeString('vi-VN')}
                  </Text>
                  <Text style={styles.sessionStats}>
                    {session.total_questions || 0} câu hỏi • Room ID: {session.room_id}
                  </Text>
                </View>
                <View style={styles.sessionScoreContainer}>
                  <Text style={[styles.sessionScore, { color: scoreColor }]}>
                    {scorePercentage}%
                  </Text>
                  <Text style={styles.sessionScoreDetail}>
                    {session.score}/{session.total_questions}
                  </Text>
                  <Text style={styles.sessionAccuracy}>
                    Độ chính xác: {(session.accuracy_rate || 0).toFixed(1)}%
                  </Text>
                </View>
              </View>
              <View style={styles.sessionFooter}>
                <Text style={styles.viewDetailText}>Nhấn để xem chi tiết</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.BLUE} />
              </View>
            </TouchableOpacity>
          );
        }) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Không có phiên tổ chức nào cho quiz này
            </Text>
          </View>
        )}
      </ScrollView>
    );
  }

  const hasDetailedData = gameReport && gameReport.question_stats;

  if (!hasDetailedData) {
    return (
      <ScrollView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => setShowSessionsList(true)}>
          <Ionicons name="arrow-back" size={24} color={COLORS.BLUE} />
          <Text style={styles.backText}>Trở về danh sách</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>{selectedSession?.quiz_name || 'Báo cáo phiên tổ chức'}</Text>
          <Text style={styles.date}>
            Thời điểm tổ chức: {new Date(selectedSession?.timestamp).toLocaleDateString('vi-VN')} {new Date(selectedSession?.timestamp).toLocaleTimeString('vi-VN')}
          </Text>
        </View>

        <View style={styles.infoCard}>
          {loadingReport ? (
            <>
              <ActivityIndicator size="large" color={COLORS.BLUE} />
              <Text style={styles.infoTitle}>Đang tải báo cáo chi tiết...</Text>
            </>
          ) : (
            <>
              <Ionicons name="information-circle" size={48} color={COLORS.BLUE} />
              <Text style={styles.infoTitle}>Báo cáo tổ chức</Text>
              <Text style={styles.infoText}>
                Để xem báo cáo chi tiết của phiên này, vui lòng đợi hệ thống tải dữ liệu.
              </Text>
            </>
          )}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Số câu hỏi:</Text>
              <Text style={styles.statValue}>{selectedSession?.total_questions || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Điểm số:</Text>
              <Text style={styles.statValue}>{selectedSession?.score || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Độ chính xác:</Text>
              <Text style={styles.statValue}>{(selectedSession?.accuracy_rate || 0).toFixed(1)}%</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Room ID:</Text>
              <Text style={styles.statValue}>{selectedSession?.room_id || 'N/A'}</Text>
            </View>
            {gameReport && (
              <>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Tổng người chơi:</Text>
                  <Text style={styles.statValue}>{gameReport.total_players || 0}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Điểm trung bình:</Text>
                  <Text style={styles.statValue}>{calculateAverageScore()}%</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    );
  }

  const totalParticipants = gameReport?.total_players || 0;

  const calculateAverageScore = () => {
    if (!gameReport?.score_distribution || !selectedSession?.total_questions) return 0;

    const scoreData = gameReport.score_distribution;
    const totalQuestions = selectedSession.total_questions;
    let totalScore = 0;
    let totalCount = 0;

    Object.entries(scoreData).forEach(([score, count]) => {
      const scoreNum = parseInt(score);
      const percentage = (scoreNum / totalQuestions) * 100;
      totalScore += percentage * count;
      totalCount += count;
    });

    return totalCount > 0 ? (totalScore / totalCount).toFixed(1) : 0;
  };

  const generateScoreDistribution = () => {
    if (!gameReport?.score_distribution || !selectedSession?.total_questions) return [];

    const scoreData = gameReport.score_distribution;
    const totalQuestions = selectedSession.total_questions;
    const colors = ['#FF6384', '#FF9F40', '#FFCD56', '#4BC0C0', '#36A2EB'];

    // Create percentage ranges
    const ranges = [
      { name: '0-20%', count: 0 },
      { name: '21-40%', count: 0 },
      { name: '41-60%', count: 0 },
      { name: '61-80%', count: 0 },
      { name: '81-100%', count: 0 }
    ];

    Object.entries(scoreData).forEach(([score, count]) => {
      const scoreNum = parseInt(score);
      const percentage = (scoreNum / totalQuestions) * 100;

      if (percentage <= 20) ranges[0].count += count;
      else if (percentage <= 40) ranges[1].count += count;
      else if (percentage <= 60) ranges[2].count += count;
      else if (percentage <= 80) ranges[3].count += count;
      else ranges[4].count += count;
    });

    return ranges.map((range, index) => ({
      name: range.name,
      population: range.count,
      color: colors[index % colors.length],
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    }));
  };

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(0, 99, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => setShowSessionsList(true)}>
        <Ionicons name="arrow-back" size={24} color={COLORS.BLUE} />
        <Text style={styles.backText}>Trở về danh sách</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>{selectedSession?.quiz_name || 'Báo cáo phiên tổ chức'}</Text>
        <Text style={styles.date}>
          Thời điểm tổ chức: {new Date(selectedSession?.timestamp).toLocaleDateString('vi-VN')} {new Date(selectedSession?.timestamp).toLocaleTimeString('vi-VN')}
        </Text>
      </View>


      {/* Total participants */}
      <TouchableOpacity
        style={styles.participantsCard}
        onPress={() => setShowParticipantsList(!showParticipantsList)}
      >
        <View style={styles.participantsHeader}>
          <View style={styles.participantsInfo}>
            <Ionicons name="people" size={24} color={COLORS.BLUE} />
            <Text style={styles.participantsTitle}>Tổng số người tham gia</Text>
          </View>
          <Text style={styles.participantsCount}>{totalParticipants}</Text>
          <Ionicons
            name={showParticipantsList ? "chevron-up" : "chevron-down"}
            size={24}
            color={COLORS.BLUE}
          />
        </View>

        {showParticipantsList && (
          <View style={styles.participantsList}>
            {participants.length > 0 ? (
              participants.map((participant, index) => (
                <View key={index} style={styles.participantItem}>
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>{participant.name}</Text>
                    <Text style={styles.participantTime}>
                      {new Date(participant.timestamp).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                  <View style={styles.participantStats}>
                    <Text style={styles.participantScore}>
                      Điểm: {participant.score}
                    </Text>
                    <Text style={styles.participantAccuracy}>
                      Độ chính xác: {participant.accuracy}%
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noParticipantsText}>
                {loadingReport ? 'Đang tải danh sách người tham gia...' : 'Chưa có người tham gia nào'}
              </Text>
            )}
            {gameReport && (
              <View style={styles.summaryStats}>
                <Text style={styles.summaryStatsText}>
                  Điểm trung bình: {calculateAverageScore()}%
                </Text>
                <Text style={styles.summaryStatsText}>
                  Tổng số người chơi: {gameReport.total_players || 0}
                </Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>

      {/* Score distribution chart */}
      {gameReport?.score_distribution && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Phân bố điểm số</Text>
          <PieChart
            data={generateScoreDistribution()}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      )}

      {/* Question analysis */}
      {gameReport?.question_stats && (
        <>
          <Text style={styles.sectionTitle}>Phân tích câu hỏi</Text>
          {gameReport.question_stats.map((question, index) => (
            <View key={question.question_id} style={styles.questionCard}>
              <Text style={styles.questionNumber}>Câu {index + 1}</Text>
              <Text style={styles.questionText}>{question.question_name}</Text>

              <Text style={styles.avgTimeText}>
                Thời gian trung bình: {(question.average_answer_time || 0).toFixed(1)} giây
              </Text>

              <View style={styles.questionStats}>
                <Text style={styles.questionStatsText}>
                  Tỷ lệ trả lời đúng: {(question.correct_rate || 0).toFixed(1)}%
                </Text>
                <Text style={styles.questionStatsText}>
                  Số câu trả lời: {question.total_answers || 0}/{totalParticipants}
                </Text>
              </View>

              <Text style={styles.answerDistTitle}>Tỷ lệ chọn mỗi đáp án:</Text>
              {question.option_stats?.map((option, idx) => (
                <View key={idx} style={styles.answerOption}>
                  <View style={styles.answerTextContainer}>
                    <Text style={styles.answerText}>{option.answer_text}</Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${(option.selection_rate).toFixed(1)}%`,
                          backgroundColor: '#2196F3'
                        }
                      ]}
                    />
                    <Text style={styles.percentageText}>
                      {(option.selection_rate).toFixed(1)}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.BLUE,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: COLORS.GRAY,
  },
  errorText: {
    marginTop: 8,
    fontSize: 16,
    color: COLORS.RED,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.BLUE,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.GRAY,
  },
  emptySubText: {
    marginTop: 4,
    fontSize: 14,
    color: COLORS.GRAY,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  loadMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.BLUE,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },

  questionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
  },
  questionStatsText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  participantsCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  participantsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  participantsCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLUE,
  },
  participantsList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  participantTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  participantStats: {
    alignItems: 'flex-end',
  },
  participantScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.BLUE,
  },
  participantAccuracy: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  noParticipantsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    padding: 16,
    fontStyle: 'italic',
  },
  summaryStats: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryStatsText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  questionCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.BLUE,
    marginBottom: 4,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 12,
  },
  avgTimeText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  statsContainer: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  answerDistTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  answerOption: {
    marginBottom: 8,
  },
  answerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  answerText: {
    fontSize: 14,
    flex: 1,
  },
  correctIcon: {
    marginLeft: 8,
  },
  progressBarContainer: {
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    height: '100%',
  },
  percentageText: {
    position: 'absolute',
    right: 8,
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewAnswersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  viewAnswersText: {
    fontSize: 14,
    color: COLORS.BLUE,
    marginRight: 4,
  },
  // Session card styles
  sessionCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1F2937',
  },
  sessionDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  sessionStats: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  sessionScoreContainer: {
    alignItems: 'flex-end',
  },
  sessionScore: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sessionScoreDetail: {
    fontSize: 14,
    color: '#6B7280',
  },
  sessionAccuracy: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  viewDetailText: {
    fontSize: 14,
    color: COLORS.BLUE,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },

});

export default OrganizationTestReport;