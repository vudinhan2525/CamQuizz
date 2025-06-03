import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Alert } from 'react-native';
import AuthorTestReport from './AuthorTestReport';
import OrganizationTestReport from './OrganizationTestReport';
import CandidateTestReport from './CandidateTestReport';
import ReportService from '../../services/ReportService';
import COLORS from '../../constant/colors';

export const ReportDetail = ({ route, navigation }) => {
  const params = route?.params || {};
  const { test, viewType } = params;
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [attemptData, setAttemptData] = useState(null);

  // Log để debug
  useEffect(() => {
    console.log('ReportDetail - route params:', params);
    console.log('ReportDetail - test:', test);
    console.log('ReportDetail - viewType:', viewType);
  }, [params, test, viewType]);

  // Load detailed report data khi cần
  useEffect(() => {
    if (test && viewType === 'author') {
      loadAuthorReportData();
    } else if (test && viewType === 'candidate') {
      loadCandidateReportData();
    }
  }, [test, viewType]);

  const loadAuthorReportData = async () => {
    if (!test.id) return;

    setLoading(true);
    try {
      const response = await ReportService.getAuthorReport(test.id);
      console.log('Author report data loaded:', response.data);
      setReportData(response.data);
    } catch (error) {
      console.error('Error loading author report:', error);

      // Kiểm tra loại lỗi để hiển thị thông báo phù hợp
      if (error.message && error.message.includes('Network Error')) {
        Alert.alert('Lỗi kết nối', 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      } else if (error.response && error.response.status === 404) {
        Alert.alert('Không tìm thấy', 'Không tìm thấy báo cáo cho bài kiểm tra này.');
      } else if (error.response && error.response.status === 403) {
        Alert.alert('Không có quyền', 'Bạn không có quyền xem báo cáo này.');
      } else {
        Alert.alert('Lỗi', 'Không thể tải báo cáo chi tiết. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCandidateReportData = async () => {
    if (!test.id) {
      console.log('No test.id found for candidate report');
      return;
    }

    console.log('Loading candidate report data for quiz ID:', test.id);
    setLoading(true);
    try {
      // Load quiz attempts for candidate
      const response = await ReportService.getQuizAttempts(test.id);
      console.log('Candidate attempts data loaded:', response.data);
      setAttemptData(response.data);
    } catch (error) {
      console.error('Error loading candidate attempts:', error);

      if (error.message && error.message.includes('Network Error')) {
        Alert.alert('Lỗi kết nối', 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      } else if (error.response && error.response.status === 404) {
        Alert.alert('Không tìm thấy', 'Không tìm thấy lịch sử làm bài cho quiz này.');
      } else if (error.response && error.response.status === 403) {
        Alert.alert('Không có quyền', 'Bạn không có quyền xem lịch sử làm bài này.');
      } else {
        Alert.alert('Lỗi', 'Không thể tải lịch sử làm bài. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra dữ liệu
  if (!test) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Không tìm thấy dữ liệu báo cáo</Text>
      </View>
    );
  }

  const prepareTestData = (testData) => {
    const preparedTest = {
      ...testData,
      title: testData.title || 'Bài kiểm tra không có tiêu đề',
      questions: testData.questions || [],
      results: testData.results || []
    };
    
    if (preparedTest.questions.length > 0) {
      preparedTest.questions = preparedTest.questions.map(q => {
        if (!q) return null;
        return {
          ...q,
          options: q.options || q.choices || []
        };
      }).filter(Boolean);
    }
    
    if (preparedTest.results.length > 0) {
      preparedTest.results = preparedTest.results.map(r => {
        if (!r) return null;
        return {
          ...r,
          answers: r.answers || []
        };
      }).filter(Boolean);
    }
    
    return preparedTest;
  };

  const safeTest = prepareTestData(test);
  
  const handleGoBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.BLUE} />
        <Text style={styles.loadingText}>Đang tải báo cáo chi tiết...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {viewType === 'author' && (
        <AuthorTestReport
          tests={[safeTest]}
          onGoBack={handleGoBack}
          reportData={reportData}
        />
      )}
      {viewType === 'organization' && (
        <OrganizationTestReport tests={[safeTest]} onGoBack={handleGoBack} />
      )}
      {viewType === 'candidate' && (
        <CandidateTestReport
          tests={[safeTest]}
          onGoBack={handleGoBack}
          attemptData={attemptData}
        />
      )}
      {!viewType && (
        <View style={styles.centered}>
          <Text>Loại báo cáo không hợp lệ</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },
});

export default ReportDetail;