import React, { useRef } from "react";
import { FlatList, StyleSheet } from "react-native";
import QuestionItem from './QuestionItem';



const QuestionSlider = ({questions, setQuestions,handleEditQuestion}) => {
    const flatListRef = useRef(null);

    

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
                    onEdit={()=>{handleEditQuestion(item)}}
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
