import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import colors from "../styles/colors";
import typography from "../styles/typography";

export default function TransactionItem({ type, title, date, amount }) {
  const isPositive = amount > 0;

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <Feather
          name={type === "expense" ? "scissors" : "gift"}
          size={20}
          color={isPositive ? colors.success : colors.danger}
        />
        <View style={{ marginLeft: 12 }}>
          <Text style={typography.body}>{title}</Text>
          <Text style={typography.small}>{date}</Text>
        </View>
      </View>

      <Text
        style={[
          styles.amount,
          { color: isPositive ? colors.success : colors.danger },
        ]}
      >
        {isPositive ? `+₹${amount}` : `-₹${Math.abs(amount)}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    boxShadow: "2px 4px 6px rgba(0,0,0,0.08)", 
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  amount: {
    fontSize: 15,
    fontWeight: "600",
  },
});

