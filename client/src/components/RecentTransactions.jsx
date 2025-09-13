import { View, Text, StyleSheet } from "react-native";
import colors from "../styles/colors";
import typography from "../styles/typography";
import TransactionItem from "./TransactionItem";

export default function RecentTransactions() {
  const transactions = [
    { type: "expense", title: "Maintenance and cleaning", date: "23 June, 2024 10:28 am", amount: -1200 },
    { type: "income", title: "Prakhar Seth", date: "23 June, 2024 11:14 am", amount: 800 },
    { type: "expense", title: "Ration", date: "23 June, 2024 11:45 am", amount: -3500 },
    { type: "income", title: "Anonymous", date: "23 June, 2024 12:20 pm", amount: 200 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={typography.subHeading}>Recent transactions</Text>
        <Text style={typography.small}>See all</Text>
      </View>

      {transactions.map((t, i) => (
        <TransactionItem key={i} {...t} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
});
