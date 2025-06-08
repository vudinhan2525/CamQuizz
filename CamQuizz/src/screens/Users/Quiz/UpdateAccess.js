import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import COLORS from '../../../constant/colors';
import QuizzService from '../../../services/QuizzService';
import StudyGroupService from '../../../services/StudyGroupService';
import AsyncStorageService from '../../../services/AsyncStorageService';

const UpdateAccess = ({ navigation, route }) => {
    const { quizId } = route.params;
    const [loading, setLoading] = useState(false);
    const [quiz, setQuiz] = useState(null);
    const [myGroups, setMyGroups] = useState([]);
    const [newEmail, setNewEmail] = useState('');
    const [selectedGroups, setSelectedGroups] = useState([]);

    useEffect(() => {
        fetchQuizData();
        fetchMyGroups();
    }, []);

    const fetchQuizData = async () => {
        try {
            const data = await QuizzService.getQuizzById(quizId);
            console.log("quiz 2",data)
            setQuiz(data);
            setSelectedGroups(data.shared_groups?.map(g => g.group_id) || []);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Không thể tải thông tin quiz'
            });
        }
    };
    const fetchMyGroups = async () => {
        const userId = await AsyncStorageService.getUserId();
        const groups = await StudyGroupService.getGroups(userId, 'Active', true);
        setMyGroups(groups)
    }
    const handleUpdateAccess = async () => {
        try {
            setLoading(true);
            if (
                quiz.status !== "Public" &&
                selectedGroups.length === 0 &&
                (!quiz.shared_users || quiz.shared_users.length === 0)
              )              
            {
                Toast.show({
                    type: 'error',
                    text1: 'Thiếu thông tin',
                    text2: 'Vui lòng nhập email người dùng hoặc chọn nhóm để chia sẻ',
                    visibilityTime: 2000,
                  });
                  return;
            }
            const updateData = {
                quizz_id:quizId,
                status:quiz.status,
                shared_groups: quiz.status!=="Public"?selectedGroups.map(g => g.toString()):[],
                shared_users: quiz.status!=="Public"?quiz.shared_users.map(u => u.email):[]
            };
            console.log(updateData)
            await QuizzService.updateQuizz(updateData);
            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: 'Đã cập nhật quyền truy cập',
                visibilityTime:2000,
                onHide: () => navigation.goBack()  
            });
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Không thể cập nhật quyền truy cập'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddEmail = () => {
        if (!newEmail.trim()) return;
        if (!newEmail.includes('@')) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Email không hợp lệ'
            });
            return;
        }

        setQuiz(prev => ({
            ...prev,
            shared_users: [...prev.shared_users, { email: newEmail.trim() }]
        }));
        setNewEmail('');
    };

    const handleRemoveEmail = (email) => {
        setQuiz(prev => ({
            ...prev,
            shared_users: prev.shared_users.filter(u => u.email !== email)
        }));
    };

    const toggleGroup = (groupId) => {
        setSelectedGroups(prev =>
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.BLUE} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cập nhật quyền truy cập</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quyền truy cập</Text>
                    <View style={styles.accessButtons}>
                        <TouchableOpacity
                            style={[
                                styles.accessButton,
                                quiz?.status === 'Public' && styles.activeAccessButton
                            ]}
                            onPress={() => setQuiz(prev => ({ ...prev, status: 'Public' }))}
                        >
                            <Text style={[
                                styles.accessButtonText,
                                quiz?.status === 'Public' && styles.activeAccessButtonText
                            ]}>Công khai</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.accessButton,
                                quiz?.status === 'Private' && styles.activeAccessButton
                            ]}
                            onPress={() => setQuiz(prev => ({ ...prev, status: 'Private' }))}
                        >
                            <Text style={[
                                styles.accessButtonText,
                                quiz?.status === 'Private' && styles.activeAccessButtonText
                            ]}>Riêng tư</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {quiz?.status === 'Private' && (
                    <>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Chia sẻ với người dùng</Text>
                            <View style={styles.emailInput}>
                                <TextInput
                                    value={newEmail}
                                    onChangeText={setNewEmail}
                                    placeholder="Nhập email"
                                    style={styles.input}
                                />
                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={handleAddEmail}
                                >
                                    <Ionicons name="add" size={24} color={COLORS.WHITE} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.emailList}>
                                {quiz.shared_users.map((user, index) => (
                                    <View key={index} style={styles.emailTag}>
                                        <Text style={styles.emailText}>{user.email}</Text>
                                        <TouchableOpacity
                                            onPress={() => handleRemoveEmail(user.email)}
                                        >
                                            <Ionicons name="close" size={16} color={COLORS.WHITE} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Chia sẻ với nhóm {selectedGroups?.length > 0 ? `(${selectedGroups?.length})` : ''}</Text>
                            <View style={styles.groupList}>
                                {myGroups.map(group => (
                                    <TouchableOpacity
                                        key={group.id}
                                        style={[
                                            styles.groupItem,
                                            selectedGroups.includes(group.id) && styles.selectedGroupItem
                                        ]}
                                        onPress={() => toggleGroup(group.id)}
                                    >
                                        <Text style={[
                                            styles.groupName,
                                            selectedGroups.includes(group.id) && styles.selectedGroupName
                                        ]}>{group.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>

            <TouchableOpacity
                style={[styles.updateButton, loading && styles.disabledButton]}
                onPress={handleUpdateAccess}
                disabled={loading}
            >
                <Text style={styles.updateButtonText}>
                    {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                </Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.WHITE,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.GRAY_BG,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.BLUE,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: COLORS.BLACK,
    },
    accessButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    accessButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.BLUE,
        alignItems: 'center',
    },
    activeAccessButton: {
        backgroundColor: COLORS.BLUE,
    },
    accessButtonText: {
        color: COLORS.BLUE,
        fontWeight: '500',
    },
    activeAccessButtonText: {
        color: COLORS.WHITE,
    },
    emailInput: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: COLORS.GRAY_LIGHT,
        borderRadius: 8,
        padding: 8,
    },
    addButton: {
        backgroundColor: COLORS.BLUE,
        width: 40,
        height: 40,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emailList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    emailTag: {
        backgroundColor: COLORS.BLUE,
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    emailText: {
        color: COLORS.WHITE,
    },
    groupList: {
        gap: 8,
    },
    groupItem: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.BLUE,
    },
    selectedGroupItem: {
        backgroundColor: COLORS.BLUE,
    },
    groupName: {
        color: COLORS.BLUE,
    },
    selectedGroupName: {
        color: COLORS.WHITE,
    },
    updateButton: {
        backgroundColor: COLORS.BLUE,
        margin: 16,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    updateButtonText: {
        color: COLORS.WHITE,
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.5,
    },
});

export default UpdateAccess;

