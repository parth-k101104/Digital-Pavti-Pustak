import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, ScrollView, Animated, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Header from "../components/Header";
import AnimatedButton from "../components/AnimatedButton";
import { useAuth } from "../context/AuthContext";
import { createFadeInAnimation, createStaggerAnimation } from "../utils/animations";
import colors from "../styles/colors";
import apiService from "../services/apiService";

// Toast Component
const ToastComponent = ({ visible, message, type, onDismiss }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 3 seconds
      const timer = setTimeout(() => {
        onDismiss();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return { backgroundColor: '#4CAF50' };
      case 'error':
        return { backgroundColor: '#F44336' };
      case 'info':
        return { backgroundColor: '#2196F3' };
      default:
        return { backgroundColor: '#4CAF50' };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      case 'info':
        return 'information-circle';
      default:
        return 'checkmark-circle';
    }
  };

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        getToastStyle(),
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Ionicons name={getIcon()} size={20} color="white" style={styles.toastIcon} />
      <Text style={styles.toastText}>{message}</Text>
      <TouchableOpacity onPress={onDismiss} style={styles.toastCloseButton}>
        <Ionicons name="close" size={18} color="white" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function DonationsPage() {
  const [donorName, setDonorName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [donationType, setDonationType] = useState("Cash");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

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

  // Toast utility function
  const showToastMessage = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const hideToast = () => {
    setShowToast(false);
  };

  // Real-time validation functions
  const validateField = (field, value) => {
    let error = "";

    switch (field) {
      case "donorName":
        if (!value.trim()) {
          error = "Donor name is required";
        } else if (value.trim().length < 2) {
          error = "Donor name must be at least 2 characters";
        } else if (value.trim().length > 100) {
          error = "Donor name cannot exceed 100 characters";
        }
        break;

      case "address":
        if (!value.trim()) {
          error = "Address is required";
        } else if (value.trim().length < 5) {
          error = "Address must be at least 5 characters";
        } else if (value.trim().length > 255) {
          error = "Address cannot exceed 255 characters";
        }
        break;

      case "phone":
        if (!value.trim()) {
          error = "Phone number is required";
        } else {
          const cleanPhone = value.replace(/[^0-9]/g, '');
          if (cleanPhone.length < 10) {
            error = "Phone number must be at least 10 digits";
          } else if (cleanPhone.length > 15) {
            error = "Phone number cannot exceed 15 digits";
          }
        }
        break;

      case "amount":
        if (!value.trim()) {
          error = "Amount is required";
        } else {
          const numericAmount = parseFloat(value);
          if (isNaN(numericAmount)) {
            error = "Please enter a valid number";
          } else if (numericAmount <= 0) {
            error = "Amount must be greater than 0";
          } else if (numericAmount > 10000000) {
            error = "Amount cannot exceed ₹1,00,00,000";
          }
        }
        break;

      case "donationType":
        if (!value.trim()) {
          error = "Donation type is required";
        } else if (value.trim().length > 50) {
          error = "Donation type cannot exceed 50 characters";
        }
        break;

      case "notes":
        if (value && value.length > 500) {
          error = "Notes cannot exceed 500 characters";
        }
        break;
    }

    return error;
  };

  const handleFieldChange = (field, value) => {
    // Update the field value
    switch (field) {
      case "donorName":
        setDonorName(value);
        break;
      case "address":
        setAddress(value);
        break;
      case "phone":
        setPhone(value);
        break;
      case "amount":
        setAmount(value);
        break;
      case "donationType":
        setDonationType(value);
        break;
      case "notes":
        setNotes(value);
        break;
    }

    // Mark field as touched
    setTouched(prev => ({ ...prev, [field]: true }));

    // Validate field and update errors
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateForm = () => {
    const fields = ["donorName", "address", "phone", "amount", "donationType"];
    const values = { donorName, address, phone, amount, donationType, notes };
    const newErrors = {};
    let hasErrors = false;

    // Validate all fields
    fields.forEach(field => {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    // Validate notes separately (optional field)
    const notesError = validateField("notes", notes);
    if (notesError) {
      newErrors.notes = notesError;
      hasErrors = true;
    }

    // Mark all fields as touched
    const allTouched = {};
    [...fields, "notes"].forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);
    setErrors(newErrors);

    if (hasErrors) {
      showToastMessage("Please fix the errors below", "error");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare donation data according to backend API schema
      const donationData = {
        donorName: donorName.trim(),
        donorAddress: address.trim(),
        donorPhone: phone.trim(),
        donationAmount: parseFloat(amount),
        donationType: donationType.trim() || "Cash",
        notes: notes.trim() || null,
      };

      console.log('Submitting donation:', donationData);
      const result = await apiService.createDonation(donationData);

      if (result.success) {
        showToastMessage(
          `Donation submitted successfully! ₹${amount} from ${donorName}`,
          "success"
        );

        // Clear form after successful submission
        setDonorName("");
        setAddress("");
        setPhone("");
        setAmount("");
        setDonationType("Cash");
        setNotes("");
        setErrors({});
        setTouched({});
      } else {
        // Handle backend validation errors
        const errorMessage = result.message || "Failed to submit donation";
        showToastMessage(errorMessage, "error");

        // If there are specific field errors from backend, we could handle them here
        console.error('Backend validation error:', result);
      }
    } catch (error) {
      console.error('Donation submission error:', error);

      // Handle different types of errors
      if (error.message && error.message.includes('Network')) {
        showToastMessage("Network error. Please check your connection and try again.", "error");
      } else if (error.message && error.message.includes('401')) {
        showToastMessage("Authentication required. Please log in again.", "error");
      } else if (error.message && error.message.includes('403')) {
        showToastMessage("Access denied. You don't have permission to create donations.", "error");
      } else {
        showToastMessage("Failed to submit donation. Please try again.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Donations" />

      {/* Toast Component */}
      <ToastComponent
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onDismiss={hideToast}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={[styles.headerSection, { opacity: fadeAnim }]}>
          <Text style={styles.heading}>Donation Form</Text>
          <Text style={styles.subheading}>
            Welcome, {user?.name}! Please fill in the donation details below.
          </Text>
        </Animated.View>

        {/* Donor Name */}
        <Animated.View style={[styles.inputContainer, { opacity: inputAnims[0] }]}>
          <View style={[
            styles.inputWrapper,
            touched.donorName && errors.donorName && styles.inputWrapperError,
            touched.donorName && !errors.donorName && donorName.trim() && styles.inputWrapperValid
          ]}>
            <Ionicons
              name="person-outline"
              size={20}
              color={touched.donorName && errors.donorName ? colors.danger :
                touched.donorName && !errors.donorName && donorName.trim() ? colors.success : colors.textLight}
              style={styles.icon}
            />
            <TextInput
              style={[
                styles.input,
                touched.donorName && errors.donorName && styles.inputError,
                touched.donorName && !errors.donorName && donorName.trim() && styles.inputValid
              ]}
              placeholder="Donor Name"
              value={donorName}
              onChangeText={(text) => handleFieldChange("donorName", text)}
              onBlur={() => setTouched(prev => ({ ...prev, donorName: true }))}
              placeholderTextColor={colors.textMuted}
            />
            {touched.donorName && errors.donorName && (
              <Ionicons
                name="alert-circle"
                size={20}
                color={colors.danger}
                style={styles.validationIcon}
              />
            )}
            {touched.donorName && !errors.donorName && donorName.trim() && (
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.success}
                style={styles.validationIcon}
              />
            )}
          </View>
          {touched.donorName && errors.donorName && (
            <Text style={styles.errorText}>{errors.donorName}</Text>
          )}
        </Animated.View>

        {/* Address */}
        <Animated.View style={[styles.inputContainer, { opacity: inputAnims[1] }]}>
          <View style={[
            styles.inputWrapper,
            touched.address && errors.address && styles.inputWrapperError,
            touched.address && !errors.address && address.trim() && styles.inputWrapperValid
          ]}>
            <Ionicons
              name="home-outline"
              size={20}
              color={touched.address && errors.address ? colors.danger :
                touched.address && !errors.address && address.trim() ? colors.success : colors.textLight}
              style={styles.icon}
            />
            <TextInput
              style={[
                styles.input,
                styles.multilineInput,
                touched.address && errors.address && styles.inputError,
                touched.address && !errors.address && address.trim() && styles.inputValid
              ]}
              placeholder="Address"
              value={address}
              onChangeText={(text) => handleFieldChange("address", text)}
              onBlur={() => setTouched(prev => ({ ...prev, address: true }))}
              multiline
              placeholderTextColor={colors.textMuted}
            />
            {touched.address && errors.address && (
              <Ionicons
                name="alert-circle"
                size={20}
                color={colors.danger}
                style={styles.validationIcon}
              />
            )}
            {touched.address && !errors.address && address.trim() && (
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.success}
                style={styles.validationIcon}
              />
            )}
          </View>
          {touched.address && errors.address && (
            <Text style={styles.errorText}>{errors.address}</Text>
          )}
        </Animated.View>

        {/* Phone */}
        <Animated.View style={[styles.inputContainer, { opacity: inputAnims[2] }]}>
          <View style={[
            styles.inputWrapper,
            touched.phone && errors.phone && styles.inputWrapperError,
            touched.phone && !errors.phone && phone.trim() && styles.inputWrapperValid
          ]}>
            <Ionicons
              name="call-outline"
              size={20}
              color={touched.phone && errors.phone ? colors.danger :
                touched.phone && !errors.phone && phone.trim() ? colors.success : colors.textLight}
              style={styles.icon}
            />
            <TextInput
              style={[
                styles.input,
                touched.phone && errors.phone && styles.inputError,
                touched.phone && !errors.phone && phone.trim() && styles.inputValid
              ]}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(text) => handleFieldChange("phone", text)}
              onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
              placeholderTextColor={colors.textMuted}
            />
            {touched.phone && errors.phone && (
              <Ionicons
                name="alert-circle"
                size={20}
                color={colors.danger}
                style={styles.validationIcon}
              />
            )}
            {touched.phone && !errors.phone && phone.trim() && (
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.success}
                style={styles.validationIcon}
              />
            )}
          </View>
          {touched.phone && errors.phone && (
            <Text style={styles.errorText}>{errors.phone}</Text>
          )}
        </Animated.View>

        {/* Amount */}
        <Animated.View style={[styles.inputContainer, { opacity: inputAnims[3] }]}>
          <View style={[
            styles.inputWrapper,
            touched.amount && errors.amount && styles.inputWrapperError,
            touched.amount && !errors.amount && amount.trim() && styles.inputWrapperValid
          ]}>
            <Ionicons
              name="cash-outline"
              size={20}
              color={touched.amount && errors.amount ? colors.danger :
                touched.amount && !errors.amount && amount.trim() ? colors.success : colors.textLight}
              style={styles.icon}
            />
            <TextInput
              style={[
                styles.input,
                touched.amount && errors.amount && styles.inputError,
                touched.amount && !errors.amount && amount.trim() && styles.inputValid
              ]}
              placeholder="Amount (₹)"
              keyboardType="numeric"
              value={amount}
              onChangeText={(text) => handleFieldChange("amount", text)}
              onBlur={() => setTouched(prev => ({ ...prev, amount: true }))}
              placeholderTextColor={colors.textMuted}
            />
            {touched.amount && errors.amount && (
              <Ionicons
                name="alert-circle"
                size={20}
                color={colors.danger}
                style={styles.validationIcon}
              />
            )}
            {touched.amount && !errors.amount && amount.trim() && (
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.success}
                style={styles.validationIcon}
              />
            )}
          </View>
          {touched.amount && errors.amount && (
            <Text style={styles.errorText}>{errors.amount}</Text>
          )}
        </Animated.View>

        {/* Donation Type */}
        <Animated.View style={[styles.inputContainer, { opacity: inputAnims[4] }]}>
          <View style={[
            styles.inputWrapper,
            touched.donationType && errors.donationType && styles.inputWrapperError,
            touched.donationType && !errors.donationType && donationType.trim() && styles.inputWrapperValid
          ]}>
            <Ionicons
              name="card-outline"
              size={20}
              color={touched.donationType && errors.donationType ? colors.danger :
                touched.donationType && !errors.donationType && donationType.trim() ? colors.success : colors.textLight}
              style={styles.icon}
            />
            <TextInput
              style={[
                styles.input,
                touched.donationType && errors.donationType && styles.inputError,
                touched.donationType && !errors.donationType && donationType.trim() && styles.inputValid
              ]}
              placeholder="Donation Type (Cash, Cheque, Online, etc.)"
              value={donationType}
              onChangeText={(text) => handleFieldChange("donationType", text)}
              onBlur={() => setTouched(prev => ({ ...prev, donationType: true }))}
              placeholderTextColor={colors.textMuted}
            />
            {touched.donationType && errors.donationType && (
              <Ionicons
                name="alert-circle"
                size={20}
                color={colors.danger}
                style={styles.validationIcon}
              />
            )}
            {touched.donationType && !errors.donationType && donationType.trim() && (
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.success}
                style={styles.validationIcon}
              />
            )}
          </View>
          {touched.donationType && errors.donationType && (
            <Text style={styles.errorText}>{errors.donationType}</Text>
          )}
        </Animated.View>

        {/* Notes */}
        <Animated.View style={[styles.inputContainer, { opacity: inputAnims[5] }]}>
          <View style={[
            styles.inputWrapper,
            touched.notes && errors.notes && styles.inputWrapperError
          ]}>
            <Ionicons
              name="document-text-outline"
              size={20}
              color={touched.notes && errors.notes ? colors.danger : colors.textLight}
              style={styles.icon}
            />
            <TextInput
              style={[
                styles.input,
                styles.multilineInput,
                touched.notes && errors.notes && styles.inputError
              ]}
              placeholder="Notes (optional)"
              value={notes}
              onChangeText={(text) => handleFieldChange("notes", text)}
              onBlur={() => setTouched(prev => ({ ...prev, notes: true }))}
              multiline
              placeholderTextColor={colors.textMuted}
            />
            {touched.notes && errors.notes && (
              <Ionicons
                name="alert-circle"
                size={20}
                color={colors.danger}
                style={styles.validationIcon}
              />
            )}
          </View>
          {touched.notes && errors.notes && (
            <Text style={styles.errorText}>{errors.notes}</Text>
          )}
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
    marginBottom: 20,
    width: "100%",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
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
  inputWrapperError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  inputWrapperValid: {
    borderColor: colors.success,
    backgroundColor: colors.successSoft,
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
  inputError: {
    color: colors.danger,
  },
  inputValid: {
    color: colors.success,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  validationIcon: {
    marginLeft: 8,
    marginTop: 12,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 36,
    fontWeight: "500",
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
  // Toast styles
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toastIcon: {
    marginRight: 8,
  },
  toastText: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  toastCloseButton: {
    padding: 4,
    marginLeft: 8,
  },
});
