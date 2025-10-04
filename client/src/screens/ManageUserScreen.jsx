import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { createFadeInAnimation } from "../utils/animations";
import colors from "../styles/colors";
import apiService from "../services/apiService";

export default function ManageUserScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const navigation = useNavigation();
  const { isAdmin } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isAdmin()) {
      Alert.alert("Access Denied", "Only administrators can view this page.");
      navigation.goBack();
      return;
    }
    createFadeInAnimation(fadeAnim, 400).start();
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const result = await apiService.getAllActiveUsers();
      console.log("📦 API Response (Users):", result);

      const usersArray = result?.data?.users;
      if (result.success && Array.isArray(usersArray)) {
        setUsers(usersArray);
      } else {
        console.warn("⚠️ Unexpected format or empty data:", result);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
  };

  const handleDeactivateUser = async () => {
    if (!selectedUser) return;
    try {
      const { firstName, lastName } = selectedUser;
      const result = await apiService.deactivateUser(firstName, lastName);
      console.log("🗑 Deactivate Response:", result);

      if (result.success) {
        Alert.alert("Success", "User deactivated successfully.");
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id ? { ...u, is_active: false } : u
          )
        );
        setShowDeleteModal(false);
      } else {
        Alert.alert("Error", "Failed to deactivate user.");
      }
    } catch (error) {
      console.error("Error deactivating user:", error);
    }
  };

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
          <Text style={[styles.tableCell, styles.headerText, { width: 160 }]}>Name</Text>
          <Text style={[styles.tableCell, styles.headerText, { width: 180 }]}>Phone</Text>
          <Text style={[styles.tableCell, styles.headerText, { width: 120 }]}>Role</Text>
          <Text style={[styles.tableCell, styles.headerText, { width: 120 }]}>Status</Text>
          <Text style={[styles.tableCell, styles.headerText, { width: 100 }]}>Action</Text>
        </View>

        {/* Table Body */}
        {users.map((user, index) => (
          <View
            key={user.id}
            style={[
              styles.tableRow,
              { backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff" },
            ]}
          >
            <Text style={[styles.tableCell, { width: 80 }]}>{user.id}</Text>
            <Text style={[styles.tableCell, { width: 160 }]}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={[styles.tableCell, { width: 180 }]}>
              {user.phoneNumber || "—"}
            </Text>
            <Text style={[styles.tableCell, { width: 120 }]}>{user.role}</Text>
            <Text style={[styles.tableCell, { width: 120 }]}>
              {user.isActive ? "✅ Active" : "❌ Inactive"}
            </Text>

            <TouchableOpacity
              disabled={!user.is_active}
              onPress={() => {
                setSelectedUser(user);
                setShowDeleteModal(true);
              }}
              style={styles.deleteIcon}
            >
              <Ionicons
                name="trash"
                size={18}
                color={user.is_active ? "red" : "gray"}
              />
            </TouchableOpacity>
          </View>
        ))}

        {users.length === 0 && (
          <Text style={styles.emptyText}>No users found</Text>
        )}
      </View>
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Manage Users" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Manage Users" />
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {renderTable()}
        </ScrollView>
      </Animated.View>

      {/* 🗑 Delete Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Ionicons name="warning-outline" size={36} color="red" />
            <Text style={styles.modalTitle}>Deactivate User</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to deactivate{" "}
              <Text style={{ fontWeight: "bold" }}>
                {selectedUser?.firstName} {selectedUser?.lastName}
              </Text>
              ?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeactivateUser}
              >
                <Text style={styles.modalButtonText}>Deactivate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  tableContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textLight,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  headerText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 13,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  tableCell: {
    textAlign: "center",
    fontSize: 13,
    color: colors.text,
  },
  deleteIcon: {
    justifyContent: "center",
    alignItems: "center",
    width: 100,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: "center",
    marginVertical: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginVertical: 10,
  },
  modalMessage: {
    fontSize: 15,
    color: colors.textLight,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors.border,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  modalButtonText: {
    color: colors.white,
    fontWeight: "600",
  },
});
