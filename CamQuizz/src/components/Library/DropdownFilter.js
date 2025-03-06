import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronDown } from "lucide-react-native";

const DropdownFilter = ({ label, count }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => setIsOpen(!isOpen)}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.rightContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count}</Text>
          </View>
          <View style={{transform: [{ rotate: isOpen ? "180deg" : "0deg" }] }}>
            <ChevronDown size={16} color="black" />
          </View>
        </View>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdown}>
          <TouchableOpacity style={styles.option} onPress={() => console.log("Selected Option 1")} onPressIn={() => setIsOpen(false)}>
            <Text>Option 1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={() => console.log("Selected Option 2")} onPressIn={() => setIsOpen(false)}>
            <Text>Option 2</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
  },
  button: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    backgroundColor: "white",
    alignSelf: "flex-start",  
    minWidth: 50, 
},

  label: {
    fontWeight: "500",
    fontSize: 12,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
    left: 5,
  },
  badgeText: {
    fontSize: 10,
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    width: "100%",
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "white",
    borderRadius: 5,
    elevation: 2, // Thay cho boxShadow
    padding: 8,
  },
  option: {
    padding: 8,
    borderRadius: 4,
  },
});

export default DropdownFilter;
