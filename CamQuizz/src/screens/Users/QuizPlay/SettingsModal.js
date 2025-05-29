import React from 'react';
import { 
    View, 
    Text, 
    Modal, 
    StyleSheet, 
    Switch, 
    TouchableOpacity,
} from 'react-native';
import COLORS from '../../../constant/colors';

const SettingsModal = ({ visible, onClose, settings, onSettingsChange }) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Cài đặt </Text>
                    
                    <View style={styles.settingItem}>
                        <Text style={styles.settingLabel}>Hiển thị bảng xếp hạng</Text>
                        <Switch
                            value={settings.show}
                            onValueChange={(value) => 
                                onSettingsChange({ ...settings, show: value })}
                            trackColor={{ false: COLORS.GRAY_BG, true: COLORS.BLUE }}
                        />
                    </View>

                    <Text style={styles.settingDescription}>
                        {settings.show 
                            ? "Bảng xếp hạng hiển thị sau khi trả lời câu hỏi"
                            : "Bảng xếp hạng sẽ không hiển thị"}
                    </Text>

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Text style={styles.closeButtonText}>Lưu</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        backgroundColor: COLORS.WHITE,
        borderRadius: 20,
        padding: 20,
        width: '80%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
    },
    settingLabel: {
        fontSize: 16,
        flex: 1,
        marginRight: 10,
    },
    settingDescription: {
        fontSize: 14,
        color: COLORS.GRAY,
        marginTop: 5,
        fontStyle: 'italic',
    },
    closeButton: {
        backgroundColor: COLORS.BLUE,
        borderRadius: 8,
        padding: 12,
        marginTop: 20,
        alignItems: 'center',
    },
    closeButtonText: {
        color: COLORS.WHITE,
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default SettingsModal;