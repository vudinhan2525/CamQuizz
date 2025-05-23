import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHubConnection } from '../../../contexts/SignalRContext';
import COLORS from '../../../constant/colors';
import SCREENS from '../../../screens';
import Ranking from './Ranking';
import SettingsModal from './SettingsModal';
import Toast from 'react-native-toast-message';

const QuestionPlay = ({ navigation, route }) => {
    const {
        questionId,
        question,
        duration,
        answers,
        roomId,
        userId,
        multipleCorrect,
        totalQuestions,
        quizId,
        questionImage,
        playerList,
        trueAnswer,
        showRankObj: initialShowRankObj, // Add this line
    } = route.params;
    const { hubConnection } = useHubConnection();
    const [timeLeft, setTimeLeft] = useState(route.params.duration);
    const [isPaused, setIsPaused] = useState(false);
    const [showRanking, setShowRanking] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(questionId);
    const [players, setPlayers] = useState(playerList);
    const [showRankObj, setShowRankObj] = useState(initialShowRankObj || { show: true, time: 1 });
    const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
    const isHost = route.params.isHost;


    // Update useEffect for SignalR event handlers
    useEffect(() => {
        if (hubConnection) {
            const handlers = {
                timerUpdate: handleTimerUpdate,
                questionStarting: handleQuestionStarting,
                questionStarted: handleQuestionStarted,
                showingResult: handleShowingResult,
                showingRanking: handleShowingRanking,
                updateRanking: handleUpdateRanking,
                playerAnswered: handlePlayerAnswered,
                doneQuestion: handleDoneQuestion,
                doneQuiz: handleDoneQuiz,
                error: handleError,
                timerPaused: handleTimerPaused,
                timerResumed: handleTimerResumed,
                timerResuming: handleTimerResuming,
            };

            // Register all handlers
            Object.entries(handlers).forEach(([event, handler]) => {
                hubConnection.on(event, handler);
            });
            return () => {
                if (hubConnection) {
                    Object.keys(handlers).forEach(event => {
                        hubConnection.off(event);
                    });
                }
            };

        }
    }, [hubConnection]);

    // Add these handler functions
    const handleTimerUpdate = (data) => {
        if (data.RoomId === roomId) {
            setTimeLeft(data.TimeRemaining);
        }
    };

    const handleQuestionStarting = () => {
        // You can add animation or loading state here
        console.log('Question starting...');
    };

    const handleQuestionStarted = () => {
        setShowRanking(false);
        setSelectedAnswers([]);
    };

    const handleShowingResult = (result) => {
        const { QuestionId, TrueAnswer, YourAnswer, Duration } = result;
        // Add visual feedback for correct/wrong answers
        setSelectedAnswers([]); // Clear selected answers
        // You can add animation or visual feedback here
    };

    const handleShowingRanking = () => {
        setShowRanking(true);
    };

    const handleUpdateRanking = (ranking) => {
        setPlayers(ranking.map(r => ({
            id: r.UserId,
            name: r.Name,
            newScore: r.Score,
            oldScore: players.find(p => p.id === r.UserId)?.Score || 0,
            isCorrect: r.Score > (players.find(p => p.id === r.UserId)?.Score || 0),
        })));
    };

    const handlePlayerAnswered = (data) => {
        // Show toast or notification that a player has answered
        Toast.show({
            type: 'info',
            text1: 'Player Answered',
            text2: `${data.PlayerName} has submitted an answer`,
            position: 'top',
            visibilityTime: 2000,
        });
    };

    const handleDoneQuiz = (result) => {
        console.log('Quiz ended:', result);
        const updatedPlayer = updateRanking(result)
        navigation.replace(SCREENS.ENDQUIZ, {
            quizId: result.QuizId,
            finalRanking: updatedPlayer,
        });
    };

    const handleError = (error) => {
        console.error('Hub error:', error);
        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error.Message || 'Something went wrong',
            position: 'top',
            visibilityTime: 3000,
        });
    };

    const handleTimerResuming = () => {
        // Show countdown or animation before timer resumes
        Toast.show({
            type: 'info',
            text1: 'Timer Resuming',
            text2: 'Get ready...',
            position: 'top',
            visibilityTime: 1000,
        });
    };
    const updateRanking = (result) => {
        const oldUsers = players.map(player => ({
            ...player,

            oldScore: player.Score || 0, // Add fallback for undefined Score
        }));
        const sortedRanking = [...result.Ranking].sort((a, b) => b.Score - a.Score);
        const updatedUsers = sortedRanking.map(r => {
            const old = oldUsers.find(u => u.id === r.UserId) || { oldScore: 0 };
            return {
                id: r.UserId,
                name: r.Name,
                newScore: r.Score,
                oldScore: old.oldScore,
                // Fix the isCorrect check
                isCorrect: r.Score > old.oldScore,
            };
        });
        return updatedUsers
    }
    const handleDoneQuestion = (result) => {
        console.log('Received doneQuestion event:', result);


        if (!result.IsLastResult && result.Ranking) {
            const updatedUsers = updateRanking(result)
            setPlayers(updatedUsers);

            if (showRankObj.show) {
                setShowRanking(true);
            } else {
                // Show toast notification with score and rank
                const currentPlayer = updatedUsers.find(u => u.id === userId);
                const playerRank = updatedUsers.findIndex(u => u.id === userId) + 1;

                Toast.show({
                    type: currentPlayer.isCorrect ? 'success' : 'error',
                    text1: currentPlayer.isCorrect ? 'Correct Answer!' : 'Wrong Answer',
                    text2: `Score: ${currentPlayer.newScore} | Rank: #${playerRank}`,
                    position: 'top',
                    visibilityTime: 2000,
                });
            }
        }
        setSelectedAnswers([]);
        setTimeLeft(duration);

        setTimeout(() => {
            setShowRanking(false);

            if (result.NextQuestion) {
                navigation.replace(SCREENS.QUESTION_PLAY, {
                    questionId: currentQuestion + 1,
                    question: result.NextQuestion.Name,
                    duration: result.NextQuestion.TimeLimit,
                    answers: result.NextQuestion.Options.map(opt => ({
                        text: opt.Content,
                        label: opt.Label,
                    })),
                    isHost,
                    roomId,
                    userId,
                    multipleCorrect,
                    quizId,
                    playerList: players,
                    totalQuestions,
                    showRankObj: showRankObj,
                });
            } else {

                const updatedUsers = updateRanking(result)

                navigation.replace(SCREENS.ENDQUIZ, {
                    quizId: result.QuizId,
                    finalRanking: updatedUsers,
                });
            }
        },
            // (route.params.rankingDisplayTime || 5) * 1000);
            1000);

    };


    const handleTimerPaused = (data) => {
        if (data.RoomId === roomId) {
            setIsPaused(true);
            setTimeLeft(data.TimeRemaining);
        }
    };

    const handleTimerResumed = (data) => {
        if (data.RoomId === roomId) {
            setIsPaused(false);
            setTimeLeft(data.TimeRemaining);
        }
    };
    const handleAnswerSelect = (index) => {
        const answer = answers[index].label;
        let newSelectedAnswers;

        if (multipleCorrect) {
            newSelectedAnswers = selectedAnswers.includes(answer)
                ? selectedAnswers.filter(a => a !== answer)
                : [...selectedAnswers, answer];
        } else {
            newSelectedAnswers = [answer];
        }

        setSelectedAnswers(newSelectedAnswers);

        if (hubConnection) {
            hubConnection.invoke('SubmitAnswer', {
                roomId,
                userId,
                questionId: currentQuestion,
                answer: newSelectedAnswers
            }).catch(err => {
                console.error('Error submitting answer:', err);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to submit answer',
                    position: 'top',
                    visibilityTime: 2000,
                });
            });
        }
    };

    const handleNextQuestion = () => {
        if (hubConnection && isHost) {
            hubConnection.invoke('NextQuestion', {
                roomId,
                userId,
            }).catch(err => {
                console.error('Error requesting next question:', err);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to move to next question',
                    position: 'top',
                    visibilityTime: 2000,
                });
            });
        }
    };

    const toggleTimer = () => {
        if (!hubConnection || !isHost) return;

        const request = {
            roomId,
            userId,
            showRanking: showRankObj.show
        };

        if (isPaused) {
            hubConnection.invoke('ResumeTimer', request)
                .catch(err => console.error('Error resuming timer:', err));
        } else {
            hubConnection.invoke('PauseTimer', request)
                .catch(err => console.error('Error pausing timer:', err));
        }
    };

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
        if (isHost && currentQuestion < totalQuestions) {
            handleNextQuestion();
        }
    };
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSettingsChange = (newSettings) => {
        setShowRankObj(newSettings);
        setIsSettingsModalVisible(false);
    };

    const renderQuestion = () => (
        <View style={styles.questionContainer}>
            <Text style={styles.question}>{question}</Text>
            {questionImage && (
                <Image
                    source={{ uri: questionImage }}
                    style={styles.questionImage}
                    resizeMode="contain"
                />
            )}
        </View>
    );

    const renderAnswer = (answer, index) => (
        <TouchableOpacity
            key={index}
            style={[
                styles.answerItem,
                selectedAnswers.includes(answer.label) && styles.selectedAnswer
            ]}
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
                    users={players}
                />
            ) : (
                <>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.questionInfo}>
                            {/* <Text style={styles.questionType}>
                                {route.params.multipleCorrect ? 'Multiple Answer' : 'Single Answer'}
                            </Text> */}
                            <Text style={styles.questionType}>
                                {currentQuestion} / {totalQuestions}
                            </Text>
                            <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
                        </View>
                        {isHost && (
                            <TouchableOpacity
                                style={styles.settingButton}
                                onPress={() => setIsSettingsModalVisible(true)}
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
                                onPress={() => toggleTimer()}
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
                            {/* <TouchableOpacity 
                                style={styles.footerButton}
                                onPress={handleEndQuestion}
                            >
                                <Text style={styles.buttonText}>End</Text>
                            </TouchableOpacity> */}
                        </View>
                    )}
                </>
            )}
            <SettingsModal
                visible={isSettingsModalVisible}
                onClose={() => setIsSettingsModalVisible(false)}
                settings={showRankObj}
                onSettingsChange={handleSettingsChange}
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
    selectedAnswer: {
        backgroundColor: COLORS.LIGHT_BLUE,
        borderColor: COLORS.BLUE,
        borderWidth: 2,
    },
});

export default QuestionPlay;