import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TextInput } from 'react-native';
import COLORS from '../../../constant/colors';

const QuestionSetting = ({ navigation, route }) => {
    const [showRankingAfterEnd, setShowRankingAfterEnd] = useState(true);
    const [rankingDisplayTime, setRankingDisplayTime] = useState('5');

    return (
        <View style={styles.container}>
            <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Show Ranking After Question Ends</Text>
                <Switch
                    value={showRankingAfterEnd}
                    onValueChange={setShowRankingAfterEnd}
                    trackColor={{ false: COLORS.GRAY_LIGHT, true: COLORS.BLUE }}
                />
            </View>
            <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Ranking Display Duration (seconds)</Text>
                <TextInput
                    style={styles.input}
                    value={rankingDisplayTime}
                    onChangeText={setRankingDisplayTime}
                    keyboardType="numeric"
                    maxLength={2}
                />
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
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.GRAY_LIGHT,
    },
    settingLabel: {
        fontSize: 16,
        flex: 1,
        marginRight: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.GRAY_LIGHT,
        borderRadius: 8,
        padding: 8,
        width: 60,
        textAlign: 'center',
    },
});

export default QuestionSetting;