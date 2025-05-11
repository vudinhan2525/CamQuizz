import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constant/colors';

const QuestionPlaySetting = ({ navigation, route }) => {
    const [showRankingAfterEnd, setShowRankingAfterEnd] = useState(true);
    const [rankingDisplayTime, setRankingDisplayTime] = useState('5');

    const handleSave = () => {
        // Save settings and go back
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Cài đặt hiển thị bảng xếp hạng</Text>
                <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="close" size={24} color={COLORS.BLACK} />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Hiển thị bảng xếp hạng khi kết thúc câu hỏi</Text>
                    <Switch
                        value={showRankingAfterEnd}
                        onValueChange={setShowRankingAfterEnd}
                        trackColor={{ false: COLORS.GRAY_LIGHT, true: COLORS.BLUE }}
                    />
                </View>
                <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Thời gian hiển thị bảng xếp hạng (giây)</Text>
                    <TextInput
                        style={styles.input}
                        value={rankingDisplayTime}
                        onChangeText={setRankingDisplayTime}
                        keyboardType="numeric"
                        maxLength={2}
                    />
                </View>
                   <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleSave}
                >
                    <Text style={styles.saveButtonText}>Lưu</Text>
                </TouchableOpacity>
            </View>

          
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.WHITE,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.GRAY_BG,
        position: 'relative',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        position: 'absolute',
        right: 16,
        padding: 4,
    },
    content: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.GRAY_BG,
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
    footer: {
        padding: 16,
        alignItems: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: COLORS.GRAY_LIGHT,
    },
    saveButton: {
        backgroundColor: COLORS.BLUE,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    saveButtonText: {
        color: COLORS.WHITE,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default QuestionPlaySetting;