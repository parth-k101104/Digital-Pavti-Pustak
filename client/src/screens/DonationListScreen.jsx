import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
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
  const { user, isAdmin } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
      await Promise.all([
        loadAvailableYears(),
        loadDonations(),
        loadYearStats()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableYears = async () => {
    try {
      const result = await apiService.getAvailableYears();
      if (result.success) {
        setAvailableYears(result.years || []);
      }
    } catch (error) {
      console.error('Error loading available years:', error);
    }
  };

  const loadDonations = async () => {
    try {
      const result = isAdmin() 
        ? await apiService.getDonationsByYear(selectedYear)
        : await apiService.getDonationsByYear(selectedYear);
      
      if (result.success) {
        setDonations(result.donations || []);
      } else {
        Alert.alert("Error", result.message || "Failed to load donations");
      }
    } catch (error) {
      console.error('Error loading donations:', error);
      Alert.alert("Error", "Failed to load donations. Please try again.");
    }
  };

  const loadYearStats = async () => {
    try {
      const result = await apiService.getYearStats(selectedYear);
      if (result.success) {
        setStats({
          totalRecords: result.totalRecords,
          firstDonationDate: result.firstDonationDate,
          lastDonationDate: result.lastDonationDate
        });
      }
    } catch (error) {
      console.error('Error loading year stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDonations();
    await loadYearStats();
    setRefreshing(false);
  };

  const handleEditDonation = (donation) => {
    if (!isAdmin()) {
      Alert.alert("Access Denied", "Only administrators can edit donations.");
      return;
    }
    
    // Navigate to edit screen (to be implemented)
    Alert.alert("Edit Donation", `Edit functionality for donation ID ${donation.id} will be implemented.`);
  };

  const handleDeleteDonation = async (donation) => {
    if (!isAdmin()) {
      Alert.alert("Access Denied", "Only administrators can delete donations.");
      return;
    }

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
                loadDonations(); // Refresh the list
              } else {
                Alert.alert("Error", result.message || "Failed to delete donation");
              }
            } catch (error) {
              console.error('Error deleting donation:', error);
              Alert.alert("Error", "Failed to delete donation. Please try again.");
            }
          }
        }
      ]
    );
  };

  const renderDonationItem = ({ item }) => (
    <View style={styles.donationCard}>
      <View style={styles.donationHeader}>
        <Text style={styles.donorName}>{item.donorName}</Text>
        <Text style={styles.amount}>₹{item.donationAmount}</Text>
      </View>
      
      <View style={styles.donationDetails}>
        <Text style={styles.detailText}>
          <Ionicons name="call" size={14} color={colors.textLight} /> {item.donorPhone}
        </Text>
        <Text style={styles.detailText}>
          <Ionicons name="location" size={14} color={colors.textLight} /> {item.donorAddress}
        </Text>
        <Text style={styles.detailText}>
          <Ionicons name="card" size={14} color={colors.textLight} /> {item.donationType}
        </Text>
        <Text style={styles.detailText}>
          <Ionicons name="calendar" size={14} color={colors.textLight} /> {new Date(item.createdDate).toLocaleDateString()}
        </Text>
        <Text style={styles.detailText}>
          <Ionicons name="person" size={14} color={colors.textLight} /> Created by: {item.createdBy}
        </Text>
        {item.notes && (
          <Text style={styles.notesText}>
            <Ionicons name="document-text" size={14} color={colors.textLight} /> {item.notes}
          </Text>
        )}
      </View>

      {isAdmin() && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditDonation(item)}
          >
            <Ionicons name="pencil" size={16} color={colors.white} />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteDonation(item)}
          >
            <Ionicons name="trash" size={16} color={colors.white} />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderYearSelector = () => (
    <View style={styles.yearSelector}>
      <Text style={styles.yearSelectorTitle}>Select Year:</Text>
      <View style={styles.yearButtons}>
        {availableYears.map((year) => (
          <TouchableOpacity
            key={year}
            style={[
              styles.yearButton,
              selectedYear === year && styles.selectedYearButton
            ]}
            onPress={() => setSelectedYear(year)}
          >
            <Text style={[
              styles.yearButtonText,
              selectedYear === year && styles.selectedYearButtonText
            ]}>
              {year}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStats = () => (
    stats && (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Year {selectedYear} Statistics</Text>
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
    )
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
        
        <FlatList
          data={donations}
          renderItem={renderDonationItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={64} color={colors.textMuted} />
              <Text style={styles.emptyText}>No donations found for {selectedYear}</Text>
              <Text style={styles.emptySubtext}>
                {isAdmin() ? "All donations for this year will appear here" : "Your donations for this year will appear here"}
              </Text>
            </View>
          }
          contentContainerStyle={donations.length === 0 ? styles.emptyList : null}
        />

        <AnimatedButton
          title="Add New Donation"
          onPress={() => navigation.navigate('Donations')}
          variant="primary"
          size="large"
          style={styles.addButton}
          icon={<Ionicons name="add" size={20} color={colors.white} />}
        />
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
  donationCard: {
    backgroundColor: colors.cardBg,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  donationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  donorName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  donationDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  notesText: {
    fontSize: 14,
    color: colors.textLight,
    fontStyle: 'italic',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
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
  },
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
