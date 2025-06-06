import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather,Ionicons } from '@expo/vector-icons';
import COLORS from '../constant/colors';

export const StudyGroupCard = ({
    group,
    onPressMore,
    onPress
}) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return COLORS.GREEN;
            case 'OnHold':
                return COLORS.GRAY;
            case 'Deleted':
                return COLORS.RED;
            default:
                return COLORS.GRAY;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'Active':
                return 'Đang hoạt động';
            case 'OnHold':
                return 'Đã lưu trữ';
            case 'Deleted':
                return 'Đã xóa';
            default:
                return 'Không xác định';
        }
    };

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.header}>
                <View style={styles.leaderInfo}>
                    {group.leaderInfo.leaderAvatar ? (
                        <Image
                            source={{ uri: group.leaderInfo.leaderAvatar }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Ionicons name="school" size={20} color={COLORS.GRAY} />
                        </View>
                    )}
                    <Text style={styles.leaderName} numberOfLines={1}>
                        {group.leaderInfo.leaderName || 'Tên trưởng nhóm'}
                    </Text>
                </View>

                {group.status !== 'deleted' && group.isOwn &&
                    <TouchableOpacity
                        style={styles.moreButton}
                        onPress={onPressMore}
                    >
                        <Feather name="edit" size={20} color={COLORS.BLUE} />
                    </TouchableOpacity>}
            </View>

            <View style={styles.content}>
                <Text style={styles.groupName} numberOfLines={2}>
                    {group.name} {/* Hiển thị tên nhóm */}
                </Text>
                {/* Log để kiểm tra dữ liệu nhóm */}
                {console.log(`StudyGroupCard rendering group: ${group.id}, name: ${group.name}`)}

                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Ionicons name="people" size={16} color={COLORS.GRAY_DARK} />
                        <Text style={styles.infoText}>
                            {group.memberCount} thành viên
                        </Text>
                    </View>

                    <View style={styles.statusContainer}>
                        <View
                            style={[
                                styles.statusDot,
                                { backgroundColor: getStatusColor(group.status) }
                            ]}
                        />
                        <Text
                            style={[
                                styles.statusText,
                                { color: getStatusColor(group.status) }
                            ]}
                        >
                            {getStatusText(group.status)}
                        </Text>
                    </View>
                </View>

                {/* Hiển thị thông báo cho pending members */}
                {group.userRole === 'Pending' && (
                    <View style={styles.pendingNotice}>
                        <Text style={styles.pendingNoticeText}>
                            Bạn đã được mời vào nhóm này. Đang chờ chủ nhóm duyệt.
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.WHITE,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: COLORS.BLUE,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        borderWidth: 1,
        borderColor: COLORS.BLUE,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    schoolInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    avatarPlaceholder: {
        backgroundColor: COLORS.GRAY_LIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    schoolName: {
        fontSize: 14,
        color: COLORS.GRAY_DARK,
        flex: 1,
    },
    moreButton: {
        padding: 4,
    },
    content: {
        gap: 8,
    },
    groupName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.BLACK,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    infoText: {
        fontSize: 14,
        color: COLORS.GRAY_DARK,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
    },
    roleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '500',
    },
    pendingNotice: {
        backgroundColor: COLORS.ORANGE + '20', // 20% opacity
        borderRadius: 6,
        padding: 8,
        marginTop: 8,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.ORANGE,
    },
    pendingNoticeText: {
        fontSize: 12,
        color: COLORS.ORANGE,
        fontStyle: 'italic',
    },
});