import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity,ScrollView, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../../../constant/colors';
import * as ImagePicker from 'expo-image-picker';
import { Dropdown } from 'react-native-element-dropdown';
import BottomSheet from '../../../components/BottomSheet';
import QuestionSlider from '../../../components/QuestionSlider'
import GroupSelectionModal from '../../../components/GroupSelectionModal';

const QuizCreation = () => {
    const navigation = useNavigation();
    const [imageUri, setImageUri] = useState(null);
    const bottomSheetRef = useRef();
    const [quizInfo, setQuizInfo] = useState({
        categoryId: "Khác",
        name: "Bài kiểm tra ZZZ",
        access: 'Công khai',
        amount: 0,
        selectedGroups: []
    });
    const [tmpQuizInfo, setTmpQuizInfo] = useState({
        categoryId: "Khác",
        name: "Bài kiểm tra ZZZ",
        access: 'Công khai',
        amount: 0,
        selectedGroups: []
    });
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [selectedGroups, setSelectedGroups] = useState([]);
    const categories = [
        { label: 'Category 1', value: '1' },
        { label: 'Category 2', value: '2' },
        { label: 'Category 3', value: '3' },
    ];
    const accesses = [
        { label: 'Công khai', value: 'Công khai' },
        { label: 'Riêng tư', value: 'Riêng tư' },
        { label: 'Nhóm học tập', value: 'Nhóm học tập' },
    ];
    const mockGroups = [
        { id: '1', name: 'Nhóm Toán học' },
        { id: '2', name: 'Nhóm Tiếng Anh' },
        { id: '3', name: 'Nhóm Lập trình' },
        { id: '4', name: 'Nhóm Vật lý' },
        { id: '5', name: 'Nhóm Hóa học' },
        { id: '6', name: 'Nhóm Sinh học' },
    ];
    const questions = [
        {
            id: 1,
            points: 10,
            duration: 30,
            question: "Thủ đô của Việt Nam là gì?",
            questionImage:null,
            options: [
                { id: 'A', text: "Hà Nội", image: null, isCorrect: true },
                { id: 'B', text: "Hồ Chí Minh", image: null, isCorrect: false },
                { id: 'C', text: "Đà Nẵng", image: null, isCorrect: false },
                { id: 'D', text: "Huế", image: null, isCorrect: false }
            ]
        },
        {
            id: 2,
            points: 15,
            duration: 45,
            question: "1 + 1 bằng mấy?",
            questionImage: 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg',
            options: [
                { id: 'A', text: "1",image: 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg', isCorrect: false },
                { id: 'B', text: "2", isCorrect: true },
                { id: 'C', text: "3", isCorrect: false },
                { id: 'D', text: "4", isCorrect: false }
            ]
        },
        {
            id: 3,
            points: 20,
            duration: 60,
            question: "Câu hỏi thứ ba",
            options: [
                { id: 'A', text: "1", isCorrect: false },
                { id: 'B', text: "2", isCorrect: true },
                { id: 'C', text: "3", isCorrect: false },
                { id: 'D', text: "4", isCorrect: false }
            ]
        }
    ];
    const handleImagePicker = async () => {
        console.log('press')
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Ứng dụng cần quyền truy cập thư viện ảnh!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri({ uri: result.assets[0].uri });
            console.log('Image selected:', result.assets[0].uri);
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
            selectedGroups: tmpQuizInfo.access === 'Nhóm học tập' ? selectedGroups : []
        });
        bottomSheetRef.current.close();
    }
    const handleAccessChange = (item) => {
        setTmpQuizInfo({ ...tmpQuizInfo, access: item.value });
        if (item.value === 'Nhóm học tập') {
            bottomSheetRef.current.close();
            setShowGroupModal(true);
        }
    };
    const handleSaveGroups = (groups) => {
        console.log("a",tmpQuizInfo);
        setSelectedGroups(groups);
        setTmpQuizInfo(prev => ({
            ...prev,
            selectedGroups: groups
        }));
        setQuizInfo(prev => ({
            ...prev,
            selectedGroups: groups
        }));
    };
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tạo bài kiểm tra</Text>
                <TouchableOpacity onPress={() => { () => saveQuiz() }}>
                    <Text style={styles.saveButton}>Lưu</Text>
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
                            <Text style={styles.quizInfoText}>Chủ đề: <Text style={{ color: COLORS.BLACK }}>{quizInfo.categoryId}</Text></Text>
                            <Text style={styles.quizInfoText}>Quyền truy cập: <Text style={{ color: COLORS.BLACK }}>{quizInfo.access}</Text></Text>
                            {quizInfo.access === 'Nhóm học tập' && quizInfo.selectedGroups.length > 0 && (
                                <View style={styles.selectedGroupsContainer}>
                                    <Text style={styles.quizInfoText}>Nhóm được chọn:</Text>
                                    <ScrollView 
                                        horizontal 
                                        showsHorizontalScrollIndicator={false}
                                        style={styles.groupsScrollView}
                                    >
                                        {quizInfo.selectedGroups.map(groupId => {
                                            const group = mockGroups.find(g => g.id === groupId);
                                            return (
                                                <View key={groupId} style={styles.groupTag}>
                                                    <Text style={styles.groupTagText}>{group?.name}</Text>
                                                </View>
                                            );
                                        })}
                                    </ScrollView>
                                </View>
                            )}
                            <Text style={styles.quizInfoText}>Số câu hỏi: <Text style={{ color: COLORS.BLACK }}>{quizInfo.amount}</Text></Text>
                        </View>
                        <TouchableOpacity style={styles.editButton}>
                            <Ionicons name="create-outline" size={24} color={COLORS.BLUE} onPress={() => bottomSheetRef.current.open()} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.questionSliderContainer}>
                        <QuestionSlider questions={questions} />
                    </View>
                </View>
            </ScrollView>
            <View style={styles.footer}>
                <TouchableOpacity style={styles.footerButton} onPress={() => { }}>
                    <Ionicons name="search-outline" color={COLORS.WHITE} size={24} />
                    <Text style={[styles.buttonText, styles.footerButtonText]}>Tìm kiếm câu hỏi</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerButton} onPress={() => { }}>
                    <Ionicons name="create-outline" color={COLORS.WHITE} size={24} />
                    <Text style={[styles.buttonText, styles.footerButtonText]}>Tạo câu hỏi</Text>
                </TouchableOpacity>
            </View>
            <BottomSheet ref={bottomSheetRef} title="Thông tin bài kiểm tra" height={300}>
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
                <View style={styles.modalButtons}>
                    <TouchableOpacity style={styles.button} onPress={() => saveQuizInfo()} >
                        <Text style={styles.buttonText}>Lưu</Text>
                    </TouchableOpacity>
                </View>
            </BottomSheet>
            <GroupSelectionModal
                visible={showGroupModal}
                onClose={() => setShowGroupModal(false)}
                onSave={handleSaveGroups}
                selectedGroups={selectedGroups}
                myGroups={mockGroups}
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
        fontSize: 16,
        color: COLORS.BLUE,
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
});

export default QuizCreation;