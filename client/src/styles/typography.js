import { StyleSheet } from "react-native";
import colors from "./colors";

export default StyleSheet.create({
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textDark,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textDark,
  },
  body: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.textLight,
  },
  small: {
    fontSize: 12,
    fontWeight: "400",
    color: colors.textLight,
  },
});
