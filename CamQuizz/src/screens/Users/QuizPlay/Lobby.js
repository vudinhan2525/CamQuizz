import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Modal, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import COLORS from '../../../constant/colors';
import SCREENS from '../../../screens';

const Lobby = ({ navigation, route }) => {
    const { quizId, isHost = true } = route.params;
    const [gameCode, setGameCode] = useState('ABCD123');
    const [modalVisible, setModalVisible] = useState(false);
    
    // Mock data for players
    const [players, setPlayers] = useState([
        { id: 1, name: 'Player 1', avatar: 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg' },
        { id: 2, name: 'Player 2', avatar: 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg' },
        { id: 3, name: 'Player 3', avatar: 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg' },
        { id: 4, name: 'Player 4', avatar: 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg' },
        { id: 5, name: 'Player 5', avatar: 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg' },
        { id: 6, name: 'Player 6', avatar: 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg' },
        { id: 7, name: 'Player 7', avatar: 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg' },
        { id: 8, name: 'Player 8', avatar: 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg' },
        { id: 9, name: 'Player 9', avatar: 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg' },
        { id: 10, name: 'Player 10', avatar: 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg' },
        { id: 11, name: 'Player 11', avatar: 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg' },
        { id: 12, name: 'Player 12', avatar: 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg' },
    ]);

    const handleStartGame = () => {
        // Navigate to the first question
     navigation.navigate(SCREENS.QUESTION_PLAY, {
        duration: 60,
        isHost: true,
        multipleCorrect: false,
        question: 'What is the capital of France?',
        questionImage: 'https://example.com/paris.jpg', // optional
        answers: [
            { text: 'Paris', image: 'https://example.com/paris.jpg' },
            { text: 'London', image: 'https://example.com/london.jpg' },
            { text: 'Berlin', image: null },
            { text: 'Madrid', image: null }
        ],
        showRankingAfterEnd: true,         
        rankingDisplayTime: 10  
    });
    };

    const renderPlayerItem = ({ item }) => (
        <View style={styles.playerItem}>
            <Image source={{ uri: item.avatar }} style={styles.playerAvatar} />
            <Text style={styles.playerName}>{item.name}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Phòng chờ</Text>
                <View style={styles.codeContainer}>
                    <Text style={styles.codeLabel}>Mã phòng:</Text>
                    <Text style={styles.codeValue}>{gameCode}</Text>
                    <TouchableOpacity style={styles.copyButton}>
                        <Ionicons name="copy-outline" size={20} color={COLORS.BLUE} />
                    </TouchableOpacity>
                </View>
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
            {isHost && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={styles.startButton}
                        onPress={handleStartGame}
                    >
                        <Text style={styles.startButtonText}>Bắt đầu</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Full Players Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Tất cả người chơi</Text>
                            <TouchableOpacity 
                                style={styles.closeButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Ionicons name="close" size={24} color={COLORS.GRAY_DARK} />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.modalPlayersList}>
                            {players.map(player => (
                                <View key={player.id} style={styles.modalPlayerItem}>
                                    <Image source={{ uri: player.avatar }} style={styles.modalPlayerAvatar} />
                                    <Text style={styles.modalPlayerName}>{player.name}</Text>
                                    {isHost && (
                                        <TouchableOpacity style={styles.kickButton}>
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
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.GRAY_LIGHT,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.GRAY_LIGHT,
        padding: 12,
        borderRadius: 8,
    },
    codeLabel: {
        fontSize: 16,
        marginRight: 8,
    },
    codeValue: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    copyButton: {
        padding: 4,
    },
    playerCountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.GRAY_LIGHT,
    },
    playerCount: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
        flex: 1,
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
        backgroundColor: COLORS.GRAY_LIGHT,
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
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: COLORS.WHITE,
        borderRadius: 12,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.GRAY_LIGHT,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    modalPlayersList: {
        padding: 16,
    },
    modalPlayerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
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
        fontSize: 16,
        flex: 1,
    },
    kickButton: {
        padding: 4,
    },
});

export default Lobby;