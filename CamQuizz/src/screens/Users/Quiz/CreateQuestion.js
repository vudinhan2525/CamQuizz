import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal, Image, Switch, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import COLORS from '../../../constant/colors';
import SCREENS from '../..';
import * as ImagePicker from 'expo-image-picker';

const CreateQuestion = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const isEditing = route.params?.question !== undefined;
    const questions = route.params?.questions || [];
    const onSave = route.params?.onSave;

    const initialQuestion = route.params?.question || {
        id: Date.now(),
        points: 1,
        duration: 30,
        question: '',
        questionImage: null,
        explanation: '',
        options: [
            { id: '1', text: '', isCorrect: false, image: null },
            { id: '2', text: '', isCorrect: false, image: null },
            { id: '3', text: '', isCorrect: false, image: null },
            { id: '4', text: '', isCorrect: false, image: null }
        ]
    };

    const [questionData, setQuestionData] = useState(initialQuestion);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [tempSettings, setTempSettings] = useState({
        duration: questionData.duration,
        points: questionData.points
    });
    const [questionImage, setQuestionImage] = useState(initialQuestion.questionImage || null);
    const [hasMultipleAnswers, setHasMultipleAnswers] = useState(false);
    const [showExplanationModal, setShowExplanationModal] = useState(false);
    const [explanation, setExplanation] = useState('');
    const [tempExplanation, setTempExplanation] = useState('');

    const handleSave = () => {
        if (!questionData.question.trim()) {
            alert('Vui lòng nhập nội dung câu hỏi');
            return;
        }

        const validOptions = questionData.options.filter(opt => opt.text.trim() !== '');
        if (validOptions.length < 2) {
            alert('Cần ít nhất 2 tùy chọn có nội dung');
            return;
        }

        if (!questionData.options.some(opt => opt.isCorrect)) {
            alert('Vui lòng chọn ít nhất 1 đáp án đúng');
            return;
        }

        if (onSave) {
            const cleanedOptions = questionData.options.filter(opt => opt.text.trim() !== '');
            const cleanedQuestion = {
                ...questionData,
                options: cleanedOptions
            };
            onSave(cleanedQuestion);
            navigation.goBack();
        }
    };

    const updateQuestionField = (field, value) => {
        setQuestionData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const updateOption = (index, text) => {
        const newOptions = [...questionData.options];
        newOptions[index] = { ...newOptions[index], text };
        updateQuestionField('options', newOptions);
    };

    const toggleCorrectAnswer = (index) => {
        const option = questionData.options[index];

        if (!option.text.trim()) {
            alert('Vui lòng nhập nội dung đáp án trước khi chọn đáp án đúng');
            return;
        }

        const newOptions = questionData.options.map((opt, i) => {
            if (i === index) {
                return { ...opt, isCorrect: !opt.isCorrect };
            }
            if (!hasMultipleAnswers) {
                return { ...opt, isCorrect: false };
            }
            return opt;
        });
        updateQuestionField('options', newOptions);
    };

    const handleOpenSettings = () => {
        setTempSettings({
            duration: questionData.duration,
            points: questionData.points
        });
        setShowSettingsModal(true);
    };

    const handleSaveSettings = () => {
        setQuestionData(prev => ({
            ...prev,
            duration: tempSettings.duration,
            points: tempSettings.points
        }));
        setShowSettingsModal(false);
    };

    const handleImagePicker = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Ứng dụng cần quyền truy cập thư viện ảnh!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 1,
        });

        if (!result.canceled) {
            setQuestionImage(result.assets[0].uri);
            updateQuestionField('questionImage', result.assets[0].uri);
        }
    };

    const handleRemoveImage = () => {
        setQuestionImage(null);
        updateQuestionField('questionImage', null);
    };

    const handleOpenExplanation = () => {
        setTempExplanation(explanation);
        setShowExplanationModal(true);
    };

    const handleSaveExplanation = () => {
        const trimmedExplanation = tempExplanation.trim();
        setExplanation(trimmedExplanation);
        setShowExplanationModal(false);
    };

    const handleAddOption = () => {
        const newOption = { id: (questionData.options.length + 1).toString(), text: '', isCorrect: false, image: null };
        const newOptions = [...questionData.options, newOption];
        updateQuestionField('options', newOptions);
    };

    const handleOptionImagePicker = async (optionIndex) => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Ứng dụng cần quyền truy cập thư viện ảnh!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 1,
        });

        if (!result.canceled) {
            const newOptions = [...questionData.options];
            newOptions[optionIndex] = {
                ...newOptions[optionIndex],
                image: result.assets[0].uri
            };
            updateQuestionField('options', newOptions);
        }
    };

    const handleRemoveOptionImage = (optionIndex) => {
        const newOptions = [...questionData.options];
        newOptions[optionIndex] = {
            ...newOptions[optionIndex],
            image: null
        };
        updateQuestionField('options', newOptions);
    };

    const isQuestionValid = () => {
        if (!questionData.question.trim()) {
            return false;
        }

        const validOptions = questionData.options.filter(opt => opt.text.trim() !== '');
        if (validOptions.length < 2) {
            return false;
        }

        const hasCorrectAnswer = questionData.options.some(opt => opt.isCorrect);
        if (!hasCorrectAnswer) {
            return false;
        }

        return true;
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {isEditing ? 'Chỉnh sửa câu hỏi' : 'Tạo câu hỏi mới'}
                    </Text>
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={!isQuestionValid()}
                    >
                        <Text style={[
                            styles.saveQuestionButton,
                            !isQuestionValid() && styles.saveQuestionButtonDisabled
                        ]}>
                            Lưu
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content}>
                    <View style={styles.optionsRow}>
                        <View style={styles.infoDisplay}>
                            <Ionicons name="time-outline" size={20} color={COLORS.GRAY_DARK} />
                            <Text style={styles.infoText}>{questionData.duration} giây</Text>
                        </View>

                        <View style={styles.infoDisplay}>
                            <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.GRAY_DARK} />
                            <Text style={styles.infoText}>{questionData.points} điểm</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={handleOpenSettings}
                        >
                            <Ionicons name="create-outline" size={20} color={COLORS.BLUE} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.questionContainer}>
                        <View style={styles.questionHeaderContainer}>
                            <Text style={styles.requiredField}>*</Text>
                            <TextInput
                                style={styles.questionInput}
                                placeholder="Thêm câu hỏi của bạn ở đây"
                                multiline
                                value={questionData.question}
                                onChangeText={(text) => updateQuestionField('question', text)}
                                placeholderTextColor={COLORS.WHITE + '80'}
                            />
                        </View>

                        {/* Image Section */}
                        <View style={styles.imageSection}>
                            {questionImage ? (
                                <View style={styles.imageContainer}>
                                    <Image
                                        source={{ uri: questionImage }}
                                        style={styles.questionImage}
                                    />
                                    <View style={styles.imageActions}>
                                        <TouchableOpacity
                                            style={styles.imageActionButton}
                                            onPress={handleRemoveImage}
                                        >
                                            <Ionicons name="trash-outline" size={20} color={COLORS.WHITE} />
                                            <Text style={styles.imageActionText}>Xóa</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.imageActionButton}
                                            onPress={handleImagePicker}
                                        >
                                            <Ionicons name="create-outline" size={20} color={COLORS.WHITE} />
                                            <Text style={styles.imageActionText}>Sửa</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={styles.addImageButton}
                                    onPress={handleImagePicker}
                                >
                                    <Ionicons name="image-outline" size={24} color={COLORS.WHITE} />
                                    <Text style={styles.addImageText}>Thêm hình ảnh</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Question Settings Card */}
                    <View style={styles.questionSettingsCard}>
                        {/* <View style={styles.questionSettingsRow}>
                            <View style={styles.switchContainer}>
                                <Switch
                                    value={hasMultipleAnswers}
                                    onValueChange={setHasMultipleAnswers}
                                    trackColor={{ false: COLORS.GRAY_LIGHT, true: COLORS.BLUE + '80' }}
                                    thumbColor={hasMultipleAnswers ? COLORS.BLUE : COLORS.GRAY_DARK}
                                />
                                <Text style={styles.switchLabel}>Nhiều đáp án đúng</Text>
                            </View>

                            <TouchableOpacity 
                                style={styles.explanationButton}
                                onPress={handleOpenExplanation}
                            >
                                <Text style={styles.explanationButtonText}>
                                    {explanation ? 'Sửa giải thích' : 'Thêm giải thích'}
                                </Text>
                            </TouchableOpacity>
                        </View> */}
                        <TouchableOpacity
                            style={styles.explanationButton}
                            onPress={handleOpenExplanation}
                        >
                            <Text style={styles.explanationButtonText}>
                                {explanation ? 'Sửa giải thích' : 'Thêm giải thích'}
                            </Text>
                        </TouchableOpacity>
                        {explanation !== '' && (
                            <View style={styles.explanationContainer}>
                                <Text style={styles.explanationLabel}>Giải thích:</Text>
                                <Text style={styles.explanationText}>{explanation}</Text>
                            </View>
                        )}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <Ionicons name="information-circle-outline" size={24} color={COLORS.BLUE} />
                        <Text style={{ color: COLORS.GRAY_DARK }}>Bấm vào tùy chọn để thiết lập đáp án đúng</Text>
                    </View>
                    <View style={styles.optionsContainer}>
                        {questionData.options.map((option, index) => (
                            <View key={option.id} style={[styles.optionItem, option.isCorrect && styles.correctOption]}>
                                <View style={styles.optionHeader}>
                                    <Text style={styles.optionLabel}>Tùy chọn {option.id}</Text>
                                    <TouchableOpacity
                                        style={[
                                            styles.correctIndicator,
                                            !option.text.trim() && styles.correctIndicatorDisabled
                                        ]}
                                        onPress={() => toggleCorrectAnswer(index)}
                                        disabled={!option.text.trim()}
                                    >
                                        <Ionicons
                                            name={option.isCorrect ? "checkmark-circle" : "checkmark-circle-outline"}
                                            size={24}
                                            color={
                                                !option.text.trim()
                                                    ? COLORS.GRAY_LIGHT
                                                    : option.isCorrect
                                                        ? COLORS.GREEN
                                                        : COLORS.GRAY_DARK
                                            }
                                        />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.optionContentContainer}>
                                    <View style={styles.optionInputContainer}>
                                        <TextInput
                                            style={styles.answerInput}
                                            placeholder={`Nhập đáp án ${option.id}`}
                                            value={option.text}
                                            onChangeText={(text) => updateOption(index, text)}
                                        />
                                        {/* <TouchableOpacity
                                            style={styles.imageButton}
                                            onPress={() => handleOptionImagePicker(index)}
                                        >
                                            <Ionicons
                                                name="image-outline"
                                                size={24}
                                                color={option.image ? COLORS.BLUE : COLORS.GRAY_DARK}
                                            />
                                        </TouchableOpacity> */}
                                    </View>

                                    {option.image && (
                                        <View style={styles.optionImageContainer}>
                                            <Image
                                                source={{ uri: option.image }}
                                                style={styles.optionImage}
                                            />
                                            <TouchableOpacity
                                                style={styles.removeImageButton}
                                                onPress={() => handleRemoveOptionImage(index)}
                                            >
                                                <Ionicons name="close-circle" size={24} color={COLORS.RED} />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))}

                        {/* Nút thêm tùy chọn mới */}
                        <TouchableOpacity
                            style={styles.addOptionButton}
                            onPress={handleAddOption}
                        >
                            <View style={styles.addOptionContent}>
                                <Ionicons name="add-circle-outline" size={24} color={COLORS.BLUE} />
                                <Text style={styles.addOptionText}>Thêm tùy chọn</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* Settings Modal */}
                <Modal
                    visible={showSettingsModal}
                    transparent={true}
                    animationType="fade"
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Cài đặt câu hỏi</Text>
                                <TouchableOpacity
                                    onPress={() => setShowSettingsModal(false)}
                                    style={styles.closeButton}
                                >
                                    <Ionicons name="close" size={24} color={COLORS.BLACK} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.settingsContainer}>
                                <View style={styles.settingField}>
                                    <Text style={styles.fieldLabel}>Thời gian (giây)</Text>
                                    <View style={styles.inputContainer}>
                                        <TouchableOpacity
                                            style={styles.adjustButton}
                                            onPress={() => setTempSettings(prev => ({
                                                ...prev,
                                                duration: Math.max(1, prev.duration - 5)
                                            }))}
                                        >
                                            <Ionicons name="remove" size={24} color={COLORS.BLUE} />
                                        </TouchableOpacity>

                                        <TextInput
                                            style={styles.fieldInput}
                                            value={tempSettings.duration.toString()}
                                            onChangeText={(value) => setTempSettings(prev => ({
                                                ...prev,
                                                duration: parseInt(value) || 0
                                            }))}
                                            keyboardType="numeric"
                                        />

                                        <TouchableOpacity
                                            style={styles.adjustButton}
                                            onPress={() => setTempSettings(prev => ({
                                                ...prev,
                                                duration: prev.duration + 5
                                            }))}
                                        >
                                            <Ionicons name="add" size={24} color={COLORS.BLUE} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.settingField}>
                                    <Text style={styles.fieldLabel}>Điểm số</Text>
                                    <View style={styles.inputContainer}>
                                        <TouchableOpacity
                                            style={styles.adjustButton}
                                            onPress={() => setTempSettings(prev => ({
                                                ...prev,
                                                points: Math.max(1, prev.points - 1)
                                            }))}
                                        >
                                            <Ionicons name="remove" size={24} color={COLORS.BLUE} />
                                        </TouchableOpacity>

                                        <TextInput
                                            style={styles.fieldInput}
                                            value={tempSettings.points.toString()}
                                            onChangeText={(value) => setTempSettings(prev => ({
                                                ...prev,
                                                points: parseInt(value) || 1
                                            }))}
                                            keyboardType="numeric"
                                        />

                                        <TouchableOpacity
                                            style={styles.adjustButton}
                                            onPress={() => setTempSettings(prev => ({
                                                ...prev,
                                                points: prev.points + 1
                                            }))}
                                        >
                                            <Ionicons name="add" size={24} color={COLORS.BLUE} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.saveSettingsButton}
                                onPress={handleSaveSettings}
                            >
                                <Text style={styles.saveSettingsText}>Lưu</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Explanation Modal */}
                <Modal
                    visible={showExplanationModal}
                    transparent={true}
                    animationType="fade"
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {explanation ? 'Sửa giải thích' : 'Thêm giải thích'}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setShowExplanationModal(false)}
                                    style={styles.closeButton}
                                >
                                    <Ionicons name="close" size={24} color={COLORS.BLACK} />
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                style={styles.explanationInput}
                                placeholder="Nhập giải thích cho câu hỏi..."
                                multiline
                                value={tempExplanation}
                                onChangeText={setTempExplanation}
                                textAlignVertical="top"
                            />

                            <View style={styles.modalFooter}>
                                {explanation !== '' && (
                                    <TouchableOpacity
                                        style={styles.clearButton}
                                        onPress={() => {
                                            setTempExplanation('');
                                            setExplanation('');
                                            setShowExplanationModal(false);
                                        }}
                                    >
                                        <Text style={styles.clearButtonText}>Xóa giải thích</Text>
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity
                                    style={styles.saveButton}
                                    onPress={handleSaveExplanation}
                                >
                                    <Text style={styles.saveButtonText}>Lưu</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
};

const getOptionColor = (index) => {
    const colors = [
        COLORS.WHITE,
        COLORS.WHITE,
        COLORS.WHITE,
        COLORS.WHITE,
    ];
    return colors[index] + '40';
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.WHITE,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        paddingBottom: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.WHITE,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingVertical: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    saveQuestionButton: {
        fontSize: 16,
        color: COLORS.BLUE,
        fontWeight: '500',
    },
    saveQuestionButtonDisabled: {
        color: COLORS.GRAY_LIGHT,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 20,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    infoDisplay: {
        backgroundColor: COLORS.GRAY_BG,
        padding: 8,
        borderRadius: 16,
        flexDirection: 'row',
        marginRight: 8
    },
    infoText: {
        marginHorizontal: 4,
        textAlignVertical: 'center',
    },
    optionInput: {
        textAlign: 'center',
    },
    optionText: {
        color: COLORS.GRAY_DARK,
        fontSize: 14,
    },
    questionContainer: {
        backgroundColor: COLORS.BLUE,
        borderRadius: 10,
        padding: 16,
        marginBottom: 20,
    },
    questionHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    requiredField: {
        color: COLORS.RED,
        fontSize: 18,
        marginRight: 4,
    },
    questionInput: {
        flex: 1,
        color: COLORS.WHITE,
        fontSize: 16,
        minHeight: 100,
    },
    optionsContainer: {
        gap: 12,
        paddingHorizontal: 10
    },
    optionItem: {
        borderRadius: 10,
        padding: 16,
        minHeight: 60,
        backgroundColor: COLORS.BLUE + '20',
        marginBottom: 12,
    },
    optionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    correctIndicator: {
        padding: 4,
    },
    correctIndicatorDisabled: {
        opacity: 0.5,
    },
    optionLabel: {
        fontSize: 14,
        color: COLORS.GRAY_DARK,
    },
    answerInput: {
        fontSize: 16,
        backgroundColor: COLORS.WHITE,
        padding: 8,
        borderRadius: 8,
        flex: 1
    },
    correctOption: {
        borderWidth: 2,
        borderColor: COLORS.GREEN,
    },
    saveButtonBottom: {
        backgroundColor: COLORS.BLUE,
        padding: 16,
        margin: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: COLORS.GRAY_DARK,
    },
    saveButtonText: {
        color: COLORS.WHITE,
        fontSize: 16,
        fontWeight: 'bold',
    },
    editButton: {
        padding: 8,
        borderRadius: 20,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fieldContainer: {
        flexDirection: 'row'
    },
    inputContainer: {
        flexDirection: 'row'
    },
    fieldInput: {
        textAlignVertical: 'center',
        height: '100%',
        textAlign: 'center'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: COLORS.WHITE,
        borderRadius: 16,
        padding: 20,
        width: '90%',
        maxWidth: 400,
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
        color: COLORS.BLUE,
    },
    closeButton: {
        padding: 4,
    },
    settingsContainer: {
        gap: 20,
    },
    settingField: {
        gap: 8,
    },
    fieldLabel: {
        fontSize: 16,
        color: COLORS.GRAY_DARK,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.GRAY_BG,
        borderRadius: 10,
        padding: 8,
    },
    adjustButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.WHITE,
        borderRadius: 20,
    },
    fieldInput: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        color: COLORS.BLUE,
        fontWeight: 'bold',
    },
    saveSettingsButton: {
        backgroundColor: COLORS.BLUE,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    saveSettingsText: {
        color: COLORS.WHITE,
        fontSize: 16,
        fontWeight: 'bold',
    },
    imageSection: {
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.WHITE + '40',
        paddingTop: 12,
    },
    imageContainer: {
        width: '100%',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    questionImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
    },
    imageActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 8,
        gap: 12,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    imageActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    imageActionText: {
        color: COLORS.WHITE,
        fontSize: 14,
    },
    addImageButton: {
        width: '100%',
        height: 100,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: COLORS.WHITE + '60',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    addImageText: {
        color: COLORS.WHITE,
        marginTop: 8,
        fontSize: 14,
    },
    questionSettingsCard: {
        backgroundColor: COLORS.WHITE,
        borderRadius: 8,
        marginBottom: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    questionSettingsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    explanationContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.GRAY_LIGHT,
    },
    explanationLabel: {
        fontSize: 14,
        color: COLORS.GRAY_DARK,
        marginBottom: 4,
    },
    explanationText: {
        fontSize: 14,
        color: COLORS.BLACK,
        lineHeight: 20,
    },
    explanationInput: {
        borderWidth: 1,
        borderColor: COLORS.GRAY_LIGHT,
        borderRadius: 8,
        padding: 12,
        minHeight: 120,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 20,
        gap: 12,
    },
    clearButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: COLORS.RED + '10',
    },
    clearButtonText: {
        color: COLORS.RED,
        fontSize: 16,
        fontWeight: '500',
    },
    saveButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        backgroundColor: COLORS.BLUE,
    },
    saveButtonText: {
        color: COLORS.WHITE,
        fontSize: 16,
        fontWeight: 'bold',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    switchLabel: {
        fontSize: 14,
        color: COLORS.GRAY_DARK,
    },
    explanationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.BLUE,
        padding: 12,
        borderRadius: 8,
        gap: 4,
        textAlign:'center'
    },
    explanationButtonText: {
        color: COLORS.WHITE,
        fontSize: 14,
        fontWeight: '500',
        textAlign:'center'
    },
    addOptionButton: {
        borderRadius: 10,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: COLORS.BLUE,
        padding: 16,
        marginBottom: 26
    },
    addOptionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    addOptionText: {
        color: COLORS.BLUE,
        fontSize: 16,
        fontWeight: '500',
    },
    optionContentContainer: {
        gap: 8,
    },
    optionInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    imageButton: {
        padding: 8,
        backgroundColor: COLORS.WHITE,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionImageContainer: {
        position: 'relative',
        marginTop: 8,
    },
    optionImage: {
        width: '100%',
        height: 120,
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: -12,
        right: -12,
        backgroundColor: COLORS.WHITE,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

export default CreateQuestion;
