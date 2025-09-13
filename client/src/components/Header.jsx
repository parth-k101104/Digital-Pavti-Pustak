import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import colors from "../styles/colors";

export default function Header({ title }) {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      {/* Left - Menu */}
      <View style={styles.leftRow}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={26} color={colors.textDark} style={styles.icon} />
        </TouchableOpacity>
        <View>
          {title ? (
            <Text style={styles.pageTitle}>{title}</Text>
          ) : (
            <>
              <Text style={styles.title}>श्री</Text>
              <Text style={styles.subtitle}>साई सेवा मंडळ</Text>
            </>
          )}
        </View>
      </View>

      {/* Right - Icons */}
      <View style={styles.iconRow}>
        <Ionicons name="search-outline" size={22} color={colors.textDark} style={styles.icon} />
        <Ionicons name="notifications-outline" size={22} color={colors.textDark} style={styles.icon} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  leftRow: { flexDirection: "row", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "700", color: colors.primary },
  subtitle: { fontSize: 18, fontWeight: "600", color: colors.primary },
  pageTitle: { fontSize: 20, fontWeight: "700", color: colors.textDark },
  iconRow: { flexDirection: "row", alignItems: "center" },
  icon: { marginLeft: 16, marginRight: 8 },
});
