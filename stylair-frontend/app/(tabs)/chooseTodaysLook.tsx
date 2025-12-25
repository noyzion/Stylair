import { useState } from "react";
import {
  TextInput,
  StyleSheet,
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Pressable } from "react-native";
import { API_ENDPOINTS } from "@/constants/config"; //import the API_ENDPOINTS from the config file

export default function TodayLookScreen() {
  const [message, setMessage] = useState("");

  const [outfits, setOutfits] = useState([]); //list of outfits and function to set it (inital empty list)
  const [loading, setLoading] = useState(false); //loading state and function to set it (inital false)
  const [error, setError] = useState<string | null>(null); //error state and function to set it (inital null)

  //function to send the message to the API, async because we are using await to wait for the response
  const handleSend = async () => {
    if (message === "") return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.OUTFIT_RECOMMENDATION, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch outfits");
      }
      const data = await response.json();
      setOutfits(data.outfits);
      setMessage(""); //clear the message
      setLoading(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: "#F5F5F7" }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.centerContainer}>
          <Text style={styles.header}>
            Let’s find the perfect outfit for today...
          </Text>

          {/* Chat input */}
          <View style={styles.inputContainer}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type your message..."
              placeholderTextColor="#999"
              style={styles.input}
            />
            <Pressable onPress={handleSend} style={styles.sendButton}>
              <Text style={styles.sendButtonText}>Send</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  header: {
    fontFamily: "Manrope-bold",
    fontSize: 30,
    fontWeight: "700",
    color: "rgb(108, 99, 255)",
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.79)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0)",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    backgroundColor: "transparent",
  },
  sendButton: {
    backgroundColor: "rgb(108, 99, 255)",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "500",
  },
});
