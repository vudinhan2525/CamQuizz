import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import COLORS from '../../../constant/colors';
import SCREENS from '../../index'

const EndQuiz = ({ navigation, route }) => {
    const { quizId, finalRanking } = route.params;

    const getRankingItemStyle = (index) => {
        switch (index) {
            case 0:
                return { backgroundColor: '#FFD700' };
            case 1:
                return { backgroundColor: '#C0C0C0' };
            case 2:
                return { backgroundColor: '#CD7F32' };
            default:
                return { backgroundColor: COLORS.BLUE_LIGHT };
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bảng Xếp Hạng</Text>
            <ScrollView style={styles.rankingList}>
                {finalRanking.map((user, index) => (
                    <View
                        key={index}
                        style={[
                            styles.rankingItem,
                            getRankingItemStyle(index),
                        ]}
                    >
                        <Text style={[
                            styles.rank,
                            index < 3 && styles.topThreeText
                        ]}>{index + 1}</Text>
                        <Text style={[
                            styles.username,
                            index < 3 && styles.topThreeText
                        ]}>{user.name}</Text>
                        <Text style={[
                            styles.score,
                            index < 3 && styles.topThreeText
                        ]}>{user.newScore}</Text>
                    </View>
                ))}
            </ScrollView>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.reportButton]}
                    onPress={() => navigation.navigate(SCREENS.QUIZ_REPORT, {
                        roomId: 2,
                        
                    })}  
                >
                    <Text style={styles.buttonText}>Xem báo cáo Chi tiết</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.exitButton]}
                    onPress={() => {
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
                    }}
                >
                    <Text style={styles.buttonText}>Thoát</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: COLORS.WHITE,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    rankingList: {
        flex: 1,
    },
    rankingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.GRAY_BG,
        borderRadius: 8,
        marginBottom: 8,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    topThreeItem: {
        borderWidth: 1,
        borderColor: COLORS.GRAY,
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 4,
    },
    topThreeText: {
        color: COLORS.BLACK,
        fontWeight: 'bold',
    },
    rank: {
        width: 30,
        fontWeight: 'bold',
    },
    username: {
        flex: 1,
    },
    score: {
        width: 60,
        textAlign: 'right',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        gap: 10,
    },
    button: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    exitButton: {
        backgroundColor: COLORS.RED,
    },
    reportButton: {
        backgroundColor: COLORS.BLUE,
    },
    buttonText: {
        color: COLORS.WHITE,
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default EndQuiz;