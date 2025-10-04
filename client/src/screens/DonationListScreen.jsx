import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Animated,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Header from "../components/Header";
import AnimatedButton from "../components/AnimatedButton";
import { useAuth } from "../context/AuthContext";
import { createFadeInAnimation } from "../utils/animations";
import colors from "../styles/colors";
import apiService from "../services/apiService";

export default function DonationListScreen() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [stats, setStats] = useState(null);

  const navigation = useNavigation();
  const { isAdmin } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ✅ Restrict non-admin users
  useEffect(() => {
    if (!isAdmin()) {
      Alert.alert("Access Denied", "Only administrators can view this page.");
      navigation.goBack();
      return;
    }
    createFadeInAnimation(fadeAnim, 400).start();
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      loadDonations();
      loadYearStats();
    }
  }, [selectedYear]);

  const loadInitialData = async () => {
    try {
      await Promise.all([loadAvailableYears(), loadDonations(), loadYearStats()]);
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableYears = async () => {
    try {
      const result = await apiService.getAvailableYears();
      console.log("🔍 API Response for years:", JSON.stringify(result, null, 2));

      if (result.success && result.data) {
        console.log("✅ Setting available years:", result.data.years);
        setAvailableYears(result.data.years || []);
      }
    } catch (error) {
      console.error("Error loading available years:", error);
    }
  };

  const loadDonations = async () => {
    try {
      const result = await apiService.getDonationsByYear(selectedYear);
      console.log("🔍 API Response for donations:", JSON.stringify(result, null, 2));

      if (result.success && result.data) {
        console.log("✅ Setting donations:", result.data.donations);
        setDonations(result.data.donations || []);
      } else {
        const errorMessage = result.data?.message || result.error || "Failed to load donations";
        console.log("❌ Error loading donations:", errorMessage);
        Alert.alert("Error", errorMessage);
      }
    } catch (error) {
      console.error("Error loading donations:", error);
      Alert.alert("Error", "Failed to load donations. Please try again.");
    }
  };

  const loadYearStats = async () => {
    try {
      const result = await apiService.getYearStats(selectedYear);
      if (result.success && result.data) {
        setStats({
          totalRecords: result.data.totalRecords,
          firstDonationDate: result.data.firstDonationDate,
          lastDonationDate: result.data.lastDonationDate,
        });
      }
    } catch (error) {
      console.error("Error loading year stats:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDonations();
    await loadYearStats();
    setRefreshing(false);
  };

  const handleDeleteDonation = async (donation) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete the donation from ${donation.donorName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await apiService.deleteDonation(selectedYear, donation.id);
              if (result.success) {
                Alert.alert("Success", "Donation deleted successfully");
                loadDonations();
              } else {
                Alert.alert("Error", result.message || "Failed to delete donation");
              }
            } catch (error) {
              console.error("Error deleting donation:", error);
              Alert.alert("Error", "Failed to delete donation. Please try again.");
            }
          },
        },
      ]
    );
  };

  const renderYearSelector = () => (
    <View style={styles.yearSelector}>
      <Text style={styles.yearSelectorTitle}>Select Year:</Text>
      <View style={styles.yearButtons}>
        {availableYears.map((year) => (
          <TouchableOpacity
            key={year}
            style={[
              styles.yearButton,
              selectedYear === year && styles.selectedYearButton,
            ]}
            onPress={() => setSelectedYear(year)}
          >
            <Text
              style={[
                styles.yearButtonText,
                selectedYear === year && styles.selectedYearButtonText,
              ]}
            >
              {year}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStats = () =>
    stats && (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Year {selectedYear} Summary</Text>
        <Text style={styles.statsText}>Total Donations: {stats.totalRecords}</Text>
        {stats.firstDonationDate && (
          <Text style={styles.statsText}>
            First Donation: {new Date(stats.firstDonationDate).toLocaleDateString()}
          </Text>
        )}
        {stats.lastDonationDate && (
          <Text style={styles.statsText}>
            Last Donation: {new Date(stats.lastDonationDate).toLocaleDateString()}
          </Text>
        )}
      </View>
    );

  const renderTable = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.tableContainer}
    >
      <View>
        {/* Table Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, styles.headerText, { width: 80 }]}>ID</Text>
          <Text style={[styles.tableCell, styles.headerText, { width: 160 }]}>Donor</Text>
          <Text style={[styles.tableCell, styles.headerText, { width: 120 }]}>Amount</Text>
          <Text style={[styles.tableCell, styles.headerText, { width: 120 }]}>Type</Text>
          <Text style={[styles.tableCell, styles.headerText, { width: 160 }]}>Phone</Text>
          <Text style={[styles.tableCell, styles.headerText, { width: 200 }]}>Address</Text>
          <Text style={[styles.tableCell, styles.headerText, { width: 140 }]}>Date</Text>
          <Text style={[styles.tableCell, styles.headerText, { width: 140 }]}>Created By</Text>
          <Text style={[styles.tableCell, styles.headerText, { width: 100 }]}>Action</Text>
        </View>

        {/* Table Body */}
        {donations.map((item, index) => (
          <View
            key={item.id || index}
            style={[
              styles.tableRow,
              { backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff" },
            ]}
          >
            <Text style={[styles.tableCell, { width: 80 }]}>{item.id}</Text>
            <Text style={[styles.tableCell, { width: 160 }]}>{item.donorName}</Text>
            <Text style={[styles.tableCell, { width: 120 }]}>₹{item.donationAmount}</Text>
            <Text style={[styles.tableCell, { width: 120 }]}>{item.donationType}</Text>
            <Text style={[styles.tableCell, { width: 160 }]}>{item.donorPhone}</Text>
            <Text style={[styles.tableCell, { width: 200 }]}>{item.donorAddress}</Text>
            <Text style={[styles.tableCell, { width: 140 }]}>
              {new Date(item.createdDate).toLocaleDateString()}
            </Text>
            <Text style={[styles.tableCell, { width: 140 }]}>{item.createdBy}</Text>

            <TouchableOpacity
              onPress={() => handleDeleteDonation(item)}
              style={styles.deleteIcon}
            >
              <Ionicons name="trash" size={18} color="red" />
            </TouchableOpacity>
          </View>
        ))}

        {donations.length === 0 && (
          <Text style={styles.emptyText}>No donations found for {selectedYear}</Text>
        )}
      </View>
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Donation List" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading donations...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Donation List" />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {renderYearSelector()}
        {renderStats()}

        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {renderTable()}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textLight,
  },
  yearSelector: {
    marginBottom: 16,
  },
  yearSelectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  yearButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  yearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedYearButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  yearButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  selectedYearButtonText: {
    color: colors.white,
  },
  statsContainer: {
    backgroundColor: colors.cardBg,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  statsText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },

  /*** 🧾 TABLE STYLING ***/
  tableContainer: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  tableHeaderText: {
    flex: 1,
    color: colors.white,
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 6,
    backgroundColor: colors.cardBg,
  },
  tableRowAlt: {
    backgroundColor: colors.background,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    color: colors.text,
  },
  tableCellSmall: {
    flex: 0.6,
  },
  tableCellLarge: {
    flex: 1.4,
  },
  tableActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: colors.warning,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },

  /*** EMPTY STATE + ADD BUTTON ***/
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  addButton: {
    marginTop: 16,
  },
});
