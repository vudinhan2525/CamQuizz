import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import COLORS from '../../../constant/colors';

const RankingItem = ({ user, newScore, oldScore, isCorrect, index }) => {

    return (
        <Animated.View 
            style={[    
                styles.rankingItem,
            ]}
        >
            <Text style={styles.rank}>{index + 1}</Text>
            <Text style={styles.username}>{user.name}</Text>
            <Text style={styles.score}>{newScore}</Text>
            <View style={[
                styles.status,
                { backgroundColor: isCorrect ? COLORS.GREEN : COLORS.RED }
            ]} />
        </Animated.View>
    );
};

const Ranking = ({ users }) => {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Bảng Xếp Hạng</Text>
            {users.map((user, index) => (
                <RankingItem
                    key={index}
                    user={user}
                    newScore={user.newScore}
                    isCorrect={user.isCorrect}
                    index={index}
                />
            ))}
        </SafeAreaView>
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
    rankingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.GRAY_BG,
        height: 60,
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
        marginRight: 10,
    },
    status: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
});

export default Ranking;