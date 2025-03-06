import React, { useState, useEffect } from 'react';
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

const GroupSelectionModal = ({ 
    visible, 
    onClose, 
    onSave, 
    selectedGroups: initialSelectedGroups = [], 
    myGroups = [] 
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGroups, setSelectedGroups] = useState(initialSelectedGroups);
    const [filteredGroups, setFilteredGroups] = useState(myGroups);

    // Log để debug
    console.log('myGroups:', myGroups);
    console.log('filteredGroups:', filteredGroups);

    useEffect(() => {
        setFilteredGroups(myGroups);
    }, [myGroups]);

    useEffect(() => {
        if (searchQuery) {
            const filtered = myGroups.filter(group => 
                group.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredGroups(filtered);
        } else {
            setFilteredGroups(myGroups);
        }
    }, [searchQuery, myGroups]);

    const renderGroup = ({ item }) => (
        <TouchableOpacity 
            style={[
                styles.groupItem,
                selectedGroups.includes(item.id) && styles.selectedGroupItem
            ]}
            onPress={() => toggleGroupSelection(item.id)}
        >
            <Text style={[
                styles.groupName,
                selectedGroups.includes(item.id) && styles.selectedGroupName
            ]}>
                {item.name}
            </Text>
            {selectedGroups.includes(item.id) && (
                <Ionicons name="checkmark-circle" size={24} color={COLORS.WHITE} />
            )}
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

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Chọn nhóm học tập</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={COLORS.BLACK} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color={COLORS.GRAY_DARK} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Tìm kiếm nhóm..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    <FlatList
                        data={filteredGroups}
                        renderItem={renderGroup}
                        keyExtractor={item => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>
                                {searchQuery ? 'Không tìm thấy nhóm nào' : 'Không có nhóm nào'}
                            </Text>
                        }
                    />

                    <View style={styles.modalFooter}>
                        <TouchableOpacity 
                            style={styles.saveButton}
                            onPress={() => {
                                onSave(selectedGroups);
                                onClose();
                            }}
                        >
                            <Text style={styles.saveButtonText}>
                                Lưu ({selectedGroups.length} nhóm đã chọn)
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
});

export default GroupSelectionModal; 