import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const LibraryTab = ({ title, isActive, onClick }) => {
  return (
    <TouchableOpacity
      style={[styles.button, isActive && styles.activeButton]}
      onPress={onClick}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, isActive && styles.activeText]}>{title}</Text>

      {isActive && <View style={styles.indicator} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: "relative",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6b7280", // Màu xám
  },
  activeText: {
    color: "#1f2937", // Màu đen khi active
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    left: 17,
    height: 4,
    width: "100%",
    backgroundColor: "purple",
  },
});

export default LibraryTab;
