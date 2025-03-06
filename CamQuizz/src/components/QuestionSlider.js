import React, { useRef } from "react";
import { FlatList, StyleSheet } from "react-native";
import QuestionItem from './QuestionItem';



const QuestionSlider = ({questions}) => {
    const flatListRef = useRef(null);

    const handleEditQuestion = (questionId) => {
        // Xử lý sự kiện edit câu hỏi
        console.log('Edit question:', questionId);
    };

    return (
        <FlatList
            ref={flatListRef}
            data={questions}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({item, index}) => (
                <QuestionItem 
                    question={item} 
                    index={index}
                    onEdit={handleEditQuestion}
                />
            )}
            contentContainerStyle={styles.flatListContainer}
            snapToAlignment="center"
        />
    );
};

const styles = StyleSheet.create({
    flatListContainer: {
        flexGrow: 1,
    },
});

export default QuestionSlider;
