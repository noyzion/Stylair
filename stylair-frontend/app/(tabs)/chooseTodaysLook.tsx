import { useState, useEffect, useCallback } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Location from "expo-location";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Link, useFocusEffect } from "expo-router";
import { 
  saveOutfit, 
  suggestOutfitWithAI, 
  OutfitSuggestion,
  getAllItemsFromCloset 
} from "../../services/closet.service";
import { OutfitItem } from "../../types/closet";

export default function TodayLookScreen() {
  const [message, setMessage] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [outfits, setOutfits] = useState<OutfitSuggestion[]>([]); //list of outfits and function to set it (inital empty list)
  const [loading, setLoading] = useState(false); //loading state and function to set it (inital false)
  const [error, setError] = useState<string | null>(null); //error state and function to set it (inital null)
  const [savingOutfitIndex, setSavingOutfitIndex] = useState<number | null>(
    null
  ); //track which outfit is being saved
  const [savedOutfitIndices, setSavedOutfitIndices] = useState<Set<number>>(
    new Set()
  ); //track which outfits have already been saved
  
  // Weather data
  const [tempC, setTempC] = useState<number | null>(null);
  const [condition, setCondition] = useState<
    "sun" | "cloud" | "rain" | "storm" | "snow" | "wind" | "hot"
  >("sun");
  const [isNight, setIsNight] = useState(false);
  
  // Store all items to map IDs to full items
  const [allItems, setAllItems] = useState<OutfitItem[]>([]);

  // Clean screen when focus is gained (when user returns to this screen)
  useFocusEffect(
    useCallback(() => {
      // Reset state when screen is focused
      setOutfits([]);
      setMessage("");
      setError(null);
      setSelectedImage(null);
      setSavedOutfitIndices(new Set());
      setSavingOutfitIndex(null);
    }, [])
  );

  // Load weather data and closet items on mount
  useEffect(() => {
    // Load closet items
    getAllItemsFromCloset()
      .then(setAllItems)
      .catch(console.error);

    // Load weather data
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = loc.coords;

        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
          `&current=temperature_2m,weather_code,wind_speed_10m,is_day&timezone=auto`;

        const res = await fetch(url);
        const data = await res.json();

        const isDay = data?.current?.is_day;
        setIsNight(isDay === 0);

        const t = data?.current?.temperature_2m;
        const code = data?.current?.weather_code;

        if (typeof t === "number") {
          const rounded = Math.round(t);
          setTempC(rounded);

          if (rounded >= 30) {
            setCondition("hot");
            return;
          }
        }

        if (typeof code === "number") {
          setCondition(mapWeatherCodeToCondition(code));
        }
      } catch (error) {
        console.error("Error loading weather:", error);
      }
    })();
  }, []);

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

  function mapWeatherCodeToCondition(code: number) {
    if (code === 0) return "sun";
    if ([1, 2, 3].includes(code)) return "cloud";
    if ([45, 48].includes(code)) return "cloud";
    if ([51, 53, 55, 56, 57].includes(code)) return "rain";
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
    if ([95, 96, 99].includes(code)) return "storm";
    return "cloud";
  }

  //function to send the message to the API, async because we are using await to wait for the response
  const handleSend = async () => {
    if (message === "") return;
    setLoading(true);
    setError(null);
    try {
      const response = await suggestOutfitWithAI({
        userMessage: message,
        weather: {
          temperature: tempC ?? undefined,
          condition: condition,
          isNight: isNight,
        },
      });

      if (!response.success) {
        throw new Error(response.errorMessage || "Failed to generate outfit suggestions");
      }

      setOutfits(response.outfits);
      setMessage(""); //clear the message
      setLoading(false);
      // Clear saved indices when new outfits are loaded
      setSavedOutfitIndices(new Set());
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setLoading(false);
    }
  };

  const handleSaveOutfit = async (
    outfit: OutfitSuggestion,
    index: number
  ) => {
    // Don't save if already saved
    if (savedOutfitIndices.has(index)) {
      return;
    }

    setSavingOutfitIndex(index); // set the index of the outfit being saved
    try {
      // Map outfit suggestion to full items
      const fullItems: OutfitItem[] = outfit.items
        .map(itemSuggestion => {
          const fullItem = allItems.find(item => item.itemId === itemSuggestion.id);
          return fullItem;
        })
        .filter((item): item is OutfitItem => item !== undefined);

      if (fullItems.length === 0) {
        throw new Error("Could not find items in closet");
      }

      await saveOutfit({
        occasionLabel: outfit.event,
        items: fullItems,
        reasonText: outfit.notes,
      });
      // Add index to saved set
      setSavedOutfitIndices((prev) => new Set(prev).add(index));
      // Show success message (you can use alert or a toast notification)
      alert("Outfit saved successfully!");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save outfit");
    } finally {
      setSavingOutfitIndex(null);
    }
  };

  return (
    <LinearGradient
      colors={["#E6F0FF", "#F0E6FF", "#FFE3F1"]}
      start={{ x: 0, y: 0.35 }}
      end={{ x: 1, y: 0.65 }}
      style={styles.gradientContainer}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Home icon button */}
        <Link href="/(tabs)" asChild>
          <Pressable
            style={styles.homeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconSymbol name="house.fill" size={24} color="rgb(108, 99, 255)" />
          </Pressable>
        </Link>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/logoName.png")}
            style={styles.logo}
          />
        </View>

        <ScrollView
          style={styles.scrollView}
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
              {outfits.map((outfit, index) => {
                // Map item IDs to full items
                const fullItems = outfit.items
                  .map(itemSuggestion => {
                    const fullItem = allItems.find(item => item.itemId === itemSuggestion.id);
                    return fullItem;
                  })
                  .filter((item): item is OutfitItem => item !== undefined);

                return (
                  <View key={index} style={styles.outfitCard}>
                    <Text style={styles.occasionLabel}>
                      {outfit.event}
                    </Text>
                    <Text style={styles.reasonText}>{outfit.notes}</Text>

                    {/* Missing items warning */}
                    {outfit.missingItems && outfit.missingItems.length > 0 && (
                      <View style={styles.missingItemsContainer}>
                        <Text style={styles.missingItemsLabel}>Missing items:</Text>
                        <Text style={styles.missingItemsText}>
                          {outfit.missingItems.join(", ")}
                        </Text>
                      </View>
                    )}

                    {/* Items images */}
                    {fullItems.length > 0 && (
                      <View style={styles.itemsContainer}>
                        {fullItems.map((item, itemIndex) => (
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

                    {/* Save button - only show if outfit has items */}
                    {fullItems.length > 0 && (
                      <Pressable
                        onPress={() => handleSaveOutfit(outfit, index)}
                        disabled={
                          savingOutfitIndex === index ||
                          savedOutfitIndices.has(index)
                        }
                        style={[
                          styles.saveOutfitButton,
                          (savingOutfitIndex === index ||
                            savedOutfitIndices.has(index)) &&
                            styles.saveOutfitButtonDisabled,
                          savedOutfitIndices.has(index) &&
                            styles.saveOutfitButtonSaved,
                        ]}
                      >
                        <Text style={styles.saveOutfitButtonText}>
                          {savingOutfitIndex === index
                            ? "Saving..."
                            : savedOutfitIndices.has(index)
                            ? "Saved ✓"
                            : "Save to Archive"}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                );
              })}
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 75,
    resizeMode: "contain",
  },
  homeButton: {
    position: "absolute",
    top: 76,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollContentWithResults: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100, // Space for input at bottom
  },
  headerContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 200,
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
    backgroundColor: "rgba(240, 230, 255, 0.40)",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.25)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#8B5CF6",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 4,
      },
    }),
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
  saveOutfitButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "rgb(108, 99, 255)",
    alignItems: "center",
    justifyContent: "center",
  },
  saveOutfitButtonDisabled: {
    opacity: 0.6,
  },
  saveOutfitButtonSaved: {
    backgroundColor: "#10B981",
  },
  saveOutfitButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
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
  missingItemsContainer: {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    borderLeftWidth: 3,
    borderLeftColor: "#FFC107",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  missingItemsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF9800",
    marginBottom: 4,
  },
  missingItemsText: {
    fontSize: 14,
    color: "#666",
  },
  inputContainer: {
    flexDirection: "row",
    marginTop: 25,
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
