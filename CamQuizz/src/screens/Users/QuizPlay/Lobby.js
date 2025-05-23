import React, { useState, useEffect, use } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Modal, ScrollView, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import COLORS from '../../../constant/colors';
import SCREENS from '../../../screens';
import { mockPlayers, generateRoomCode, mockQuiz } from '../../../components/data/MockQuizPlayData';
import { useHubConnection } from '../../../contexts/SignalRContext';
import AsyncStorageService from '../../../services/AsyncStorageService';
import QuizzService from '../../../services/QuizzService';
import SettingsModal from './SettingsModal';

const Lobby = ({ navigation, route }) => {
    const { quizId, isHost = true, roomCode } = route.params;
    const {hubConnection } = useHubConnection();
    const [gameCode, setGameCode] = useState('');
    const [players, setPlayers] = useState(roomPlayers);
    const [quiz, setQuiz] = useState(null);
    const [showRankObj, setShowRankObj] = useState({ show: true, time: 1 });
    const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);

    useEffect(() => {
        // Nếu là host, tạo mã phòng mới
        // Nếu là người chơi, sử dụng mã phòng đã được cung cấp
        if (isHost) {
            setGameCode(generateRoomCode());
        } else {
            setGameCode(roomCode || '');
        }
        
        setPlayers(mockPlayers);
        
        setQuiz(mockQuiz);
        
        if (!isHost) {
            // Thêm người chơi hiện tại vào danh sách
            const currentPlayer = {
                id: 'current-player',
                name: 'Bạn',
                avatar: 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg',
                score: 0,
                isCurrentPlayer: true
            };
            
            setPlayers(prevPlayers => [...prevPlayers, currentPlayer]);
        }
    }, [isHost, roomCode]);

    useEffect(() => {
        if (!hubConnection) return;

        const handlePlayerLeft = async (updatedRoom) => {
            console.log("Player left, updated room:", updatedRoom);
            setPlayers(updatedRoom.PlayerList);

            // If current user is new host
            const userId = await AsyncStorageService.getUserId();
            if (updatedRoom.HostId === userId) {
                navigation.setParams({ isHost: true });
            }
        };

        const handleGameStarted = async (data) => {
            console.log("Game started:", data);
            const userId = await AsyncStorageService.getUserId();
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
                playerList:players,
                trueAnswer: data.firstQuestion.TrueAnswer,
                showRankObj: showRankObj, // Add this line
            });
        };
        const handlePlayerJoined = (room) => {
            console.log("Player joined, updated room:", room);
            setPlayers(room.PlayerList);
        };
        const handleError = (error) => {
            console.error("Hub error:", error);
            Alert.alert("Lỗi", error.Message);
        };

        hubConnection.on("playerJoined", handlePlayerJoined);
        hubConnection.on("playerLeft", handlePlayerLeft);
        hubConnection.on("gameStarted", handleGameStarted);
        hubConnection.on("error", handleError);

        return () => {
            hubConnection.off("playerLeft", handlePlayerLeft);
            hubConnection.off("gameStarted", handleGameStarted);
            hubConnection.off("error", handleError);
            hubConnection.off("playerJoined", handlePlayerJoined);
        };
    }, [hubConnection,quiz, showRankObj]);


    useEffect(() => {
        const fetchQuiz = async () => {
            try {
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


    const handleStartGame = async () => {
        try {
            await hubConnection.invoke("StartGame", {
                roomId: gameCode
            });
        } catch (error) {
            console.error("Error starting game:", error);
            Alert.alert("Lỗi", "Không thể bắt đầu trò chơi. Vui lòng thử lại!");
        }
    };
    
    const handleLeaveRoom = () => {
        // Xử lý khi người chơi rời phòng
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
                    onPress: () => {
                        navigation.reset({
                            index: 0,
                            routes: [
                                {
                                    name: SCREENS.USER_TAB,
                                    state: {
                                        index: 0,
                                        routes: [
                                            { name: SCREENS.EXPLORE_TAB }
                                        ]
                                    }
                                }
                            ],
                        });
                        Alert.alert('Thông báo', 'Bạn đã rời khỏi phòng chơi');}
                }
            ]
        );
    };

    const handleCopyCode = () => {
        Alert.alert('Thông báo', 'Đã sao chép mã phòng: ' + gameCode);
    };


    const renderPlayerItem = ({ item }) => (
        <View style={[
            styles.playerItem,
            item.isCurrentPlayer && styles.currentPlayerItem
        ]}>
            <Image source={{ uri: item.avatar }} style={styles.playerAvatar} />
            <Text style={styles.playerName}>
                {item.isCurrentPlayer ? 'Bạn' : item.name}
            </Text>
        </View>
    );

    // const handleKickPlayer = (playerId) => {
    //     Alert.alert(
    //         'Xác nhận',
    //         'Bạn có chắc muốn đuổi người chơi này?',
    //         [
    //             {
    //                 text: 'Hủy',
    //                 style: 'cancel'
    //             },
    //             {
    //                 text: 'Đuổi',
    //                 onPress: () => {
    //                     setPlayers(prevPlayers => prevPlayers.filter(p => p.id !== playerId));
    //                     Alert.alert('Thông báo', 'Đã đuổi người chơi khỏi phòng');
    //                 }
    //             }
    //         ]
    //     );
    // };

    const handleSettingsChange = (newSettings) => {
        setShowRankObj(newSettings);
        setIsSettingsModalVisible(false);
    };

    return (
        <View style={styles.container}>
            {/* Header with back button */}
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
                </View>
            )}
            
            {/* Room Code */}
            <View style={styles.codeContainer}>
                <Text style={styles.codeLabel}>Mã phòng:</Text>
                <Text style={styles.codeValue}>{gameCode}</Text>
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
                <Text style={styles.playerCount}>{players.length} người chơi</Text>
                {/* <TouchableOpacity 
                    style={styles.viewAllButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.viewAllText}>Xem tất cả</Text>
                </TouchableOpacity> */}
            </View>

            {/* Players Grid */}
            <View style={styles.playersContainer}>
                <FlatList
                    data={players}
                    renderItem={renderPlayerItem}
                    keyExtractor={item => item.id.toString()}
                    numColumns={4}
                    contentContainerStyle={styles.playersList}
                />
            </View>

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
                        style={styles.startButton}
                        onPress={handleStartGame}
                    >
                        <Text style={styles.startButtonText}>Bắt đầu</Text>
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
        alignItems: 'center',
    },
    playerItem: {
        width: '25%',
        alignItems: 'center',
        marginBottom: 16,
    },
    currentPlayerItem: {
        // Highlight the current player
        backgroundColor: COLORS.BLUE_LIGHT,
        borderRadius: 8,
        padding: 4,
    },
    playerAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginBottom: 8,
    },
    playerName: {
        fontSize: 12,
        textAlign: 'center',
    },
    morePlayersButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.BLUE_LIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginTop: 8,
    },
    morePlayersText: {
        fontWeight: 'bold',
    },
    buttonContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.GRAY_LIGHT,
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