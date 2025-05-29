import React, { useState, useEffect, use } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import COLORS from '../../../constant/colors';
import SCREENS from '../../../screens';
import { useHubConnection } from '../../../contexts/SignalRContext';
import AsyncStorageService from '../../../services/AsyncStorageService';
import QuizzService from '../../../services/QuizzService';
import SettingsModal from './SettingsModal';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
const Lobby = ({ navigation, route }) => {
    const { quizId, isHost = false, roomCode, playerList } = route.params;
    const { hubConnection } = useHubConnection();
    const [players, setPlayers] = useState();
    const [quiz, setQuiz] = useState(null);
    const [showRankObj, setShowRankObj] = useState({ show: true, time: 1 });
    const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        updatePlayerList(playerList);
    }, [])


    const updatePlayerList = async (playerList) => {
        const userId = await AsyncStorageService.getUserId();
        setUserId(userId);
        const updatedPlayers = playerList.map(player => {
            if (player.Id === userId) {
                return { ...player, isCurrentPlayer: true };
            }
            return { ...player, isCurrentPlayer: false };
        });
        setPlayers(updatedPlayers);
    };

    useEffect(() => {
        if (!hubConnection) return;

        const handlePlayerLeft = async (updatedRoom) => {
            console.log("Player left, updated room:", updatedRoom);
            updatePlayerList(updatedRoom.PlayerList);

            // If current user is new host
            const userId = await AsyncStorageService.getUserId();
            if (updatedRoom.HostId === userId) {
                navigation.setParams({ isHost: true });
            }
        };

        const handleGameStarted = async (data) => {
            try {
                console.log("Game started:", data);
                 // Set loading state to true

                const userId = await AsyncStorageService.getUserId();    

                // Navigate to QuestionPlay after loading
                navigation.navigate(SCREENS.QUESTION_PLAY, {
                    questionId: 1,
                    question: data.firstQuestion.Name,
                    duration: data.firstQuestion.TimeLimit,
                    answers: data.firstQuestion.Options.map(opt => ({
                        text: opt.Content,
                        label: opt.Label,
                        image: opt.Image,
                    })),
                    isHost,
                    roomId: data.RoomId,
                    questionImage: data.firstQuestion.Image,
                    userId: userId,
                    multipleCorrect: false,
                    totalQuestions: quiz.question_num,
                    quizId: quiz.id,
                    playerList: players,
                    trueAnswer: data.firstQuestion.TrueAnswer,
                    showRankObjj: showRankObj, // Add this line
                });

                setIsLoading(false); // Reset loading state after navigation
            } catch (error) {
                console.error("Error starting game:", error);
                setIsLoading(false); // Reset loading state on error
                Alert.alert("Lỗi", "Không thể bắt đầu trò chơi. Vui lòng thử lại!");
            }
        };
        const handlePlayerJoined = (room) => {
            console.log("Player joined, updated room:", room);
            updatePlayerList(room.PlayerList);
        };
        const handleError = (error) => {
            console.error("Hub error:", error);
            Alert.alert("Lỗi", error.Message);
        };

        hubConnection.on("playerJoined", handlePlayerJoined);
        hubConnection.on("playerLeft", handlePlayerLeft);
        hubConnection.on("gameStarted", handleGameStarted);
        hubConnection.on("error", handleError);
        hubConnection.on("showRankingUpdated", handleShowRankingUpdated);
        return () => {
            hubConnection.off("playerLeft", handlePlayerLeft);
            hubConnection.off("gameStarted", handleGameStarted);
            hubConnection.off("error", handleError);
            hubConnection.off("playerJoined", handlePlayerJoined);
        };
    }, [hubConnection, quiz, showRankObj]);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                console.log('Fetching quiz data for quizId:', quizId);
                const quizData = await QuizzService.getQuizzById(quizId);
                console.log('Fetched quiz data:', quizData);
                if (quizData) {
                    setQuiz(
                        {
                            id: quizId,
                            title: quizData.name,
                            author: quizData.author,
                            attended_num: quizData.number_of_attended,
                            question_num: quizData.number_of_questions,
                            duration: quizData.duration,
                        }
                    );
                } else {
                    console.error('Quiz not found');
                }
            } catch (error) {
                console.error('Error fetching quiz:', error);
            }
        };
        fetchQuiz();
    }, [quizId]);

    const handleShowRankingUpdated = (data) => {
        console.log("Show ranking updated:", data);
        if (data.RoomId === roomCode && !isHost) {
            setShowRankObj({
                show: data.ShowRanking,
                time: 1
            });
        }
    }
    const handleStartGame = async () => {
        try {
            setIsLoading(true);
            await hubConnection.invoke("StartGame", {
                roomId: roomCode,
                showRanking: showRankObj.show,
            });
           
        } catch (error) {
            console.error("Error starting game:", error);
            Alert.alert("Lỗi", "Không thể bắt đầu trò chơi. Vui lòng thử lại!");
        }
    };

    const handleLeaveRoom = () => {
        Alert.alert(
            'Xác nhận',
            'Bạn có chắc muốn rời khỏi phòng chơi?',
            [
                {
                    text: 'Hủy',
                    style: 'cancel'
                },
                {
                    text: 'Rời phòng',
                    onPress: async () => {
                        try {
                            if (hubConnection && hubConnection.state === 'Connected') {
                                await hubConnection.invoke('LeaveRoom', {
                                    roomId: roomCode,
                                    userId: userId
                                });

                                navigation.reset({
                                    index: 0,
                                    routes: [
                                        {
                                            name: SCREENS.USER_TAB,
                                            state: {
                                                index: 0,
                                                routes: [{ name: SCREENS.EXPLORE_TAB }]
                                            }
                                        }
                                    ],
                                });
                            } else {
                                throw new Error('Không có kết nối đến máy chủ');
                            }
                        } catch (error) {
                            console.error('Error leaving room:', error);
                            Alert.alert(
                                'Lỗi',
                                'Không thể rời khỏi phòng. Vui lòng thử lại!'
                            );
                        }
                    }
                }
            ]
        );
    };

    const handleCopyCode = async () => {
        try {
            await Clipboard.setStringAsync(roomCode);

            Toast.show({
                type: 'success',
                text1: 'Đã sao chép',
                text2: `Mã phòng: ${roomCode}`,
                position: 'top',
                visibilityTime: 500,
            });
        } catch (err) {
            console.error('Clipboard error:', err);
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Không thể sao chép mã phòng',
                position: 'top',

            });
        }
    };




    const renderPlayersList = () => (
        <View style={styles.playersContainer}>
            <View style={styles.playersList}>
                {players && players.map((player, index) => (
                    <View
                        key={player.Id}
                        style={[
                            styles.playerItem,
                            player.isCurrentPlayer && styles.currentPlayerItem
                        ]}
                    >
                        <View style={styles.playerAvatar}>
                            {player.Avatar ? (
                                <Image
                                    source={{ uri: player.Avatar }}
                                    style={styles.avatarImage}
                                />
                            ) : (
                                <Ionicons
                                    name="person-circle-outline"
                                    size={40}
                                    color={COLORS.BLUE}
                                />
                            )}
                        </View>
                        <Text
                            style={styles.playerName}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {player.isCurrentPlayer ? 'Bạn' : player.Name}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );

    const handleSettingsChange = (newSettings) => {
        setShowRankObj(newSettings);
        setIsSettingsModalVisible(false);
    };

    return (
        <View style={styles.container}>

                
            {/* Existing UI components */}
            <View style={styles.headerWithBack}>
                <Text style={styles.title}>Phòng chờ</Text>
                {isHost && (
                    <TouchableOpacity
                        style={styles.settingButton}
                        onPress={() => setIsSettingsModalVisible(true)}
                    >
                        <Ionicons name="settings-outline" size={24} color={COLORS.BLUE} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Quiz Info */}
            {quiz && (
                <View style={styles.quizInfoContainer}>
                    <Text style={styles.quizTitle}>{quiz.title}</Text>
                    <Text style={styles.quizAuthor}>Tác giả: {quiz.author}</Text>
                    <Text style={styles.quizAuthor}>Số câu hỏi: {quiz.question_num}</Text>
                    <Text style={styles.quizAuthor}>Thời gian: {quiz.duration} giây</Text>
                </View>

            )}

            {/* Room Code */}
            <View style={styles.codeContainer}>
                <Text style={styles.codeLabel}>Mã phòng:</Text>
                <Text style={styles.codeValue}>{roomCode}</Text>
                <TouchableOpacity
                    style={styles.copyButton}
                    onPress={handleCopyCode}
                >
                    <Ionicons name="copy-outline" size={20} color={COLORS.BLUE} />
                </TouchableOpacity>
            </View>

            {/* Player Count */}
            <View style={styles.playerCountContainer}>
                <Ionicons name="people" size={24} color={COLORS.BLUE} />
                <Text style={styles.playerCount}> {players && players.length} người chơi</Text>
            </View>

            {/* Players Grid */}
            {renderPlayersList()}

            {/* Start Button (only for host) */}
            {isHost ? (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleLeaveRoom}
                    >
                        <Text style={styles.cancelButtonText}>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={!isLoading?styles.startButton: styles.loadingButton}
                        onPress={handleStartGame}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Text style={styles.startButtonText}>Đang tải</Text>
                        ) : (
                            <Text style={styles.startButtonText}>Bắt đầu</Text>
                        )}
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.playerButtonContainer}>
                    <View style={styles.waitingContainer}>
                        <Text style={styles.waitingText}>Đang chờ chủ phòng bắt đầu...</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.exitButton}
                        onPress={handleLeaveRoom}
                    >
                        <Text style={styles.exitButtonText} >Thoát</Text>
                    </TouchableOpacity>
                </View>
            )}
        
            {/* Add the SettingsModal component before the closing View tag */}
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
    headerWithBack: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Change this from space-around
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    backButton: {
        padding: 8,
    },
    placeholder: {
        width: 40,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.BLUE,
    },
    quizInfoContainer: {
        padding: 16,
        alignItems: 'center',
    },
    quizTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    quizAuthor: {
        fontSize: 14,
        color: COLORS.GRAY_DARK,
        marginTop: 4,
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: COLORS.BLUE_LIGHT,
        marginHorizontal: 16,
        borderRadius: 8,
    },
    codeLabel: {
        fontSize: 16,
        marginRight: 8,
    },
    codeValue: {
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    copyButton: {
        padding: 8,
        marginLeft: 8,
    },
    playerCountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    playerCount: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
        marginLeft: 8,
    },
    viewAllButton: {
        padding: 8,
    },
    viewAllText: {
        color: COLORS.BLUE,
        fontWeight: '500',
    },
    playersContainer: {
        flex: 1,
        padding: 16,
    },
    playersList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    playerItem: {
        margin: 8,
        padding: 12,
        backgroundColor: COLORS.GRAY_LIGHT,
        borderRadius: 12,
        minWidth: 100,
        maxWidth: '45%',
        alignItems: 'center',
        flexDirection: 'row',
    },
    currentPlayerItem: {
        backgroundColor: COLORS.BLUE_LIGHT,
        borderWidth: 1,
        borderColor: COLORS.BLUE,
    },
    playerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.WHITE,
    },
    avatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    playerName: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.GRAY_DARK,
    },
    buttonContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.GRAY_BG,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    playerButtonContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.GRAY_LIGHT,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    startButton: {
        backgroundColor: COLORS.BLUE,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        flex: 2,
        marginLeft: 10,
    },
    loadingButton:{
        backgroundColor: COLORS.BLUE,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        flex: 2,
        marginLeft: 10,
        opacity: 0.5,

    },
    startButtonText: {
        color: COLORS.WHITE,
        fontWeight: 'bold',
        fontSize: 18,
    },
    cancelButton: {
        backgroundColor: COLORS.RED,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        flex: 1,
    },
    cancelButtonText: {
        color: COLORS.WHITE,
        fontWeight: 'bold',
        fontSize: 18,
    },
    exitButton: {
        backgroundColor: COLORS.RED,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        width: '50%',
        marginTop: 16,
    },
    exitButtonText: {
        color: COLORS.WHITE,
        fontWeight: 'bold',
        fontSize: 18,
    },
    waitingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    waitingText: {
        fontSize: 16,
        color: COLORS.GRAY_DARK,
        fontStyle: 'italic',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        maxHeight: '70%',
        backgroundColor: COLORS.WHITE,
        borderRadius: 12,
        padding: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    modalPlayersList: {
        maxHeight: '90%',
    },
    modalPlayerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.GRAY_LIGHT,
    },
    modalPlayerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    modalPlayerName: {
        flex: 1,
        fontSize: 16,
    },
    kickButton: {
        padding: 8,
    },
    settingButton: {
        padding: 8,
        marginLeft: 8,
    },
});

export default Lobby;