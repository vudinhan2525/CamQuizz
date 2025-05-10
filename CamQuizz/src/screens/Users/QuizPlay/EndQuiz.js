import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import COLORS from '../../../constant/colors';

const EndQuiz = ({ navigation, route }) => {
    const { finalRanking } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Final Results</Text>
            <ScrollView style={styles.rankingList}>
                {finalRanking.map((user, index) => (
                    <View key={user.id} style={styles.rankingItem}>
                        <Text style={styles.rank}>{index + 1}</Text>
                        <Text style={styles.username}>{user.name}</Text>
                        <Text style={styles.score}>{user.score}</Text>
                    </View>
                ))}
            </ScrollView>
            <TouchableOpacity 
                style={styles.reportButton}
                onPress={() => navigation.navigate('QuizReport')}
            >
                <Text style={styles.buttonText}>View Report</Text>
            </TouchableOpacity>
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
        borderBottomColor: COLORS.GRAY_LIGHT,
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
    reportButton: {
        backgroundColor: COLORS.BLUE,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    buttonText: {
        color: COLORS.WHITE,
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default EndQuiz;