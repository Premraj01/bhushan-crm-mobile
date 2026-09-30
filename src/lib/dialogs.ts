import { Alert, Platform } from "react-native";

/** A message with an OK button. `Alert.alert` does nothing on web, so the preview uses the browser's. */
export function notify(title: string, message: string) {
  if (Platform.OS === "web") window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
}

/** Cancel / confirm dialog; `onConfirm` runs only when the user confirms. */
export function confirm(title: string, message: string, action: string, onConfirm: () => void) {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    { text: action, style: "destructive", onPress: onConfirm },
  ]);
}
