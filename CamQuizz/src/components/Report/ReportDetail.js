import React from 'react';
import { View } from 'react-native';
import AuthorTestReport from './AuthorTestReport';
import OrganizationTestReport from './OrganizationTestReport';
import CandidateTestReport from './CandidateTestReport';

export const ReportDetail = ({ route, navigation }) => {
  const { test, viewType } = route.params;

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      {viewType === 'author' && (
        <AuthorTestReport tests={[test]} onGoBack={handleGoBack} />
      )}
      {viewType === 'organization' && (
        <OrganizationTestReport tests={[test]} onGoBack={handleGoBack} />
      )}
      {viewType === 'candidate' && (
        <CandidateTestReport tests={[test]} onGoBack={handleGoBack} />
      )}
    </View>
  );
};