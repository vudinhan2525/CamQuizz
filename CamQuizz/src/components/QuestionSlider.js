import React, { useRef } from "react";
import { FlatList, StyleSheet } from "react-native";
import QuestionItem from './QuestionItem';



const QuestionSlider = ({questions, setQuestions}) => {
    const flatListRef = useRef(null);

    const handleEditQuestion = (questionId) => {
        // Xử lý sự kiện edit câu hỏi
        console.log('Edit question:', questionId);
    };

    const handleDeleteQuestion = (questionId) => {
        // Xóa câu hỏi khỏi danh sách
        const newQuestions = questions.filter(q => q.id !== questionId);
        setQuestions(newQuestions);
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
                    onDelete={handleDeleteQuestion}
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
