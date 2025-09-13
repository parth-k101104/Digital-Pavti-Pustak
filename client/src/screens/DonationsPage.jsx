import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, Alert, ScrollView, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Header from "../components/Header";
import AnimatedButton from "../components/AnimatedButton";
import { useAuth } from "../context/AuthContext";
import { createFadeInAnimation, createStaggerAnimation } from "../utils/animations";
import colors from "../styles/colors";

export default function DonationsPage() {
  const [donorName, setDonorName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigation = useNavigation();
  const { user, isAdmin } = useAuth();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const inputAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    // Fade in the header first, then stagger the inputs
    Animated.sequence([
      createFadeInAnimation(fadeAnim, 400),
      createStaggerAnimation(inputAnims, 150),
    ]).start();
  }, [fadeAnim, inputAnims]);

  const handleSubmit = async () => {
    if (!donorName || !address || !phone || !amount) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    // Validate amount
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would typically save to a database
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      Alert.alert(
        "Success",
        `Donation submitted successfully!\n\nDonor: ${donorName}\nPhone: ${phone}\nAmount: ₹${amount}`,
        [
          {
            text: "OK",
            onPress: () => {
              // Clear form after successful submission
              setDonorName("");
              setAddress("");
              setPhone("");
              setAmount("");
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to submit donation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Donations" />
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={[styles.headerSection, { opacity: fadeAnim }]}>
          <Text style={styles.heading}>Donation Form</Text>
          <Text style={styles.subheading}>
            Welcome, {user?.name}! Please fill in the donation details below.
          </Text>
        </Animated.View>

        {/* Donor Name */}
        <Animated.View style={[styles.inputContainer, { opacity: inputAnims[0] }]}>
          <Ionicons name="person-outline" size={20} color={colors.textLight} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Donor Name"
            value={donorName}
            onChangeText={setDonorName}
            placeholderTextColor={colors.textMuted}
          />
        </Animated.View>

        {/* Address */}
        <Animated.View style={[styles.inputContainer, { opacity: inputAnims[1] }]}>
          <Ionicons name="home-outline" size={20} color={colors.textLight} style={styles.icon} />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
            multiline
            placeholderTextColor={colors.textMuted}
          />
        </Animated.View>

        {/* Phone */}
        <Animated.View style={[styles.inputContainer, { opacity: inputAnims[2] }]}>
          <Ionicons name="call-outline" size={20} color={colors.textLight} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            placeholderTextColor={colors.textMuted}
          />
        </Animated.View>

        {/* Amount */}
        <Animated.View style={[styles.inputContainer, { opacity: inputAnims[3] }]}>
          <Ionicons name="cash-outline" size={20} color={colors.textLight} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Amount (₹)"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            placeholderTextColor={colors.textMuted}
          />
        </Animated.View>

        {/* Submit Button */}
        <AnimatedButton
          title="Submit Donation"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
          variant="primary"
          size="large"
          style={styles.submitButton}
          icon={<Ionicons name="heart" size={20} color={colors.cardBg} style={{ marginRight: 8 }} />}
        />

        {/* Quick Actions for Admin */}
        {isAdmin() && (
          <View style={styles.adminActions}>
            <Text style={styles.adminTitle}>Admin Actions</Text>
            <AnimatedButton
              title="Go to Dashboard"
              onPress={() => navigation.navigate('Home')}
              variant="secondary"
              size="medium"
              style={styles.adminButton}
              icon={<Ionicons name="speedometer" size={18} color={colors.cardBg} style={{ marginRight: 6 }} />}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 24,
    alignItems: "center",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 12,
    color: colors.textDark,
    textAlign: "center",
  },
  subheading: {
    fontSize: 16,
    color: colors.textMedium,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 20,
    width: "100%",
    backgroundColor: colors.cardBg,
    shadowColor: colors.shadowMedium,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginRight: 12,
    marginTop: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: colors.textDark,
    fontWeight: "500",
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  submitButton: {
    marginTop: 24,
    width: "100%",
  },
  adminActions: {
    marginTop: 40,
    width: "100%",
    alignItems: "center",
    paddingTop: 24,
    borderTopWidth: 2,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadowLight,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  adminTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textDark,
    marginBottom: 16,
    textAlign: "center",
  },
  adminButton: {
    width: "100%",
  },
});
