import React from 'react';
import { ScrollView,View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constant/colors';

const QuestionItem = ({ question, index, onEdit }) => {
    return (
        <View style={[styles.page, {width: '100%'}]}>
            <ScrollView 
                style={styles.innerContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.questionHeader}>
                    <View style={styles.questionNumberBox}>
                        <Text style={styles.questionNumber}>{index + 1}</Text>
                    </View>
                    <Text style={styles.points}>{question.duration}s</Text>
                    <Text style={styles.points}>• {question.points} Điểm</Text>
                    <TouchableOpacity 
                        style={styles.editButton}
                        onPress={() => onEdit(question.id)}
                    >
                        <Ionicons name="create-outline" size={24} color={COLORS.BLUE} />
                    </TouchableOpacity>
                </View>

                <View style={styles.questionContent}>
                    <Text style={styles.questionText}>{question.question}</Text>
                    {question.questionImage && (
                        <View style={styles.imageContainer}>
                            <Image 
                                source={{ uri: question.questionImage }} 
                                style={styles.questionImage}
                                resizeMode="cover"
                            />
                        </View>
                    )}
                </View>

                <View style={styles.options}>
                    {question.options.map((opt) => (
                        <View
                            key={opt.id}
                            style={[
                                styles.optionButton,
                                { borderColor: opt.isCorrect ? COLORS.GREEN : COLORS.RED }
                            ]}
                        >
                            <Text style={styles.optionText}>{opt.text}</Text>
                            {opt.image && (
                                <Image 
                                    source={{ uri: opt.image }} 
                                    style={styles.optionImage}
                                    resizeMode="contain"
                                />
                            )}
                            <Ionicons 
                                name={opt.isCorrect ? "checkmark-circle" : "close-circle"} 
                                size={24} 
                                color={opt.isCorrect ? COLORS.GREEN : COLORS.RED} 
                                style={styles.icon}
                            />
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: COLORS.WHITE,
        marginHorizontal: 10,
        marginVertical: 10,
    },
    innerContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 10,
        backgroundColor: COLORS.WHITE,
    },
    questionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        justifyContent: 'space-between',
    },
    questionNumberBox: {
        width: 40,
        height: 40,
        backgroundColor: COLORS.BLUE,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    questionNumber: {
        color: COLORS.WHITE,
        fontSize: 18,
        fontWeight: 'bold',
    },
    points: {
        fontSize: 14,
        color: '#666',
        flex: 1,
        marginLeft: 10,
        flexGrow: 1,
    },
    editButton: {
        padding: 8,
        marginLeft: 10,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
    },
    optionText: {
        flex: 1,
        marginLeft: 10,
    },
    optionImage: {
        width: 40,
        height: 40,
        borderRadius: 8,
    },
    icon: {
        marginLeft: 10,
    },
    questionContent: {
        marginBottom: 20,
        width: '100%',
    },
    questionText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    imageContainer: {
        marginTop: 10,
        width: '100%',
        height: 200,
        borderRadius: 8,
        overflow: 'hidden',
    },
    questionImage: {
        width: '100%',
        height: '100%',
    },
    options: {
        width: '100%',
    },
});

export default QuestionItem;
