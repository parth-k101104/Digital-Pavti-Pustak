import React, { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { createButtonPressAnimation } from "../utils/animations";
import colors from "../styles/colors";
import typography from "../styles/typography";

export default function UpdatePayments() {
  const navigation = useNavigation();
  const scaleAnim1 = useRef(new Animated.Value(1)).current;
  const scaleAnim2 = useRef(new Animated.Value(1)).current;

  const buttonPress1 = createButtonPressAnimation(scaleAnim1);
  const buttonPress2 = createButtonPressAnimation(scaleAnim2);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={typography.subHeading}>Update Payments</Text>
      </View>

      <View style={styles.cardRow}>
        {/* Donations Received Card */}
        <Animated.View style={{ transform: [{ scale: scaleAnim1 }], flex: 1 }}>
          <TouchableOpacity
            style={[styles.card, styles.receivedCard]}
            onPress={() => navigation.navigate("Donations")}
            activeOpacity={0.8}
            {...buttonPress1}
          >
            <View style={styles.cardIcon}>
              <Ionicons name="add-circle" size={32} color={colors.secondary} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.secondary }]}>
              Donations Received
            </Text>
            <View style={[styles.button, { backgroundColor: colors.secondary }]}>
              <Ionicons name="add" size={16} color={colors.cardBg} />
              <Text style={styles.buttonText}>Add money</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Donations Spent Card */}
        <Animated.View style={{ transform: [{ scale: scaleAnim2 }], flex: 1 }}>
          <TouchableOpacity
            style={[styles.card, styles.spentCard]}
            activeOpacity={0.8}
            {...buttonPress2}
          >
            <View style={styles.cardIcon}>
              <Ionicons name="remove-circle" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.primary }]}>
              Donations Spent
            </Text>
            <View style={[styles.button, { backgroundColor: colors.primary }]}>
              <Ionicons name="remove" size={16} color={colors.cardBg} />
              <Text style={styles.buttonText}>Deduct money</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  card: {
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: colors.shadowMedium,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  receivedCard: {
    backgroundColor: colors.secondarySoft,
  },
  spentCard: {
    backgroundColor: colors.primarySoft,
  },
  cardIcon: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: colors.shadowDark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: colors.cardBg,
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 4,
  },
});
