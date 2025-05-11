import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import AuthorTestReport from './AuthorTestReport';
import OrganizationTestReport from './OrganizationTestReport';
import CandidateTestReport from './CandidateTestReport';

export const ReportDetail = ({ route, navigation }) => {
  const params = route?.params || {};
  const { test, viewType } = params;

  // Log để debug
  useEffect(() => {
    console.log('ReportDetail - route params:', params);
    console.log('ReportDetail - test:', test);
    console.log('ReportDetail - viewType:', viewType);
  }, [params, test, viewType]);

  // Kiểm tra dữ liệu
  if (!test) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Không tìm thấy dữ liệu báo cáo</Text>
      </View>
    );
  }

  // Chuẩn bị dữ liệu mẫu nếu cần
  const prepareTestData = (testData) => {
    // Đảm bảo các trường cần thiết tồn tại
    const preparedTest = {
      ...testData,
      title: testData.title || 'Bài kiểm tra không có tiêu đề',
      questions: testData.questions || [],
      results: testData.results || []
    };
    
    // Đảm bảo mỗi câu hỏi có options
    if (preparedTest.questions.length > 0) {
      preparedTest.questions = preparedTest.questions.map(q => {
        if (!q) return null;
        return {
          ...q,
          options: q.options || q.choices || []
        };
      }).filter(Boolean);
    }
    
    // Đảm bảo mỗi kết quả có answers
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

  return (
    <View style={styles.container}>
      {viewType === 'author' && (
        <AuthorTestReport tests={[safeTest]} onGoBack={handleGoBack} />
      )}
      {viewType === 'organization' && (
        <OrganizationTestReport tests={[safeTest]} onGoBack={handleGoBack} />
      )}
      {viewType === 'candidate' && (
        <CandidateTestReport tests={[safeTest]} onGoBack={handleGoBack} />
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
  }
});

export default ReportDetail;