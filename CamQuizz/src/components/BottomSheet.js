import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../constant/colors';
const BottomSheet = forwardRef(({ children, title, height='100%', onCancel }, ref) => {
    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            ref.current.close();
        }
    };
    // USING BOTTOM SHEET
    // const bottomSheetRef = useRef();
    // <BottomSheet ref={bottomSheetRef} title="Bộ lọc" height={400}>
    //     <View>
    //         <Text>Content</Text>
    //     </View>
    // </BottomSheet>
    // bottomSheetRef.current.close();
    // bottomSheetRef.current.open();
    return (
        <RBSheet
            ref={ref}
            closeOnDragDown={true}
            closeOnPressMask={true}
            dragFromTopOnly={true}
            height={height}
            customStyles={{
                wrapper: {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                },
                draggableIcon: {
                    backgroundColor: '#000',
                },
                container: {
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                },
            }}
        >
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity onPress={handleCancel}>
                    <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.content}>
                {children}
            </ScrollView>
        </RBSheet>
    );
});

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color:COLORS.BLUE,
        textTransform: 'uppercase',
        flex:1
    },
    content: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
});

export default BottomSheet;