import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constant/colors';
import SCREENS from '../../../screens';
import Ranking from './Ranking'; 
// navigation.navigate(SCREEN.QUESTION_PLAY, {
//     duration: 60,
//     isHost: true,
//     multipleCorrect: false,
//     question: 'What is the capital of France?',
//     questionImage: 'https://example.com/paris.jpg', // optional
//     answers: [
//         { text: 'Paris', image: 'https://example.com/paris.jpg' },
//         { text: 'London', image: 'https://example.com/london.jpg' },
//         { text: 'Berlin', image: null },
//         { text: 'Madrid', image: null }
//     ],
//     showRankingAfterEnd: true,         
//     rankingDisplayTime: 10  
// });

const QuestionPlay = ({ navigation, route }) => {
    const [timeLeft, setTimeLeft] = useState(route.params.duration);
    const [isPaused, setIsPaused] = useState(false);
    const [showRanking, setShowRanking] = useState(false);
    const isHost = route.params.isHost;
    
    // Mock data for ranking demonstration
    const mockRankingData = [
        { id: 1, name: 'User 1', newScore: 100, oldScore: 80, isCorrect: true },
        { id: 2, name: 'User 2', newScore: 90, oldScore: 95, isCorrect: false },
        // Add more mock data as needed
    ];
    const handleEndQuestion = () => {
        navigation.navigate(SCREENS.ENDQUIZ, {
        quizId:"12345",
        finalRanking: [
            { id: 'u1', name: 'Nguyễn Văn A', score: 85 },
            { id: 'u2', name: 'Trần Thị B', score: 75 },
            { id: 'u3', name: 'Lê Văn C', score: 60 },
            { id: 'u4', name: 'Phạm Thị D', score: 50 },
            { id: 'u5', name: 'Nguyễn Văn E', score: 40 },
        ]
        });

    }
    const handleNextQuestion = () => {
    }
    const handleAnswerSelect = (index) => {

    }
    useEffect(() => {
        let timer;
        if (!isPaused && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleTimeUp();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [timeLeft, isPaused]);

    const handleTimeUp = () => {
        // Kiểm tra settings từ route params
        const { showRankingAfterEnd = true, rankingDisplayTime = 5 } = route.params;
        
        if (showRankingAfterEnd) {
            setShowRanking(true);
            // Tự động ẩn ranking sau thời gian hiển thị
            setTimeout(() => {
                setShowRanking(false);
                if (isHost) {
                    // Chuyển sang câu hỏi tiếp theo hoặc kết thúc
                    handleNextQuestion();
                }
            }, rankingDisplayTime * 1000);
        } else {
            if (isHost) {
                handleNextQuestion();
            }
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const renderQuestion = () => (
        <View style={styles.questionContainer}>
            <Text style={styles.question}>{route.params.question}</Text>
            {route.params.questionImage && (
                <Image
                    source={{ uri: route.params.questionImage }}
                    style={styles.questionImage}
                    resizeMode="contain"
                />
            )}
        </View>
    );

    const renderAnswer = (answer, index) => (
        <TouchableOpacity 
            key={index}
            style={styles.answerItem}
            onPress={() => handleAnswerSelect(index)}
        >
            <View style={styles.answerContent}>
                <Text style={styles.answerText}>{answer.text}</Text>
                {answer.image && (
                    <Image
                        source={{ uri: answer.image }}
                        style={styles.answerImage}
                        resizeMode="cover"
                    />
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {showRanking ? (
                <Ranking 
                    users={mockRankingData}
                    displayTime={route.params.rankingDisplayTime || 5}
                />
            ) : (
                <>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.questionInfo}>
                            <Text style={styles.questionType}>
                                {route.params.multipleCorrect ? 'Multiple Answer' : 'Single Answer'}
                            </Text>
                            <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
                        </View>
                        {isHost && (
                            <TouchableOpacity 
                                style={styles.settingButton}
                                onPress={() => navigation.navigate(SCREENS.QUESTION_PLAY_SETTING )}
                            >
                                <Ionicons name="settings-outline" size={24} color={COLORS.WHITE} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Content */}
                    <ScrollView 
                        style={styles.content}
                        contentContainerStyle={styles.contentContainer}
                    >
                        {renderQuestion()}
                        <View style={styles.answersList}>
                            {route.params.answers.map((answer, index) => 
                                renderAnswer(answer, index)
                            )}
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    {isHost && (
                        <View style={styles.footer}>
                            <TouchableOpacity 
                                style={styles.footerButton}
                                onPress={() => setIsPaused(!isPaused)}
                            >
                                <Ionicons 
                                    name={isPaused ? "play" : "pause"} 
                                    size={24} 
                                    color={COLORS.WHITE} 
                                />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.footerButton}
                                onPress={handleNextQuestion}
                            >
                                <Text style={styles.buttonText}>Next</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.footerButton}
                                onPress={handleEndQuestion}
                            >
                                <Text style={styles.buttonText}>End</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </>
            )}
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
        backgroundColor: COLORS.BLUE,
    },
    questionInfo: {
        flex: 1,
    },
    questionType: {
        color: COLORS.WHITE,
        fontSize: 16,
        fontWeight: 'bold',
    },
    timer: {
        color: COLORS.WHITE,
        fontSize: 24,
        fontWeight: 'bold',
    },
    settingButton: {
        padding: 8,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
    },
    questionContainer: {
        marginBottom: 20,
    },
    question: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    questionImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginTop: 10,
    },
    answersList: {
        gap: 10,
    },
    answerItem: {
        backgroundColor: COLORS.WHITE,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.BLUE,
    },
    answerContent: {
        padding: 16,
    },
    answerText: {
        fontSize: 16,
        marginBottom: answer => answer.image ? 10 : 0,
    },
    answerImage: {
        width: '100%',
        height: 120,
        borderRadius: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.GRAY_BG,
    },
    footerButton: {
        backgroundColor: COLORS.BLUE,
        padding: 12,
        borderRadius: 8,
        minWidth: 100,
        alignItems: 'center',
    },
    buttonText: {
        color: COLORS.WHITE,
        fontWeight: 'bold',
    },
});

export default QuestionPlay;