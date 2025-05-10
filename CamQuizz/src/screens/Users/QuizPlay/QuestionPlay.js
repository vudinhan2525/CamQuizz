import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constant/colors';
import SCREEN from '../../../screens';
import Ranking from './Ranking'; 
// navigation.navigate(SCREEN.QUESTION_PLAY, {
//     duration: 60,
//     isHost: true,
//     multipleCorrect: false,
//     question: 'What is the capital of France?',
//     answers: ['Paris', 'London', 'Berlin', 'Madrid'],
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
                                onPress={() => navigation.navigate(SCREEN.QUESTION_SETTING )}
                            >
                                <Ionicons name="settings-outline" size={24} color={COLORS.WHITE} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        <Text style={styles.question}>{route.params.question}</Text>
                        <View style={styles.answersList}>
                            {route.params.answers.map((answer, index) => (
                                <TouchableOpacity 
                                    key={index}
                                    style={styles.answerItem}
                                    onPress={() => handleAnswerSelect(index)}
                                >
                                    <Text style={styles.answerText}>{answer}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

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
                                onPress={handleEndQuestion}
                            >
                                <Text style={styles.buttonText}>End</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.footerButton}
                                onPress={handleNextQuestion}
                            >
                                <Text style={styles.buttonText}>Next</Text>
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
        padding: 16,
    },
    question: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    answersList: {
        gap: 10,
    },
    answerItem: {
        padding: 16,
        backgroundColor: COLORS.GRAY_LIGHT,
        borderRadius: 8,
    },
    answerText: {
        fontSize: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.GRAY_LIGHT,
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