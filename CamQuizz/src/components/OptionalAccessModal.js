import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
    ScrollView,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constant/colors';

const OptionalAccessModal = ({
    visible,
    onClose,
    onSave,
    selectedGroups: initialSelectedGroups = [],
    myGroups = [],
    initialInvitedEmails = []
}) => {
    const [selectedGroups, setSelectedGroups] = useState(initialSelectedGroups);
    const [email, setEmail] = useState('');
    const [invitedEmails, setInvitedEmails] = useState(initialInvitedEmails);

    const renderGroup = ({ item }) => (
        <TouchableOpacity
            style={styles.groupItem}
            onPress={() => toggleGroupSelection(item.id)}
        >
            <Text style={styles.groupName}>{item.name}</Text>
            <Ionicons name="add-circle-outline" size={24} color={COLORS.BLUE} />
        </TouchableOpacity>
    );

    const toggleGroupSelection = (groupId) => {
        setSelectedGroups(prev => {
            if (prev.includes(groupId)) {
                return prev.filter(id => id !== groupId);
            }
            return [...prev, groupId];
        });
    };

    const handleInviteEmail = () => {
        if (email && email.includes('@')) {
            setInvitedEmails(prev => [...prev, email]);
            setEmail('');
        }
    };

    const removeEmail = (emailToRemove) => {
        setInvitedEmails(prev => prev.filter(email => email !== emailToRemove));
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Tùy chọn quyền truy cập</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={COLORS.BLACK} />
                        </TouchableOpacity>
                    </View>


                    <Text style={styles.sectionTitle}>Mời bạn bè</Text>

                    {/* Hiển thị email đã mời */}
                    {invitedEmails.length > 0 && (
                        <View style={styles.selectedGroupsContainer}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.selectedGroupsScroll}
                            >
                                {invitedEmails.map((email, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.selectedGroupTag}
                                        onPress={() => removeEmail(email)}
                                    >
                                        <Text style={styles.selectedGroupText}>{email}</Text>
                                        <Ionicons
                                            name="close-circle"
                                            size={16}
                                            color={COLORS.WHITE}
                                            style={styles.tagIcon}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                    {/* Phần nhập email */}
                    <View style={styles.emailContainer}>
                        <View style={styles.emailInputContainer}>
                            <TextInput
                                style={styles.emailInput}
                                placeholder="Nhập email để mời..."
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                style={[
                                    styles.inviteButton,
                                    (!email || !email.includes('@')) && styles.inviteButtonDisabled
                                ]}
                                onPress={handleInviteEmail}
                                disabled={!email || !email.includes('@')}
                            >
                                <Text style={styles.inviteButtonText}>Mời</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {/* Phần nhóm */}
                    <Text style={styles.sectionTitle}>Mời nhóm</Text>

                    {selectedGroups.length > 0 && (
                        <View style={styles.selectedGroupsContainer}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.selectedGroupsScroll}
                            >
                                {selectedGroups.map(groupId => {
                                    const group = myGroups.find(g => g.id === groupId);
                                    return group && (
                                        <TouchableOpacity
                                            key={groupId}
                                            style={styles.selectedGroupTag}
                                            onPress={() => toggleGroupSelection(groupId)}
                                        >
                                            <Text style={styles.selectedGroupText}>{group.name}</Text>
                                            <Ionicons
                                                name="close-circle"
                                                size={16}
                                                color={COLORS.WHITE}
                                                style={styles.tagIcon}
                                            />
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    )}

                    <FlatList
                        data={myGroups.filter(group => !selectedGroups.includes(group.id))}
                        renderItem={renderGroup}
                        keyExtractor={item => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>Không có nhóm nào</Text>
                        }
                    />

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={[
                                styles.saveButton,
                                (selectedGroups.length === 0 && invitedEmails.length === 0) && styles.saveButtonDisabled
                            ]}
                            onPress={() => {
                                onSave(selectedGroups, invitedEmails);
                                onClose();
                            }}
                            disabled={selectedGroups.length === 0 && invitedEmails.length === 0}
                        >
                            <Text style={styles.saveButtonText}>
                                Lưu
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: COLORS.WHITE,
        width: '90%',
        maxHeight: '80%',
        borderRadius: 10,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.BLUE
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
    listContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    groupItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#f0f0f0',
    },
    selectedGroupItem: {
        backgroundColor: COLORS.BLUE,
    },
    groupName: {
        fontSize: 16,
    },
    selectedGroupName: {
        color: COLORS.WHITE,
    },
    modalFooter: {
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 15,
    },
    saveButton: {
        backgroundColor: COLORS.BLUE,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: COLORS.WHITE,
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.GRAY_DARK,
        marginTop: 20,
    },
    selectedGroupsContainer: {
        marginBottom: 15,
    },
    selectedGroupsTitle: {
        fontSize: 14,
        color: COLORS.GRAY_DARK,
        marginBottom: 8,
    },
    selectedGroupsScroll: {
        maxHeight: 40,
    },
    selectedGroupTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.BLUE,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
    },
    selectedGroupText: {
        color: COLORS.WHITE,
        fontSize: 14,
        marginRight: 4,
    },
    tagIcon: {
        marginLeft: 4,
    },
    emailContainer: {
        marginBottom: 15,
    },
    emailInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 10,
    },
    emailInput: {
        flex: 1,
        fontSize: 16,
        marginRight: 10,
    },
    inviteButton: {
        backgroundColor: COLORS.BLUE,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 6,
    },
    inviteButtonDisabled: {
        backgroundColor: COLORS.GRAY_DARK,
    },
    inviteButtonText: {
        color: COLORS.WHITE,
        fontSize: 14,
        fontWeight: 'bold',
    },
    sectionTitle: {
        color: COLORS.BLUE,
        fontSize: 16,
        marginBottom: 10
    },
    saveButtonDisabled: {
        backgroundColor: COLORS.BLUE,
        opacity: 0.5,
    },
});

export default OptionalAccessModal; 