import { ScrollView } from "react-native";
import Header from "../components/Header";
import DonationsSummary from "../components/DonationsSummary";
import UpdatePayments from "../components/UpdatePayments";
import RecentTransactions from "../components/RecentTransactions";
import ProtectedRoute from "../components/ProtectedRoute";

export default function HomePage() {
  return (
    <ProtectedRoute adminOnly={true}>
      <ScrollView className="flex-1 bg-gray-50">
        <Header />
        <DonationsSummary />
        <UpdatePayments />
      </ScrollView>
    </ProtectedRoute>
  );
}
