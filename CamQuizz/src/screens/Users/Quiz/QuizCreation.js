import React, { useState, useRef, useEffect, use } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../../../constant/colors';
import * as ImagePicker from 'expo-image-picker';
import { Dropdown } from 'react-native-element-dropdown';
import BottomSheet from '../../../components/BottomSheet';
import QuestionSlider from '../../../components/QuestionSlider'
import OptionalAccessModal from '../../../components/OptionalAccessModal';
import SCREENS from '../../index'
import ImageService from '../../../services/ImageService';
import QuizzService from '../../../services/QuizzService';
import AsyncStorageService from '../../../services/AsyncStorageService';
import GenreService from '../../../services/GenreService';
import StudyGroupService from '../../../services/StudyGroupService';

const QuizCreation = () => {
    const navigation = useNavigation();
    const [imageUri, setImageUri] = useState(null);
    const bottomSheetRef = useRef();
    const [quizInfo, setQuizInfo] = useState({
        categoryId: "Khác",
        name: "Tên bài kiểm tra",
        access: 'Công khai',
        amount: 0,
        selectedGroups: [],
        invitedEmails: []
    });
    const [tmpQuizInfo, setTmpQuizInfo] = useState({
        categoryId: "Khác",
        name: "",
        access: 'Public',
        amount: 0,
        selectedGroups: [],
        invitedEmails: []
    });
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [categories, setCategories] = useState([]);
    const accesses = [
        { label: 'Công khai', value: 'Public' },
        { label: 'Riêng tư', value: 'Private' },
    ];
    const mockGroups = [
        { id: '1', name: 'Nhóm Toán học' },
        { id: '2', name: 'Nhóm Tiếng Anh' },
        { id: '3', name: 'Nhóm Lập trình' },
        { id: '4', name: 'Nhóm Vật lý' },
        { id: '5', name: 'Nhóm Hóa học' },
        { id: '6', name: 'Nhóm Sinh học' },
    ];
    const [questions, setQuestions] = useState([]);
    const [myGroups, setMyGroups] = useState([]);
    const questionsRef = useRef(questions);
    useEffect(() => {
        const fetchMyGroups = async () => {
            const userId = await AsyncStorageService.getUserId();
            const groups = await StudyGroupService.getGroups(userId, 'Active', true);
            setMyGroups(groups)
            console.log("my groups",groups)
        }
        const fetchCategories = async () => {
            try {
                const response = await GenreService.getAllGenres();
                const categories = response.data.map(item => ({
                    label: item.name,
                    value: item.id.toString(),
                }));
                setCategories(categories);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
        fetchMyGroups()
    }, []);

    useEffect(() => {
        questionsRef.current = questions;
    }, [questions]);
    const getCategoryName = (id) => {
        const category = categories.find((item) => item.value === id);
        return category ? category.label : 'Unknown';
    };
    const createQuizDTO = async () => {
        try {
            let quizImageUrl = "";
            if (imageUri?.uri) {
                const quizImageResult = await handleUploadImage(imageUri.uri);
                quizImageUrl = quizImageResult.secure_url;
            }
            const userId = await AsyncStorageService.getUserId();
            const formattedQuestions = await Promise.all(questions.map(async question => {
                // Upload question image if exists
                let questionImageUrl = "";
                if (question.questionImage) {
                    const questionImageResult = await handleUploadImage(question.questionImage);
                    questionImageUrl = questionImageResult.secure_url;
                }

                // Upload answer images and format answers
                const formattedAnswers = await Promise.all(question.options.map(async answer => {
                    let answerImageUrl = null;
                    if (answer.image) {
                        const answerImageResult = await handleUploadImage(answer.image);
                        answerImageUrl = answerImageResult.secure_url;
                    }
                    const formattedAnswer = {
                        answer: answer.text,
                        is_correct: answer.isCorrect,
                        image: answerImageUrl||""
                    };

                    console.log('Formatted Answer:', formattedAnswer); 

                    return formattedAnswer;
                }));

                return {
                    name: question.question,
                    description: question.explanation || '',
                    duration: question.duration || 60,
                    score: question.points || 10,
                    image: questionImageUrl,
                    answers: formattedAnswers
                };
            }));

            const userShareIds = quizInfo.access === 'Private' ?
                quizInfo.invitedEmails.map(email => email) : [];

            const groupShareIds = quizInfo.access === 'Private' ?
                quizInfo.selectedGroups.map(groupId => groupId) : [];

            return {
                name: quizInfo.name,
                image: quizImageUrl||"",
                genre_id: parseInt(quizInfo.categoryId),
                user_id: userId,
                status: quizInfo.access === 'Công khai' ? 'Public' : 'Private',
                userEmails:userShareIds,
                shared_groups:groupShareIds,
                questions: formattedQuestions,
                shared_users:userShareIds
            };
        } catch (error) {
            console.error('Error creating quiz DTO:', error);
            throw error;
        }
    };
    const handleImagePicker = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Ứng dụng cần quyền truy cập thư viện ảnh!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri({ uri: result.assets[0].uri });
        }
    };
    console.log('tmpQuizInfo:', {
        selectedGroups: tmpQuizInfo.selectedGroups,
        invitedEmails: tmpQuizInfo.invitedEmails
    });
    const handleUploadImage = async (uri) => {
        try {
            const fileName = uri.split('/').pop() || 'image.jpg';
            const imageParam = {
                uri: uri,
                type: 'image/jpeg',
                name: fileName
            };
            const uploadResult = await ImageService.uploadImage(imageParam);
            return uploadResult;
        } catch (error) {
            throw error;
        }
    };
    const handleDeleteImage = () => {
        setImageUri(null);
    };

    const handleModifyImage = () => {
        handleImagePicker();
    };

    const saveQuiz = () => {
        navigation.goBack();
    }
    const saveQuizInfo = () => {
        setQuizInfo({
            ...tmpQuizInfo,
            selectedGroups: tmpQuizInfo.access === 'Private' ? selectedGroups : [],
            invitedEmails: tmpQuizInfo.access === 'Private' ? tmpQuizInfo.invitedEmails : [],
            access: getAccessLabel(tmpQuizInfo.access)
        });
        bottomSheetRef.current.close();
    }
    const getAccessLabel = (access) => {
        switch (access) {
            case 'Public':
                return 'Công khai';
            case 'Private':
                return 'Riêng tư';
            default:
                return 'Công khai';
        }
    };
    const handleAccessChange = (item) => {
        setTmpQuizInfo({ ...tmpQuizInfo, access: item.value });
        if (item.value === 'Private') {
            setShowGroupModal(true);
        }
    };

    const handleSaveOptionalAccess = (groups, emails) => {
        console.log('groups', groups)
        console.log('emails', emails)
        setSelectedGroups(groups);
        setTmpQuizInfo(prev => ({
            ...prev,
            selectedGroups: groups,
            invitedEmails: emails
        }));
        setQuizInfo(prev => ({
            ...prev,
            selectedGroups: groups,
            invitedEmails: emails,
            access: getAccessLabel(tmpQuizInfo.access)
        }));
    };



    const handleAddQuestion = (newQuestion) => {
        setQuestions(prev => [...prev, {
            ...newQuestion,
            questionImage: newQuestion.questionImage,
            answers: newQuestion.options.map(answer => ({
                ...answer,
                image: answer.image
            }))
        }]);
        console.log('newQuestion:', newQuestion);
    };

    const handleUpdateQuestion = (updatedQuestion) => {
        setQuestions(prev =>
            prev.map(q => q.id === updatedQuestion.id ?
                {
                    ...updatedQuestion,
                    questionImage: updatedQuestion.questionImage,
                    answers: updatedQuestion.options.map(answer => ({
                        ...answer,
                        image: answer.image
                    }))
                } : q
            )
        );
    };

    const handleCreateQuestion = () => {
        navigation.navigate(SCREENS.QUESTION_SETTING, {
            questions: questionsRef.current,
            onSave: handleAddQuestion
        });
    };

    const handleEditQuestion = (questionToEdit) => {
        navigation.navigate(SCREENS.QUESTION_SETTING, {
            question: questionToEdit,
            questions: questionsRef.current,
            onSave: handleUpdateQuestion
        });
    };

    const isQuizValid = () => {
        if (!questions || questions.length === 0) {
            return false;
        }

        return true;
    };

    const handleSaveQuiz = async () => {
        if (!isQuizValid()) {
            alert('Vui lòng thêm ít nhất 1 câu hỏi');
            return;
        }

        try {
            const quizDTO = await createQuizDTO();
            console.log('📦 Full Quiz DTO:', JSON.stringify(quizDTO, null, 2));

            const data = await QuizzService.createQuizz(quizDTO);

            if (data) {
                console.log('✅ Quiz created successfully:', data);
                alert('Tạo bài kiểm tra thành công!');
                navigation.goBack();
            } 
        } catch (error) {
            console.error('Error saving quiz:', error);
            alert('Không thể tạo bài kiểm tra. Vui lòng thử lại!');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tạo bài kiểm tra</Text>
                <TouchableOpacity
                    style={[
                        !isQuizValid() && styles.saveButtonDisabled
                    ]}
                    onPress={handleSaveQuiz}
                    disabled={!isQuizValid()}
                >
                    <Text style={[
                        styles.saveButtonText,
                    ]}>
                        Lưu
                    </Text>
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.container}>
                <View style={styles.content}>
                    <TouchableOpacity style={styles.imageCard} onPress={handleImagePicker}>
                        {imageUri ? (
                            <>
                                <Image source={imageUri} style={styles.image} />
                                <View style={styles.imageActions}>
                                    <TouchableOpacity onPress={handleDeleteImage} style={styles.actionButton}>
                                        <Ionicons name="trash-outline" size={24} color={COLORS.RED} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleModifyImage} style={styles.actionButton}>
                                        <Ionicons name="create-outline" size={24} color={COLORS.BLUE} />
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <>
                                <Ionicons name="image-outline" size={24} color={COLORS.GRAY_DARK} />
                                <Text style={styles.imageCardText}>Thêm hình ảnh</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    <View style={styles.quizInfoCard}>
                        <View style={styles.quizInfo}>
                            <Text style={styles.quizInfoText}>Tên bài kiểm tra: <Text style={{ color: COLORS.BLACK }}>{quizInfo.name}</Text></Text>
                            <Text style={styles.quizInfoText}>Chủ đề: <Text style={{ color: COLORS.BLACK }}>{getCategoryName(quizInfo.categoryId)}</Text></Text>
                            <Text style={styles.quizInfoText}>Quyền truy cập: <Text style={{ color: COLORS.BLACK }}>{quizInfo.access}</Text></Text>
                            <View style={styles.accessDetailsContainer}>
                                {quizInfo.access === 'Riêng tư' && <Text style={styles.quizInfoText}>Chia sẻ với:</Text>}
                                <View style={styles.flowContainer}>
                                    {quizInfo.selectedGroups.map(groupId => {
                                        const group = myGroups.find(g => g.id === groupId);
                                        return (
                                            <View key={`group-${groupId}`} style={styles.itemTag}>
                                                <Ionicons name="people" size={14} color={COLORS.BLUE} style={styles.tagIcon} />
                                                <Text style={styles.itemTagText}>{group?.name}</Text>
                                            </View>
                                        );
                                    })}
                                    {quizInfo.invitedEmails.map((email, index) => (
                                        <View key={`email-${index}`} style={styles.itemTag}>
                                            <Ionicons name="mail" size={14} color={COLORS.BLUE} style={styles.tagIcon} />
                                            <Text style={styles.itemTagText}>{email}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.editButton}>
                            <Ionicons name="create-outline" size={24} color={COLORS.BLUE} onPress={() => bottomSheetRef.current.open()} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.questionSliderContainer}>
                        <QuestionSlider
                            questions={questions}
                            setQuestions={setQuestions}
                            handleEditQuestion={handleEditQuestion}
                        />
                    </View>
                </View>
            </ScrollView>
            <View style={styles.footer}>

                <TouchableOpacity
                    style={styles.footerButton}
                    onPress={handleCreateQuestion}
                >
                    <Ionicons name="create-outline" color={COLORS.WHITE} size={24} />
                    <Text style={[styles.buttonText, styles.footerButtonText]}>
                        Thêm câu hỏi
                    </Text>
                </TouchableOpacity>
            </View>
            <BottomSheet ref={bottomSheetRef} title="Thông tin bài kiểm tra" height={'100%'}>
                <View style={styles.dropdownContainer}>
                    <Text style={styles.label}>Tên bài kiểm tra</Text>
                    <TextInput
                        style={styles.dropdown}
                        placeholder="Nhập tên bài kiểm tra"
                        value={tmpQuizInfo.name}
                        onChangeText={(text) => {
                            setTmpQuizInfo({ ...tmpQuizInfo, name: text });
                        }}
                    />
                </View>
                <View style={styles.dropdownContainer}>
                    <Text style={styles.label}>Chủ đề</Text>
                    <Dropdown
                        style={styles.dropdown}
                        data={categories}
                        labelField="label"
                        valueField="value"
                        value={tmpQuizInfo.categoryId}
                        onChange={(item) => {
                            setTmpQuizInfo({ ...tmpQuizInfo, categoryId: item.value });
                        }}
                    />
                </View>
                <View style={styles.dropdownContainer}>
                    <Text style={styles.label}>Quyền truy cập</Text>
                    <Dropdown
                        style={styles.dropdown}
                        data={accesses}
                        labelField="label"
                        valueField="value"
                        value={tmpQuizInfo.access}
                        onChange={handleAccessChange}
                    />
                </View>
                <View style={styles.accessContainer}>

                    {tmpQuizInfo.access === 'Private' && (
                        <View style={styles.selectedItemsContainer}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={styles.label}>Tùy chọn quyền truy cập:</Text>
                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => setShowGroupModal(true)}
                                >
                                    <Ionicons name="create-outline" size={24} color={COLORS.BLUE} />
                                </TouchableOpacity>
                            </View>

                            {tmpQuizInfo.selectedGroups.length > 0 && (
                                <View style={styles.selectedGroupsContainer}>
                                    <Text style={styles.smallLabel}>Nhóm được chọn:</Text>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        style={styles.groupsScrollView}
                                    >
                                        {tmpQuizInfo.selectedGroups.map(groupId => {
                                            const group = myGroups.find(g => g.id === groupId);
                                            return (
                                                <View key={groupId} style={styles.groupTag}>
                                                    <Text style={styles.groupTagText}>{group?.name}</Text>
                                                </View>
                                            );
                                        })}
                                    </ScrollView>
                                </View>
                            )}

                            {tmpQuizInfo.invitedEmails?.length > 0 && (
                                <View style={styles.selectedGroupsContainer}>
                                    <Text style={styles.smallLabel}>Email được mời:</Text>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        style={styles.groupsScrollView}
                                    >
                                        {tmpQuizInfo.invitedEmails.map((email, index) => (
                                            <View key={index} style={styles.groupTag}>
                                                <Text style={styles.groupTagText}>{email}</Text>
                                            </View>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                <View style={styles.modalButtons}>
                    <TouchableOpacity
                        disabled={tmpQuizInfo.name === '' || tmpQuizInfo.categoryId === '' || tmpQuizInfo.access === '' || (tmpQuizInfo.access === 'Private' && tmpQuizInfo.selectedGroups.length === 0 && tmpQuizInfo.invitedEmails.length === 0)}
                        style={[styles.button, { opacity: tmpQuizInfo.name === '' || tmpQuizInfo.categoryId === '' || tmpQuizInfo.access === '' || (tmpQuizInfo.access === 'Private' && tmpQuizInfo.selectedGroups.length === 0 && tmpQuizInfo.invitedEmails.length === 0) ? 0.5 : 1 }]}
                        onPress={() => saveQuizInfo()} >
                        <Text style={styles.buttonText}>Lưu</Text>
                    </TouchableOpacity>
                </View>
            </BottomSheet>
            <OptionalAccessModal
                visible={showGroupModal}
                onClose={() => setShowGroupModal(false)}
                onSave={handleSaveOptionalAccess}
                selectedGroups={selectedGroups}
                initialInvitedEmails={tmpQuizInfo.invitedEmails}
                myGroups={myGroups}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.WHITE,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    saveButton: {
        backgroundColor: COLORS.BLUE,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 16,
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        color: COLORS.BLUE,
        fontSize: 16,
        fontWeight: 'bold',
    },

    content: {
        padding: 16,
    },
    imageCard: {
        width: '100%',
        height: 160,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        position: 'relative',
        marginBottom: 20,
    },
    imageCardText: {
        marginTop: 10,
        fontSize: 16,
        color: COLORS.GRAY_DARK,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    imageActions: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ translateX: -30 }, { translateY: -15 }]
    },
    actionButton: {
        marginLeft: 10,
    },
    quizInfoCard: {
        width: '100%',
        padding: 16,
        backgroundColor: COLORS.WHITE,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.BLUE,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quizInfo: {
        flex: 1,
    },
    quizInfoText: {
        fontSize: 16,
        color: COLORS.BLUE,
        marginBottom: 5,
    },
    editButton: {
        padding: 10,
    },
    footer: {
        flexDirection: 'row',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    footerButton: {
        backgroundColor: COLORS.BLUE,
        padding: 10,
        borderRadius: 5,
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 5,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    footerButtonText: {
        color: 'white',
    },
    modalButtons: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'flex-end'
    },
    button: {
        padding: 10,
        borderRadius: 5,
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 5,
        backgroundColor: COLORS.BLUE
    },
    buttonText: {
        fontWeight: 'bold',
        color: COLORS.WHITE
    },
    dropdownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        color: COLORS.BLUE,
        marginRight: 8
    },
    dropdown: {
        flex: 1,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 12,
    },
    questionSliderContainer: {
        marginVertical: 10,
    },
    selectedGroupsContainer: {
        marginVertical: 5,
    },
    groupsScrollView: {
        maxHeight: 35,
        marginTop: 5,
    },
    groupTag: {
        backgroundColor: COLORS.BLUE + '20',
        borderRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        borderWidth: 1,
        borderColor: COLORS.BLUE,
    },
    groupTagText: {
        color: COLORS.BLUE,
        fontSize: 14,
    },
    accessDetailsContainer: {
        marginTop: 8,
    },
    selectedItemsContainer: {
        marginVertical: 8,
    },
    flowContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        gap: 8,
    },
    itemTag: {
        backgroundColor: COLORS.BLUE_LIGHT,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    tagIcon: {
        marginRight: 4,
    },
    itemTagText: {
        color: COLORS.BLUE,
        fontSize: 14,
    },
    smallLabel: {
        fontSize: 14,
        color: COLORS.GRAY_DARK,
        marginBottom: 5,
    },
    accessContainer: {
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.BLUE,
        backgroundColor: COLORS.BLUE_LIGHT,
        marginBottom: 10,
    }
});

export default QuizCreation;