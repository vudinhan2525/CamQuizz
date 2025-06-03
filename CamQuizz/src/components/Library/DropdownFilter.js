import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronDown } from "lucide-react-native";
import COLORS from '../../constant/colors';

const DropdownFilter = ({ label, count, options = [], onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionSelect = (value, label) => {
    console.log('🎯 DropdownFilter option selected:', { value, label });
    if (onSelect) {
      onSelect(value, label);
    }
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => {
        console.log('🔽 DropdownFilter button clicked, isOpen:', !isOpen);
        setIsOpen(!isOpen);
      }}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.rightContainer}>
          {count !== undefined && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{count}</Text>
            </View>
          )}
          <View style={{transform: [{ rotate: isOpen ? "180deg" : "0deg" }] }}>
            <ChevronDown size={16} color="black" />
          </View>
        </View>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdown}>
          {options && options.length > 0 ? (
            options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.option}
                onPress={() => handleOptionSelect(option.value, option.label)}
              >
                <Text>{option.label}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <>
              <TouchableOpacity style={styles.option} onPress={() => handleOptionSelect("public", "Công khai")}>
                <Text>Công khai</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.option} onPress={() => handleOptionSelect("private", "Riêng tư")}>
                <Text>Riêng tư</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    zIndex: 1000,
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
    elevation: 10,
    zIndex: 1000, 
    padding: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  option: {
    padding: 8,
    borderRadius: 4,
  },
});

export default DropdownFilter;
