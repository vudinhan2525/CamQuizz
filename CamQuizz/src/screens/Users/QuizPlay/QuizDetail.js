import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constant/colors';
import SCREENS from '../../../screens';
import * as signalR from '@microsoft/signalr';
import { API_URL } from '@env';
import QuizzService from '../../../services/QuizzService';
import GenreService from '../../../services/GenreService';
import { useHubConnection } from '../../../contexts/SignalRContext';
import AsyncStorageService from '../../../services/AsyncStorageService';
import Toast from 'react-native-toast-message';
import { getUserById } from '../../../services/AuthService';
const QuizDetail = ({ navigation, route }) => {
    //const { quiz } = route.params;
    const { hubConnection, setHubConnection } = useHubConnection();
    const { quizId } = route.params;
    const [quiz, setQuiz] = React.useState({});
    const [connectionId, setConnectionId] = React.useState(null);
    React.useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const quizData = await QuizzService.getQuizzById(quizId);
                console.log(`Quiz data:`, quizData);
                const quiz = {
                    id: quizData.id,
                    title: quizData.name,
                    questions: quizData.number_of_questions,
                    duration: quizData.duration,
                    attempts: quizData.number_of_attended,
                    // authorName: quizData.authorName,
                    description: quizData.description,
                    image: quizData.image,
                    topic: quizData.genre_id,
                }
                const genre = await GenreService.getGenreById(quizData.genre_id);
                quiz.topic = genre.name;
                const authData = await getUserById(quizData.user_id)
                quiz.authorName = authData.first_name+" "+authData.last_name
                quiz.authorAvatar = authData.photos
                setQuiz(quiz);

                return 
            } catch (error) {
                console.error('Error fetching quiz data:', error);
            }
        };
        fetchQuiz();
    }, [quizId]);

    const connectToHub = async (connectionId) => {
        try {
            console.log("Connecting to SignalR hub with connection ID:", connectionId);
            const connection = new signalR.HubConnectionBuilder()
                .withUrl(`${API_URL}/quizHub?id=${connectionId}`, {
                    skipNegotiation: true,
                    transport: signalR.HttpTransportType.WebSockets
                })
                .configureLogging(signalR.LogLevel.Information)
                .withAutomaticReconnect()
                .build();



            await connection.start();
            console.log("Connected to SignalR hub");
            setHubConnection(connection);

            return connection;
        } catch (error) {
            console.error("Error connecting to SignalR hub:", error);
            throw error;
        }
    };


    const handleBegin = async () => {
        try {
            console.log(API_URL)
            const response = await fetch(`${API_URL}/tmpHub/negotiate`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            });
            const data = await response.json();
            const connectionId = data.connectionId;
            setConnectionId(connectionId);
            console.log('Connection data:', data);

            if (response.ok) {
                // Connect to SignalR hub
                const hubConnection = await connectToHub(connectionId);
                // await createRoom();
                const userId = await AsyncStorageService.getUserId();
                console.log('User ID:',  hubConnection);
                hubConnection.on('roomCreated', (room) => {
                    console.log('Room created:', room);
                    navigation.navigate(SCREENS.LOBBY, {
                        roomCode: room.RoomId,
                        isHost: true,
                        playerList: room.PlayerList,
                        quizId: room.QuizId,
                        HostId: room.HostId,
                    });
                });

                hubConnection.on('error', (error) => {
                    console.error('Error creating room:', error);
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: error.message || 'Failed to create room',
                        position: 'top',
                        visibilityTime: 3000,
                    });
                });
                // Call the CreateRoom method on the hub
                await hubConnection.invoke('CreateRoom', {
                    quizId: quiz.id,
                    userId: userId
                });
            } else {
                console.error('Failed to negotiate connection:', data);
            }
        } catch (error) {
            console.error('Error negotiating connection:', error);
        }
    };

    const formatTime = (duration) => {
        if (!duration && duration !== 0) return '0:00';
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };



    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Quiz Image with Back Button */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: quiz.image || 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg' }}
                        style={styles.quizImage}
                    />
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={COLORS.WHITE} />
                    </TouchableOpacity>
                </View>

                {/* Quiz Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.title}>{quiz.title}</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Ionicons name="help-circle-outline" size={20} color={COLORS.BLUE} />
                            <Text style={styles.statText}>{quiz.questions} câu hỏi</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="time-outline" size={20} color={COLORS.BLUE} />
                            <Text style={styles.statText}>{formatTime(quiz.duration)} phút</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="people-outline" size={20} color={COLORS.BLUE} />
                            <Text style={styles.statText}>{quiz.attempts} lượt thi</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Author Info */}
                    <View style={styles.authorContainer}>
                        <Image
                            source={{ uri: quiz.authorAvatar || 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg' }}
                            style={styles.authorAvatar}
                        />
                        <Text style={styles.authorName}>Tạo bởi: {quiz.authorName}</Text>
                    </View>

                    <View style={styles.divider} />



                    {/* Topics */}
                    <Text style={styles.sectionTitle}>Chủ đề</Text>
                    <View style={styles.topicsContainer}>
                        <View style={styles.topicTag}>
                            <Text style={styles.topicText}>{quiz.topic}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Play Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => {
                        handleBegin()
                    }}
                >
                    <Ionicons name="play" size={24} color={COLORS.WHITE} />
                    <Text style={styles.playButtonText}>Bắt đầu</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.WHITE,
        paddingTop: StatusBar.currentHeight || 0,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 200,
    },
    quizImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    backButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 20,
        padding: 8,
        zIndex: 10,
    },
    infoContainer: {
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statText: {
        marginLeft: 4,
        color: COLORS.GRAY_DARK,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.GRAY_BG,
        marginVertical: 16,
    },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    authorName: {
        fontSize: 16,
        color: COLORS.GRAY_DARK,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 8,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: COLORS.GRAY_DARK,
        marginBottom: 16,
    },
    topicsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    topicTag: {
        backgroundColor: COLORS.BLUE_LIGHT,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    topicText: {
        color: COLORS.BLUE,
        fontWeight: '500',
    },
    buttonContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.GRAY_BG,
    },
    playButton: {
        backgroundColor: COLORS.BLUE,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
    },
    playButtonText: {
        color: COLORS.WHITE,
        fontWeight: 'bold',
        fontSize: 18,
        marginLeft: 8,
    },
});

export default QuizDetail;