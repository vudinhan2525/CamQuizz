import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Modal, ScrollView, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import COLORS from '../../../constant/colors';
import SCREENS from '../../../screens';
import { mockPlayers, generateRoomCode, mockQuiz } from '../../../components/data/MockQuizPlayData';

const Lobby = ({ navigation, route }) => {
    const { quizId, isHost = true, roomCode } = route.params;
    const [gameCode, setGameCode] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [players, setPlayers] = useState([]);
    const [quiz, setQuiz] = useState(null);
    
    useEffect(() => {
        // Nếu là host, tạo mã phòng mới
        // Nếu là người chơi, sử dụng mã phòng đã được cung cấp
        if (isHost) {
            setGameCode(generateRoomCode());
        } else {
            setGameCode(roomCode || '');
        }
        
        // Giả lập người chơi tham gia phòng
        setPlayers(mockPlayers);
        
        // Giả lập lấy thông tin quiz
        setQuiz(mockQuiz);
        
        // Giả lập người chơi tham gia sau một khoảng thời gian
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

    const handleStartGame = () => {
        if (players.length < 2) {
            Alert.alert('Thông báo', 'Cần ít nhất 2 người chơi để bắt đầu trò chơi');
            return;
        }
        
        // Điều hướng đến màn hình câu hỏi đầu tiên
        navigation.navigate(SCREENS.QUESTION_PLAY, {
            quizId,
            isHost,
            currentQuestionIndex: 0,
            players
        });
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
                    onPress: () => navigation.goBack()
                }
            ]
        );
    };

    const handleCopyCode = () => {
        // Trong môi trường thực tế, bạn sẽ sử dụng Clipboard API
        // Clipboard.setString(gameCode);
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

    const handleKickPlayer = (playerId) => {
        // Xử lý khi host đuổi người chơi
        Alert.alert(
            'Xác nhận',
            'Bạn có chắc muốn đuổi người chơi này?',
            [
                {
                    text: 'Hủy',
                    style: 'cancel'
                },
                {
                    text: 'Đuổi',
                    onPress: () => {
                        setPlayers(prevPlayers => prevPlayers.filter(p => p.id !== playerId));
                        Alert.alert('Thông báo', 'Đã đuổi người chơi khỏi phòng');
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header with back button */}
            <View style={styles.headerWithBack}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={handleLeaveRoom}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.BLACK} />
                </TouchableOpacity>
                <Text style={styles.title}>Phòng chờ</Text>
                <View style={styles.placeholder} />
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
                <TouchableOpacity 
                    style={styles.viewAllButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.viewAllText}>Xem tất cả</Text>
                </TouchableOpacity>
            </View>

            {/* Players Grid */}
            <View style={styles.playersContainer}>
                <FlatList
                    data={players.slice(0, 8)}
                    renderItem={renderPlayerItem}
                    keyExtractor={item => item.id.toString()}
                    numColumns={4}
                    contentContainerStyle={styles.playersList}
                />
                
                {players.length > 8 && (
                    <TouchableOpacity 
                        style={styles.morePlayersButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.morePlayersText}>+{players.length - 8}</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Start Button (only for host) */}
            {isHost ? (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={styles.startButton}
                        onPress={handleStartGame}
                    >
                        <Text style={styles.startButtonText}>Bắt đầu</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.waitingContainer}>
                    <Text style={styles.waitingText}>Đang chờ chủ phòng bắt đầu...</Text>
                </View>
            )}

            {/* Players Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Danh sách người chơi</Text>
                            <TouchableOpacity 
                                style={styles.closeButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Ionicons name="close" size={24} color={COLORS.BLACK} />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.modalPlayersList}>
                            {players.map(player => (
                                <View key={player.id} style={styles.modalPlayerItem}>
                                    <Image source={{ uri: player.avatar }} style={styles.modalPlayerAvatar} />
                                    <Text style={styles.modalPlayerName}>
                                        {player.isCurrentPlayer ? 'Bạn' : player.name}
                                    </Text>
                                    {isHost && !player.isCurrentPlayer && (
                                        <TouchableOpacity style={styles.kickButton} onPress={() => handleKickPlayer(player.id)}>
                                            <MaterialIcons name="remove-circle-outline" size={24} color={COLORS.RED} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
        justifyContent: 'space-between',
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
    },
    startButton: {
        backgroundColor: COLORS.BLUE,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    startButtonText: {
        color: COLORS.WHITE,
        fontWeight: 'bold',
        fontSize: 18,
    },
    waitingContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.GRAY_LIGHT,
        alignItems: 'center',
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
});

export default Lobby;