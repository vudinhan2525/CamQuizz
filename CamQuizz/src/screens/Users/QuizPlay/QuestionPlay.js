import React, { useState, useEffect, use } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
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
        showRankObjj, // Add this line
    } = route.params;
    const { hubConnection } = useHubConnection();
    const [timeLeft, setTimeLeft] = useState(route.params.duration);
    const [isPaused, setIsPaused] = useState(false);
    const [showRanking, setShowRanking] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(questionId);
    const [players, setPlayers] = useState(playerList);
    const [showRankObj, setShowRankObj] = useState(showRankObjj);
    const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
    const isHost = route.params.isHost;
    const [trueAnswers, setTrueAnswers] = useState();
    const [isAnswered, setIsAnswered] = useState(false);
    const [urRank, setUrRank] = useState(route.params.urRank || {
        rank: 0,
        point: 0,
    });
    // Update the handlers for SignalR events
    useEffect(() => {
        if (hubConnection) {
            // Register event handlers
            const handlers = {
                'TimeUpdate': handleTimerUpdate,
                'QuestionStarting': handleQuestionStarting,
                'QuestionStarted': handleQuestionStarted,
                'ShowingResult': handleShowingResult,
                'UpdateRanking': handleUpdateRanking,
                'PlayerAnswered': handlePlayerAnswered,
                'DoneQuestion': handleDoneQuestion,
                'DoneQuiz': handleDoneQuiz,
                'Error': handleError,
                'TimerPaused': handleTimerPaused,
                'TimerResumed': handleTimerResumed,
                'TimerResuming': handleTimerResuming,
                'ShowRankingUpdated': handleShowRankingUpdated,
            };

            Object.entries(handlers).forEach(([event, handler]) => {
                hubConnection.on(event, handler);
            });

            // Cleanup on unmount

        }
    }, [hubConnection]);
    useEffect(() => {
        console.log("urrank", route.params.urRank);
    },[]);
    const handleShowRankingUpdated = (data) => {
        if (data.RoomId === roomId && !isHost) {
            setShowRanking(data.ShowRanking);
            setShowRankObj({
                show: data.ShowRanking,
                time: 1
            });
        }
    }
    const handleTimerUpdate = (data) => {
        if (data.RoomId === roomId) {
            setTimeLeft(data.TimeRemaining);
        }
    };

    const handleQuestionStarting = () => {
    };

    const handleQuestionStarted = () => {
        setShowRanking(false);
        setSelectedAnswers([]);
    };

    const handleShowingResult = (result) => {
        const { QuestionId, TrueAnswer, YourAnswer, Duration, Explain } = result;
        console.log('Showing result:', result);
        setTrueAnswers(TrueAnswer || []);
        const userAnswer = YourAnswer[userId] || [];
        const isCorrect = userAnswer.length > 0 &&
            userAnswer.every(a => TrueAnswer.includes(a)) &&
            userAnswer.length === TrueAnswer.length;

        Toast.show({
            type: isCorrect ? 'success' : 'error',
            text1: isCorrect ? 'Chính xác!' : 'Sai!',
            text2: `Đáp án đúng: ${TrueAnswer.join(', ')}\nGiải thích: ${Explain || 'Không có giải thích'}`,
            position: 'top',
            visibilityTime: Duration,
        });
    };

    const handleUpdateRanking = (ranking) => {
        console.log('Update ranking:');
        const updatedPlayers = ranking.map(r => ({
            id: r.UserId,
            name: r.Name,
            newScore: r.Score,
            oldScore: players.find(p => p.id === r.UserId)?.Score || 0,
            isCorrect: r.Score > (players.find(p => p.id === r.UserId)?.Score || 0),
        }));

        // Update players state
        setPlayers(updatedPlayers);
        if (showRankObj?.show) {
            setShowRanking(true);
            console.log('inside:');
            // Auto hide after specified duration
            setTimeout(() => {
                setShowRanking(false);
            }, showRankObj.time * 1000);
        }

    };

    const handlePlayerAnswered = (data) => {
        // Show toast or notification that a player has answered
        console.log('Player answered:')
        Toast.show({
            type: 'info',
            text1: 'Player Answered',
            text2: `${data.PlayerName} has submitted an answer`,
            position: 'top',
            visibilityTime: 2000,
        });
    };

    const handleDoneQuiz = (result) => {
        const updatedPlayer = result.Ranking.map(r => ({
            id: r.UserId,
            name: r.Name,
            newScore: r.Score,
            oldScore: players.find(p => p.id === r.UserId)?.Score || 0,
            isCorrect: r.Score > (players.find(p => p.id === r.UserId)?.Score || 0),
        }));
        console.log('Updated player ranking:', updatedPlayer);
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
            text1: 'Thời gian tiếp tục',
            text2: 'Chuẩn bị...',
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
        const currentPlayer = updatedUsers.find(p => p.id === userId);
        const rank = updatedUsers.findIndex(p => p.id === userId) + 1;

        if (currentPlayer) {
            const rank = updatedUsers.findIndex(p => p.id === userId) + 1;
            console.log('Your rank:', rank, 'Your score:', currentPlayer.newScore);
        }
        return {updatedUsers, rank, score: currentPlayer ? currentPlayer.newScore : 0};
    }
    const handleDoneQuestion = (result) => {
        const {
            RoomId,
            QuizId,
            QuestionId,
            TrueAnswer,
            Ranking,
            NextQuestion,
            IsLastQuestion
        } = result;

        if (!RoomId || RoomId !== roomId) return;

        try {
            if (Ranking) {
                const { updatedUsers, rank , score } = updateRanking(result);
                console.log("rank", rank);
                console.log("score", score);

                setPlayers(updatedUsers);

                // Only show ranking based on settings
                if (showRankObj?.show) {
                    setShowRanking(true);

                    // Auto hide ranking after specified duration
                    handleNextQuestionNavigation(result, rank, score);
                    setTimeout(() => {
                        setShowRanking(false);
                    }, showRankObj.time * 1000-5);
                } else {
                    // Show toast immediately and proceed to next question
                    const currentPlayer = updatedUsers.find(u => u.id === userId);
                    
                    if (currentPlayer) {
                        const rank = updatedUsers.findIndex(u => u.id === userId) + 1;
                        const score = currentPlayer.newScore;
                        handleNextQuestionNavigation(result, rank, score);
                    }
                }
            }

        } catch (error) {
            console.error('Error in handleDoneQuestion:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Something went wrong processing the question',
                position: 'top',
                visibilityTime: 3000,
            });
        }
    };

    // Extract navigation logic to separate function
    const handleNextQuestionNavigation = (result, rank, score) => {
        if (result.IsLastQuestion || !result.NextQuestion) {
            // navigation.replace(SCREENS.ENDQUIZ, {
            //     quizId: result.QuizId,
            //     finalRanking: players,
            // });
            return;
        }

        if (result.NextQuestion) {
            navigation.replace(SCREENS.QUESTION_PLAY, {
                questionId: currentQuestion + 1,
                question: result.NextQuestion.Name,
                duration: result.NextQuestion.TimeLimit,
                answers: result.NextQuestion.Options.map(opt => ({
                    text: opt.Content,
                    label: opt.Label,
                    image: opt.Image,
                })),
                isHost,
                roomId,
                userId,
                multipleCorrect: result.NextQuestion.MultipleCorrect,
                quizId,
                playerList: players,
                totalQuestions,
                showRankObjj: showRankObj,
                questionImage: result.NextQuestion.Image,
                urRank:{
                    rank,
                    point: score,
                }
            });
        }
    };

    const roundedTime = (time) => {
        return Math.floor(time);
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
        if (isAnswered) return; // Prevent further selection if already answered
        if (index < 0 || index >= answers.length) return;

        try {
            const answer = answers[index].label;
            if (!answer) return;

            let newSelectedAnswers;
            if (multipleCorrect) {
                newSelectedAnswers = selectedAnswers.includes(answer)
                    ? selectedAnswers.filter(a => a !== answer)
                    : [...selectedAnswers, answer];
            } else {
                newSelectedAnswers = [answer];
            }

            setSelectedAnswers(newSelectedAnswers);
            setIsAnswered(true)

            if (hubConnection && hubConnection.state === 'Connected') {
                hubConnection.invoke('SubmitAnswer', {
                    roomId,
                    userId,
                    questionId: currentQuestion,
                    answer: newSelectedAnswers,
                    quizId: quizId,
                }).catch(err => {
                    console.error('Error submitting answer:', err);
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Failed to submit answer',
                        position: 'top',
                        visibilityTime: 2000,
                    });
                    // Revert selection on error
                    setSelectedAnswers(selectedAnswers);
                });
            }
        } catch (error) {
            console.error('Error in handleAnswerSelect:', error);
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
            showRanking: showRankObj?.show
        };

        if (isPaused) {
            hubConnection.invoke('ResumeTimer', request)
                .catch(err => {
                    console.error('Error resuming timer:', err);
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Failed to resume timer',
                        position: 'top',
                        visibilityTime: 2000,
                    });
                });
        } else {
            hubConnection.invoke('PauseTimer', request)
                .catch(err => {
                    console.error('Error pausing timer:', err);
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Failed to pause timer',
                        position: 'top',
                        visibilityTime: 2000,
                    });
                });
        }
    };
    useEffect(() => {
        let timer;
        if (!isPaused && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev == 0) {
                        if (isHost) handleTimeUp();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [timeLeft, isPaused, isHost, handleTimeUp]); // Add missing dependencies

    const handleTimeUp = () => {
        if (isHost && currentQuestion < totalQuestions) {
            handleNextQuestion();
        }
    };
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = roundedTime(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSettingsChange = (newSettings) => {
        setShowRankObj(newSettings);
        const showRanking = newSettings.show;
        if (hubConnection && hubConnection.state === 'Connected') {
            hubConnection.invoke('UpdateShowRanking',
                roomId,
                userId,
                showRanking,
            ).catch(err => {
                console.error('Error updating show ranking:', err);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to update settings',
                    position: 'top',
                    visibilityTime: 2000,
                });
            });
        }
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

    const renderAnswer = (answer, index) => {
        console.log('Selected answers:', selectedAnswers);
        const isCorrectAnswer = trueAnswers?.includes(answer.label); // Check if the answer is correct
        const isSelectedAnswer = selectedAnswers?.includes(answer.label); // Check if the answer is selected

        return (
            <TouchableOpacity
                key={index}
                style={[
                    styles.answerItem,
                    isSelectedAnswer && styles.selectedAnswer,
                    showRanking && isCorrectAnswer && styles.correctAnswer, // Highlight correct answers
                    showRanking && isSelectedAnswer && !isCorrectAnswer && styles.wrongAnswer, // Highlight wrong answers
                ]}
                onPress={() => handleAnswerSelect(index)}
                disabled={isAnswered || isPaused} // Disable selection when showing results
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
                    {isSelectedAnswer && trueAnswers && (
                        <Ionicons
                            name={isCorrectAnswer ? "checkmark-circle" : "close-circle"}
                            size={24}
                            color={isCorrectAnswer ? COLORS.GREEN : COLORS.RED}
                            style={styles.answerIcon}
                        />
                    )}
                </View>
            </TouchableOpacity>
        );
    };

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
                    <View style={styles.footer}>
                        <View style={styles.yourRanking}>
                            <Text style={styles.rankText}>#{urRank.rank} - {urRank.point}</Text>
                        </View>

                        {isHost && (
                            <>
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
                            </>
                        )}
                    </View>

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
        alignItems: 'center',
        marginHorizontal: 4,
        flex: 1,
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
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    correctAnswer: {
        borderColor: COLORS.GREEN,
        borderWidth: 2,
    },
    wrongAnswer: {
        borderColor: COLORS.RED,
        borderWidth: 2,
    },
    answerIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    yourRanking: {
        backgroundColor: COLORS.WHITE,
        padding: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.BLUE,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 4,
    },
    rankText: {
        color: COLORS.BLUE,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default QuestionPlay;