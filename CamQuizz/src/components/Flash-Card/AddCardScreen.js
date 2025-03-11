import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import {ArrowLeft,Check,Eye,Menu,ChevronDown,Headphones,Mic,Image,Camera,Type } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import COLORS from "../../constant/colors";

const AddCardScreen = ({ onClose, onSave }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params || {}; 

  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");

  const handleSave = () => {
    onSave(frontText, backText);
    onClose();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <ArrowLeft size={24} color={"black"} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Thêm thẻ</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleSave}>
            <Check size={24} color={COLORS.BLUE} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Card Type Selector */}
        <View style={styles.optionContainer}>
          <Text style={styles.optionLabel}>Kiểu:</Text>
          <View style={styles.optionValue}>
            <Text>Cơ bản</Text>
            <ChevronDown size={20} />
          </View>
        </View>

        {/* Set Selector */}
        <View style={styles.optionContainer}>
          <Text style={styles.optionLabel}>Bộ thẻ:</Text>
          <View style={styles.optionValue}>
            <Text>{id}</Text>
            <ChevronDown size={20} />
          </View>
        </View>

        {/* Front Card */}
        <View style={styles.cardContainer}>
          <Text style={styles.cardLabel}>Trước</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Điền nội dung mặt trước"
            value={frontText}
            onChangeText={setFrontText}
            multiline
          />
          <View style={styles.iconRow}>
            <TouchableOpacity>
              <Image size={24} color={COLORS.BLUE} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Back Card */}
        <View style={styles.cardContainer}>
          <Text style={styles.cardLabel}>Sau</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Điền nội dung mặt sau"
            value={backText}
            onChangeText={setBackText}
            multiline
          />
          <View style={styles.iconRow}>
          
            <TouchableOpacity>
              <Image size={24} color={COLORS.BLUE} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tags */}
        <View style={styles.cardContainer}>
          <Text style={styles.cardLabel}>Nhãn:</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Thêm nhãn"
          />
        </View>

        {/* Card Counter */}
        <View style={styles.cardContainer}>
          <Text style={styles.cardLabel}>Thẻ: Thẻ 1</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default AddCardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: "bold",
    color: COLORS.BLUE 

},
  headerActions: { 
    flexDirection: "row", 
    gap: 16 
},

  content: { 
    flex: 1, 
    padding: 16 
},

  optionContainer: {
    backgroundColor: "#FFF",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.BLUE,
  },
  optionLabel: { 
    fontSize: 16, 
    fontWeight: "500",
    color: COLORS.BLUE, 
  },
  optionValue: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8 
  },

  cardContainer: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.BLUE,
  },
  cardLabel: { 
    fontSize: 16, 
    fontWeight: "500", 
    marginBottom: 8,
    color: COLORS.BLUE 

},
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.BLUE,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: "top",
    backgroundColor: COLORS.Fresh_Air,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    marginRight: 20,
    gap: 12,
  },
});
