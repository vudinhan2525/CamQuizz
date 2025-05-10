import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constant/colors';
import SCREENS from '../../../screens';

const QuizDetail = ({ navigation, route }) => {
    const { quiz } = route.params;
    
    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Quiz Image with Back Button */}
                <View style={styles.imageContainer}>
                    <Image 
                        source={{ uri: quiz.Image || 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg' }} 
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
                            <Text style={styles.statText}>{quiz.duration} phút</Text>
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
                    
                    {/* Description */}
                    <Text style={styles.sectionTitle}>Mô tả</Text>
                    <Text style={styles.description}>{quiz.description}</Text>
                    
                    {/* Topics */}
                    <Text style={styles.sectionTitle}>Chủ đề</Text>
                    <View style={styles.topicsContainer}>
                        {quiz.topics && quiz.topics.map((topic, index) => (
                            <View key={index} style={styles.topicTag}>
                                <Text style={styles.topicText}>{topic}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
            
            {/* Play Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={styles.playButton}
                    onPress={() => navigation.navigate(SCREENS.LOBBY, { quizId: quiz.id })}
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
        backgroundColor: COLORS.GRAY_LIGHT,
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
        borderTopColor: COLORS.GRAY_LIGHT,
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