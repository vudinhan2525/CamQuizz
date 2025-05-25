/**
 * Demo script để test các API calls cho Nhóm học tập
 * Bao gồm:
 * 1. Lấy Quiz theo GroupId
 * 2. Lấy Members theo GroupId
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import GroupService from '../services/GroupService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GroupAPIDemo = () => {
    const [groupId, setGroupId] = useState(1); // ID nhóm để test
    const [quizzes, setQuizzes] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userToken, setUserToken] = useState(null);

    useEffect(() => {
        checkUserToken();
    }, []);

    const checkUserToken = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            setUserToken(token);
            console.log('Current user token:', token ? token.substring(0, 15) + '...' : 'No token');
        } catch (error) {
            console.error('Error getting user token:', error);
        }
    };

    // Test API lấy Quiz theo GroupId
    const testGetQuizzesByGroupId = async () => {
        setLoading(true);
        try {
            console.log(`\n=== TESTING GET QUIZZES BY GROUP ID: ${groupId} ===`);
            
            const response = await GroupService.getSharedQuizzesByGroupId(groupId);
            
            console.log('✅ API call successful!');
            console.log('Response data:', JSON.stringify(response, null, 2));
            
            // Xử lý dữ liệu response
            let quizzesData = [];
            if (response && response.data) {
                quizzesData = Array.isArray(response.data) ? response.data : [response.data];
            } else if (Array.isArray(response)) {
                quizzesData = response;
            }
            
            setQuizzes(quizzesData);
            
            Alert.alert(
                'Thành công!', 
                `Đã lấy được ${quizzesData.length} quiz từ nhóm ${groupId}`,
                [{ text: 'OK' }]
            );
            
        } catch (error) {
            console.error('❌ Error getting quizzes:', error);
            Alert.alert(
                'Lỗi!', 
                `Không thể lấy quiz từ nhóm ${groupId}: ${error.message}`,
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    // Test API lấy Members theo GroupId
    const testGetMembersByGroupId = async () => {
        setLoading(true);
        try {
            console.log(`\n=== TESTING GET MEMBERS BY GROUP ID: ${groupId} ===`);
            
            const response = await GroupService.getMembersByGroupId(groupId);
            
            console.log('✅ API call successful!');
            console.log('Response data:', JSON.stringify(response, null, 2));
            
            // Xử lý dữ liệu response
            let membersData = [];
            if (response && response.data) {
                membersData = Array.isArray(response.data) ? response.data : [response.data];
            } else if (Array.isArray(response)) {
                membersData = response;
            }
            
            setMembers(membersData);
            
            Alert.alert(
                'Thành công!', 
                `Đã lấy được ${membersData.length} thành viên từ nhóm ${groupId}`,
                [{ text: 'OK' }]
            );
            
        } catch (error) {
            console.error('❌ Error getting members:', error);
            Alert.alert(
                'Lỗi!', 
                `Không thể lấy thành viên từ nhóm ${groupId}: ${error.message}`,
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    // Test cả hai API cùng lúc
    const testBothAPIs = async () => {
        setLoading(true);
        try {
            console.log(`\n=== TESTING BOTH APIs FOR GROUP ID: ${groupId} ===`);
            
            // Gọi cả hai API song song
            const [quizzesResponse, membersResponse] = await Promise.all([
                GroupService.getSharedQuizzesByGroupId(groupId),
                GroupService.getMembersByGroupId(groupId)
            ]);
            
            console.log('✅ Both API calls successful!');
            console.log('Quizzes response:', JSON.stringify(quizzesResponse, null, 2));
            console.log('Members response:', JSON.stringify(membersResponse, null, 2));
            
            // Xử lý dữ liệu quizzes
            let quizzesData = [];
            if (quizzesResponse && quizzesResponse.data) {
                quizzesData = Array.isArray(quizzesResponse.data) ? quizzesResponse.data : [quizzesResponse.data];
            } else if (Array.isArray(quizzesResponse)) {
                quizzesData = quizzesResponse;
            }
            
            // Xử lý dữ liệu members
            let membersData = [];
            if (membersResponse && membersResponse.data) {
                membersData = Array.isArray(membersResponse.data) ? membersResponse.data : [membersResponse.data];
            } else if (Array.isArray(membersResponse)) {
                membersData = membersResponse;
            }
            
            setQuizzes(quizzesData);
            setMembers(membersData);
            
            Alert.alert(
                'Thành công!', 
                `Nhóm ${groupId}:\n- ${quizzesData.length} quiz\n- ${membersData.length} thành viên`,
                [{ text: 'OK' }]
            );
            
        } catch (error) {
            console.error('❌ Error in batch API calls:', error);
            Alert.alert(
                'Lỗi!', 
                `Không thể lấy dữ liệu từ nhóm ${groupId}: ${error.message}`,
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    const changeGroupId = (newId) => {
        setGroupId(newId);
        setQuizzes([]);
        setMembers([]);
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Group API Demo</Text>
            
            {/* Token Status */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Token Status:</Text>
                <Text style={styles.tokenText}>
                    {userToken ? `✅ Token available: ${userToken.substring(0, 15)}...` : '❌ No token'}
                </Text>
                <TouchableOpacity style={styles.button} onPress={checkUserToken}>
                    <Text style={styles.buttonText}>Refresh Token</Text>
                </TouchableOpacity>
            </View>

            {/* Group ID Selection */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Group ID: {groupId}</Text>
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.smallButton} onPress={() => changeGroupId(1)}>
                        <Text style={styles.buttonText}>ID: 1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.smallButton} onPress={() => changeGroupId(2)}>
                        <Text style={styles.buttonText}>ID: 2</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.smallButton} onPress={() => changeGroupId(3)}>
                        <Text style={styles.buttonText}>ID: 3</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* API Test Buttons */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>API Tests:</Text>
                
                <TouchableOpacity 
                    style={[styles.button, loading && styles.buttonDisabled]} 
                    onPress={testGetQuizzesByGroupId}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Loading...' : 'Test Get Quizzes API'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.button, loading && styles.buttonDisabled]} 
                    onPress={testGetMembersByGroupId}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Loading...' : 'Test Get Members API'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]} 
                    onPress={testBothAPIs}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Loading...' : 'Test Both APIs'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Results Display */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Results:</Text>
                
                <Text style={styles.resultTitle}>Quizzes ({quizzes.length}):</Text>
                {quizzes.length > 0 ? (
                    quizzes.map((quiz, index) => (
                        <View key={index} style={styles.resultItem}>
                            <Text style={styles.resultText}>
                                Quiz ID: {quiz.quizId || quiz.id || 'N/A'}
                            </Text>
                            <Text style={styles.resultText}>
                                Title: {quiz.quiz?.title || quiz.title || 'N/A'}
                            </Text>
                            <Text style={styles.resultText}>
                                Shared by: {quiz.sharedBy?.firstName || quiz.sharedBy?.name || 'N/A'}
                            </Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noDataText}>No quizzes found</Text>
                )}

                <Text style={styles.resultTitle}>Members ({members.length}):</Text>
                {members.length > 0 ? (
                    members.map((member, index) => (
                        <View key={index} style={styles.resultItem}>
                            <Text style={styles.resultText}>
                                User ID: {member.userId || member.id || 'N/A'}
                            </Text>
                            <Text style={styles.resultText}>
                                Name: {member.firstName || member.name || 'N/A'} {member.lastName || ''}
                            </Text>
                            <Text style={styles.resultText}>
                                Email: {member.email || 'N/A'}
                            </Text>
                            <Text style={styles.resultText}>
                                Status: {member.status || 'N/A'}
                            </Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noDataText}>No members found</Text>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    section: {
        backgroundColor: 'white',
        padding: 15,
        marginBottom: 15,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    tokenText: {
        fontSize: 14,
        marginBottom: 10,
        color: '#666',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 6,
        marginBottom: 10,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: '#34C759',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    smallButton: {
        backgroundColor: '#007AFF',
        padding: 8,
        borderRadius: 4,
        minWidth: 60,
        alignItems: 'center',
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
        color: '#333',
    },
    resultItem: {
        backgroundColor: '#f8f8f8',
        padding: 10,
        marginBottom: 8,
        borderRadius: 4,
        borderLeftWidth: 3,
        borderLeftColor: '#007AFF',
    },
    resultText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    noDataText: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: 20,
    },
});

export default GroupAPIDemo;
