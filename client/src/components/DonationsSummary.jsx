import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import colors from "../styles/colors";
import typography from "../styles/typography";

const DROPDOWN_OPTIONS = ["monthly", "yearly", "quarterly"];

export default function DonationsSummary({ amount }) {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
  };

  const onSelectPeriod = (period) => {
    setSelectedPeriod(period);
    setDropdownVisible(false);
  };

  return (
    <View style={styles.donationBox}>
      {/* Top Row: title + dropdown */}
      <View style={styles.headerRow}>
        <Text style={typography.small}>Donations received</Text>

        {/* Dropdown trigger */}
        <TouchableOpacity style={styles.dropdown} onPress={toggleDropdown}>
          <Text style={styles.dropdownText}>{selectedPeriod}</Text>
          <Feather
            name={dropdownVisible ? "chevron-up" : "chevron-down"}
            size={16}
            color={colors.textDark}
          />
        </TouchableOpacity>
      </View>

      {/* Dropdown list (absolute floating menu) */}
      {dropdownVisible && (
        <View style={styles.dropdownList}>
          {DROPDOWN_OPTIONS.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.dropdownItem}
              onPress={() => onSelectPeriod(item)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  item === selectedPeriod && styles.selectedText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Amount */}
      <Text style={styles.amount}>₹ {amount}</Text>

      {/* Plus / Minus Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.circleBtn}>
          <Feather name="plus" size={18} color={colors.textDark} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.circleBtn}>
          <Feather name="minus" size={18} color={colors.textDark} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  donationBox: {
    marginTop: 20,
    marginHorizontal: 16,
    padding: 20,
    backgroundColor: colors.cardBg, // card background color
    borderRadius: 16,
    position: "relative",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownText: {
    fontSize: 12,
    marginRight: 4,
    color: colors.textDark,
  },
  dropdownList: {
    position: "absolute",
    top: 55, // below the trigger
    right: 20,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    zIndex: 9999,
    elevation: 5,
    boxShadow: "2px 4px 6px rgba(0,0,0,0.08)", 
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  selectedText: {
    fontWeight: "700",
    color: colors.primary,
  },
  amount: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textDark,
    marginTop: 8,
  },
  actions: {
    position: "absolute",
    right: 20,
    bottom: 20,
    flexDirection: "row",
  },
  circleBtn: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 6,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
});
