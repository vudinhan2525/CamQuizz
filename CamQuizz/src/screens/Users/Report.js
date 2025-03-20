import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';  
import TestCard from '../../components/Report/TestCard';
import TestFilter from '../../components/Report/TestFilter';
import AuthorTestReport from '../../components/Report/AuthorTestReport';
import OrganizationTestReport from '../../components/Report/OrganizationTestReport';
import CandidateTestReport from '../../components/Report/CandidateTestReport';
import { getCurrentUserTests, getOrganizationTests, getCandidateAttemptedTests } from '../../components/data/MocTests';
import COLORS from '../../constant/colors';

const Stack = createStackNavigator();

export const Report = ({ navigation }) => {
  const [activeView, setActiveView] = useState('author');
  const [selectedTest, setSelectedTest] = useState(null);
  const [searchFilter, setSearchFilter] = useState(null);

  const [showReport, setShowReport] = useState(false);

  const handleGoBack = () => {
    setSelectedTest(null);
  };

  const getTests = () => {
    switch (activeView) {
      case 'author':
        return getCurrentUserTests();
      case 'organization':
        return getOrganizationTests();
      case 'candidate':
        return getCandidateAttemptedTests();
      default:
        return [];
    }
  };

  const allTests = useMemo(() => getTests(), [activeView]);

  const filteredTests = useMemo(() => {
    if (!searchFilter) return allTests;
    return allTests.filter(test => test.id === searchFilter.id);
  }, [allTests, searchFilter]);

  const handleViewReport = (test) => {
    setSelectedTest(test);
  };

  const handleBackToList = () => {
    setSelectedTest(null);
  };

  const handleFilterSelect = (test) => {
    setSearchFilter(test);
    setSelectedTest(null);
  };

  const handleClearFilter = () => {
    setSearchFilter(null);
  };

  const handleViewChange = (value) => {
    setActiveView(value);
    setSelectedTest(null);
    setSearchFilter(null);
  };

  const renderReport = () => {
    if (!selectedTest) {
      return (
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ width: 250 }}>
            <TestFilter
              tests={allTests}
              onSelect={handleFilterSelect}
              placeholder={`Search ${activeView ? activeView : ''} tests`}
            />
          </View>
          {searchFilter && (
            <TouchableOpacity onPress={handleClearFilter} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
              <Ionicons name="refresh" size={16} color={COLORS.BLUE} />
              <Text>Làm mới</Text>
            </TouchableOpacity>
          )}
        </View>



          <View>
            {filteredTests.length > 0 ? (
              filteredTests.map((test) => (
                <TestCard key={test.id} test={test} onViewReport={handleViewReport} />
              ))
            ) : (
              <View style={{ alignItems: 'center', padding: 20 }}>
                <Ionicons name="document-text-outline" size={48} color="#aaa" />
                <Text>No tests found for this category</Text>
                {searchFilter && (
                  <TouchableOpacity variant="link" onPress={handleClearFilter}>
                    Clear filter and try again
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      );
    }

    switch (activeView) {
      case 'author':
        return <AuthorTestReport tests={[selectedTest]} onGoBack={handleGoBack} />;
      case 'organization':
        return <OrganizationTestReport tests={[selectedTest]} />;
      case 'candidate':
        return <CandidateTestReport tests={[selectedTest]} />;
      default:  
        return null;
    }
  };

  return (

    
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 16 }}>
         {/* ComboBox để chọn View */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ marginBottom: 8, fontWeight: 'bold' }}>Chọn kiểu báo cáo</Text>
          <View style={{ 
            backgroundColor: '#fff', 
            borderRadius: 8, 
            overflow: 'hidden',   
            borderWidth: 1, 
            borderColor: '#ddd',
            width: '70%'
          }}>
      <Picker
        selectedValue={activeView}
        onValueChange={(itemValue) => handleViewChange(itemValue)}
        style={{ height: 50, width: '100%' }}
        itemStyle={{ fontSize: 14 }}
      >
        <Picker.Item label="Author Tests" value="author" />
        <Picker.Item label="Organization Tests" value="organization" />
        <Picker.Item label="Candidate Tests" value="candidate" />
      </Picker>
    </View>
  </View>
        
        {renderReport()}
      </View>
    </View>
  );
};
