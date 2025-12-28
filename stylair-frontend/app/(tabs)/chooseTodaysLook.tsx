import { useState, useEffect } from "react";
import {
  TextInput,
  StyleSheet,
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { Pressable } from "react-native";
import { API_ENDPOINTS } from "@/constants/config"; //import the API_ENDPOINTS from the config file

// Types matching the backend models
interface OutfitItem {
  itemId: string;
  itemName: string;
  itemCategory: string;
  itemImage: string;
  style: string[];
  colors: string[];
  season: string;
}

interface OutfitRecommendation {
  occasionLabel: string;
  items: OutfitItem[];
  reasonText: string;
}

export default function TodayLookScreen() {
  const [message, setMessage] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [outfits, setOutfits] = useState<OutfitRecommendation[]>([]); //list of outfits and function to set it (inital empty list)
  const [loading, setLoading] = useState(false); //loading state and function to set it (inital false)
  const [error, setError] = useState<string | null>(null); //error state and function to set it (inital null)

  // Handle keyboard show/hide to adjust input position
  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

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
        contentContainerStyle={
          outfits.length > 0 || loading || error
            ? styles.scrollContentWithResults
            : styles.scrollContent
        }
      >
        {/* Show header and input in center only if there are no results yet */}
        {outfits.length === 0 && !loading && !error && (
          <View style={styles.headerContainer}>
            <Text style={styles.header}>
              Let's find the perfect outfit for today...
            </Text>

            {/* Chat input - Centered in initial state */}
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
        )}

        {/* Results */}
        {loading && <Text style={styles.loadingText}>Loading...</Text>}
        {error && <Text style={styles.errorText}>Error: {error}</Text>}
        {outfits.length > 0 && (
          <View style={styles.resultsContainer}>
            {outfits.map((outfit, index) => (
              <View key={index} style={styles.outfitCard}>
                <Text style={styles.occasionLabel}>{outfit.occasionLabel}</Text>
                <Text style={styles.reasonText}>{outfit.reasonText}</Text>

                {/* Items images */}
                {outfit.items && outfit.items.length > 0 && (
                  <View style={styles.itemsContainer}>
                    {outfit.items.map((item, itemIndex) => (
                      <TouchableOpacity
                        key={itemIndex}
                        onPress={() => setSelectedImage(item.itemImage)}
                        activeOpacity={0.8}
                      >
                        <Image
                          source={{ uri: item.itemImage }}
                          style={styles.itemImage}
                          contentFit="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Chat input - Fixed at bottom only when there are results */}
      {(outfits.length > 0 || loading || error) && (
        <View
          style={[
            styles.inputContainerFixed,
            { bottom: keyboardHeight > 0 ? keyboardHeight + 10 : 20 },
          ]}
        >
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
      )}

      {/* Modal for enlarged image */}
      <Modal
        visible={selectedImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setSelectedImage(null)}
          />
          {selectedImage && (
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={styles.imageWrapper}
            >
              <Image
                source={{ uri: selectedImage }}
                style={styles.enlargedImage}
                contentFit="contain"
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedImage(null)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  scrollContentWithResults: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 100, // Space for input at bottom
  },
  headerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    minHeight: 600,
  },
  header: {
    fontFamily: "Manrope-bold",
    fontSize: 30,
    fontWeight: "700",
    color: "rgb(108, 99, 255)",
    textAlign: "center",
  },
  resultsContainer: {
    width: "100%",
  },
  outfitCard: {
    backgroundColor: "rgba(255,255,255,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    borderRadius: 32,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  occasionLabel: {
    fontFamily: "Manrope-bold",
    fontSize: 22,
    fontWeight: "700",
    color: "rgb(108, 99, 255)",
    marginBottom: 8,
  },
  reasonText: {
    fontFamily: "Manrope-Regular",
    fontSize: 16,
    color: "#1A1A1A",
    lineHeight: 22,
    marginBottom: 16,
  },
  itemsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  itemImage: {
    width: 110,
    height: 110,
    borderRadius: 12,
    backgroundColor: "#E5E5E5",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  imageWrapper: {
    width: "90%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  enlargedImage: {
    width: "100%",
    height: "100%",
    maxWidth: "100%",
    maxHeight: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  loadingText: {
    textAlign: "center",
    fontSize: 18,
    color: "#666",
    marginTop: 50,
  },
  errorText: {
    textAlign: "center",
    fontSize: 16,
    color: "#FF0000",
    marginTop: 50,
  },
  inputContainer: {
    flexDirection: "row",
    marginTop: 30,
    width: "100%",
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
  inputContainerFixed: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    marginHorizontal: 20,
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
