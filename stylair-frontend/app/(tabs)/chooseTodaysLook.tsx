import { useState, useEffect, useCallback, useRef } from "react";
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
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Location from "expo-location";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Link, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { 
  saveOutfit, 
  suggestOutfitWithAI, 
  OutfitSuggestion,
  getAllItemsFromCloset 
} from "../../services/closet.service";
import { OutfitItem } from "../../types/closet";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  text: string;
  outfits?: OutfitSuggestion[];
  timestamp: Date;
}

export default function TodayLookScreen() {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingOutfitIndex, setSavingOutfitIndex] = useState<number | null>(null);
  const [savedOutfitIndices, setSavedOutfitIndices] = useState<Set<string>>(new Set());
  const [currentTopic, setCurrentTopic] = useState<string | null>(null); // Track current conversation topic
  
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
      setChatMessages([]);
      setMessage("");
      setError(null);
      setSelectedImage(null);
      setSavedOutfitIndices(new Set());
      setSavingOutfitIndex(null);
      setCurrentTopic(null);
    }, [])
  );

  // Helper function to detect if message is a greeting or off-topic
  const isOffTopicOrGreeting = (message: string): boolean => {
    const lowerMessage = message.toLowerCase().trim();
    const greetings = ['hi', 'hello', 'hey', 'מה נשמע', 'שלום', 'היי', 'מה קורה', 'מה המצב'];
    const offTopicKeywords = ['מה השעה', 'מה התאריך', 'תספר לי על', 'מה אתה', 'מי אתה'];
    
    // Check if it's a simple greeting
    if (greetings.some(g => lowerMessage === g || lowerMessage.startsWith(g + ' '))) {
      return true;
    }
    
    // Check if it contains off-topic keywords
    if (offTopicKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return true;
    }
    
    // If message is very short and doesn't mention any event/clothing related words
    if (message.length < 10) {
      const clothingKeywords = ['פגישה', 'אימון', 'יציאה', 'מסיבה', 'עבודה', 'אאוטפיט', 'לוק', 'בגד', 'outfit', 'meeting', 'party', 'workout', 'gym', 'event'];
      if (!clothingKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return true;
      }
    }
    
    return false;
  };

  // Helper function to detect if message is about a new topic/event
  const isNewTopic = (message: string): boolean => {
    const lowerMessage = message.toLowerCase().trim();
    
    // Keywords that indicate a new event/request
    const newEventKeywords = ['יש לי', 'אני צריך', 'אני רוצה', 'תביא לי', 'תציע לי', 'יש', 'need', 'want', 'have', 'i have', 'i need', 'i want'];
    
    // If current topic is null, this is definitely a new topic
    if (!currentTopic) {
      return newEventKeywords.some(keyword => lowerMessage.includes(keyword));
    }
    
    // If message mentions a new event type, it's a new topic
    const eventTypes = ['פגישה', 'אימון', 'יציאה', 'מסיבה', 'עבודה', 'דייט', 'meeting', 'workout', 'gym', 'party', 'date', 'work'];
    const mentionedEvents = eventTypes.filter(event => lowerMessage.includes(event));
    
    // If mentions a different event than current topic, it's a new topic
    if (mentionedEvents.length > 0 && currentTopic) {
      return !mentionedEvents.some(event => currentTopic.includes(event));
    }
    
    // If starts with new event keywords, it's likely a new topic
    return newEventKeywords.some(keyword => lowerMessage.startsWith(keyword) || lowerMessage.includes(keyword + ' '));
  };

  // Helper function to extract topic from message
  const extractTopic = (message: string): string | null => {
    const lowerMessage = message.toLowerCase().trim();
    const eventTypes = ['פגישה', 'אימון', 'יציאה', 'מסיבה', 'עבודה', 'דייט', 'meeting', 'workout', 'gym', 'party', 'date', 'work'];
    
    for (const event of eventTypes) {
      if (lowerMessage.includes(event)) {
        return event;
      }
    }
    
    return null;
  };

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (chatMessages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages]);

  // Handle keyboard show/hide to scroll chat up
  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        // Scroll to bottom when keyboard opens
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        // Optional: scroll adjustment when keyboard closes
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

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

  // Send message to API
  const handleSend = async () => {
    if (message.trim() === "") return;
    
    // Store message before clearing
    const messageToSend = message.trim();
    
    // Check if this is a new topic
    const isNewTopicMessage = isNewTopic(messageToSend);
    
    // Reset topic tracking for new topics
    if (isNewTopicMessage) {
      setCurrentTopic(null);
    } else {
      // Extract and update current topic
      const extractedTopic = extractTopic(messageToSend);
      if (extractedTopic) {
        setCurrentTopic(extractedTopic);
      }
    }
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: messageToSend,
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, userMessage]);
    
    // Clear the message immediately after sending
    setMessage("");
    setLoading(true);
    setError(null);
    
    // Add loading message
    const loadingMessageId = (Date.now() + 1).toString();
    setChatMessages(prev => [...prev, {
      id: loadingMessageId,
      type: 'ai',
      text: '',
      timestamp: new Date(),
    }]);
    
    try {
      // Build chat history from previous messages
      const shouldIncludeHistory = !isNewTopicMessage;
      const chatHistory = shouldIncludeHistory 
        ? chatMessages
            .filter(msg => msg.text || msg.outfits) // Only include messages with content
            .map(msg => {
              if (msg.type === 'user') {
                return {
                  role: 'user' as const,
                  content: msg.text
                };
              } else {
                // Include outfit information for AI messages
                if (msg.outfits && msg.outfits.length > 0) {
                  // Build a description of the outfits for context
                  const outfitDescriptions = msg.outfits.map(outfit => {
                    const itemsList = outfit.items.map(item => `${item.category}: ${item.id}`).join(', ');
                    return `Outfit for "${outfit.event}": ${itemsList}. Notes: ${outfit.notes}`;
                  }).join(' | ');
                  return {
                    role: 'assistant' as const,
                    content: `I suggested ${msg.outfits.length} outfit${msg.outfits.length > 1 ? 's' : ''}: ${outfitDescriptions}`
                  };
                } else {
                  return {
                    role: 'assistant' as const,
                    content: msg.text || ''
                  };
                }
              }
            })
            .slice(-10) // Keep last 10 messages for context
        : []; // Reset history for new topics (but messages stay visible on screen)

      const response = await suggestOutfitWithAI({
        userMessage: messageToSend,
        weather: {
          temperature: tempC ?? undefined,
          condition: condition,
          isNight: isNight,
        },
        chatHistory: chatHistory.length > 0 ? chatHistory : undefined,
      });

      // Remove loading message
      setChatMessages(prev => prev.filter(msg => msg.id !== loadingMessageId));

      if (!response.success) {
        const errorText = response.errorMessage || "Failed to generate outfit suggestions";
        
        // Show off-topic message as AI message
        if (errorText.toLowerCase().includes("i'm a fashion") ||
            errorText.toLowerCase().includes("i can only help") ||
            errorText.toLowerCase().includes("fashion stylist"))
        {
          setChatMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'ai',
            text: errorText,
            timestamp: new Date(),
          }]);
        } else {
          // Regular error
          setChatMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'ai',
            text: errorText,
            timestamp: new Date(),
          }]);
        }
        setError(errorText);
        setLoading(false);
        return;
      }

      // Add AI response with outfits
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'ai',
        text: response.outfits.length > 0 
          ? `I found ${response.outfits.length} outfit${response.outfits.length > 1 ? 's' : ''} for you!`
          : 'I couldn\'t find any outfits matching your request.',
        outfits: response.outfits,
        timestamp: new Date(),
      }]);
      
      // Update current topic if needed
      if (response.outfits.length > 0 && !currentTopic) {
        const extractedTopic = extractTopic(messageToSend);
        if (extractedTopic) {
          setCurrentTopic(extractedTopic);
        }
      }
      
      setLoading(false);
    } catch (error) {
      // Remove loading message and add error message
      setChatMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== loadingMessageId);
        return [...filtered, {
          id: Date.now().toString(),
          type: 'ai',
          text: error instanceof Error ? error.message : "An error occurred",
          timestamp: new Date(),
        }];
      });
      setError(error instanceof Error ? error.message : "An error occurred");
      setLoading(false);
    }
  };

  const handleSaveOutfit = async (
    outfit: OutfitSuggestion,
    messageId: string,
    outfitIndex: number
  ) => {
    const saveKey = `${messageId}-${outfitIndex}`;
    // Don't save if already saved
    if (savedOutfitIndices.has(saveKey)) {
      return;
    }

    setSavingOutfitIndex(outfitIndex);
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
      // Add to saved set
      setSavedOutfitIndices((prev) => new Set(prev).add(saveKey));
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
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        enabled={chatMessages.length > 0}
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

        {/* Initial Welcome Screen - Show when no messages */}
        {chatMessages.length === 0 && (
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

        {/* Chat Messages - Show when conversation starts */}
        {chatMessages.length > 0 && (
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatScrollView}
            contentContainerStyle={styles.chatContent}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }}
            showsVerticalScrollIndicator={false}
          >
            {chatMessages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageContainer,
                msg.type === 'user' ? styles.userMessageContainer : styles.aiMessageContainer,
              ]}
            >
              {msg.type === 'user' ? (
                <View style={styles.userMessage}>
                  <Text style={styles.userMessageText}>{msg.text}</Text>
                </View>
              ) : (
                <View style={styles.aiMessage}>
                  {msg.text && (
                    <Text style={styles.aiMessageText}>{msg.text}</Text>
                  )}
                  {!msg.text && loading && (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="rgb(108, 99, 255)" />
                      <Text style={styles.loadingText}>Thinking...</Text>
                    </View>
                  )}
                  {msg.outfits && msg.outfits.length > 0 && (
                    <View style={styles.outfitsContainer}>
                      {msg.outfits.map((outfit, outfitIndex) => {
                        const fullItems = outfit.items
                          .map(itemSuggestion => {
                            const fullItem = allItems.find(item => item.itemId === itemSuggestion.id);
                            return fullItem;
                          })
                          .filter((item): item is OutfitItem => item !== undefined);

                        const saveKey = `${msg.id}-${outfitIndex}`;
                        const isSaving = savingOutfitIndex === outfitIndex;
                        const isSaved = savedOutfitIndices.has(saveKey);

                        return (
                          <View key={outfitIndex} style={styles.outfitCard}>
                            <Text style={styles.occasionLabel}>{outfit.event}</Text>
                            <Text style={styles.reasonText}>{outfit.notes}</Text>

                            {outfit.missingItems && outfit.missingItems.length > 0 && (
                              <View style={styles.missingItemsContainer}>
                                <Text style={styles.missingItemsLabel}>Missing items:</Text>
                                <Text style={styles.missingItemsText}>
                                  {outfit.missingItems.join(", ")}
                  </Text>
                              </View>
                            )}

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

                            {fullItems.length > 0 && (
                    <Pressable
                                onPress={() => handleSaveOutfit(outfit, msg.id, outfitIndex)}
                                disabled={isSaving || isSaved}
                      style={[
                        styles.saveOutfitButton,
                                  (isSaving || isSaved) && styles.saveOutfitButtonDisabled,
                                  isSaved && styles.saveOutfitButtonSaved,
                      ]}
                    >
                      <Text style={styles.saveOutfitButtonText}>
                                  {isSaving
                          ? "Saving..."
                                    : isSaved
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
                </View>
              )}
            </View>
          ))}
          </ScrollView>
        )}

        {/* Chat input - Fixed at bottom - Only show when conversation started */}
        {chatMessages.length > 0 && (
          <View style={[styles.chatInputContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type your message..."
              placeholderTextColor="#999"
              style={styles.chatInput}
              multiline
              maxLength={500}
            />
            <Pressable 
              onPress={handleSend} 
              style={[styles.chatSendButton, !message.trim() && styles.chatSendButtonDisabled]}
              disabled={!message.trim() || loading}
            >
              <Text style={styles.chatSendButtonText}>Send</Text>
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
  chatScrollView: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: "85%",
  },
  userMessageContainer: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  aiMessageContainer: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  userMessage: {
    backgroundColor: "rgb(108, 99, 255)",
    borderRadius: 20,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  userMessageText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Manrope-Regular",
  },
  aiMessage: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  aiMessageText: {
    color: "#1A1A1A",
    fontSize: 16,
    fontFamily: "Manrope-Regular",
    marginBottom: 12,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    color: "#666",
    fontSize: 14,
    fontFamily: "Manrope-Regular",
  },
  outfitsContainer: {
    marginTop: 8,
    gap: 12,
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
  chatInputContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
    alignItems: "flex-end",
    gap: 8,
    ...Platform.select({
      ios: {
    shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: -4 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
  chatInput: {
    flex: 1,
    backgroundColor: "rgba(240, 240, 240, 0.8)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: "Manrope-Regular",
    color: "#1A1A1A",
    maxHeight: 100,
    minHeight: 44,
  },
  chatSendButton: {
    backgroundColor: "rgb(108, 99, 255)",
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 70,
  },
  chatSendButtonDisabled: {
    opacity: 0.5,
  },
  chatSendButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Manrope-SemiBold",
  },
});
