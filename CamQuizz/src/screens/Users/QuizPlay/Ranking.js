import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import COLORS from '../../../constant/colors';

const RankingItem = ({ user, newScore, oldScore, isCorrect, index, animationDuration }) => {
    const translateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (newScore !== oldScore) {
            const movement = (oldScore - newScore) * 60; // 60 is the height of each item
            translateY.setValue(movement);
            
            Animated.timing(translateY, {
                toValue: 0,
                duration: animationDuration,
                useNativeDriver: true,
            }).start();
        }
    }, [newScore, oldScore]);

    return (
        <Animated.View 
            style={[
                styles.rankingItem,
                { transform: [{ translateY }] }
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

const Ranking = ({ users, displayTime }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Ranking</Text>
            {users.map((user, index) => (
                <RankingItem
                    key={user.id}
                    user={user}
                    newScore={user.newScore}
                    oldScore={user.oldScore}
                    isCorrect={user.isCorrect}
                    index={index}
                    animationDuration={displayTime * 0.8} // Leave some time for showing final positions
                />
            ))}
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
    rankingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.GRAY_LIGHT,
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