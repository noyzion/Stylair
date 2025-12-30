import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image as ExpoImage } from "expo-image";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Ionicons } from "@expo/vector-icons";
import { Link, useFocusEffect } from "expo-router";
import {
  getAllSavedOutfits,
  deleteOutfitFromArchive,
} from "../../services/closet.service";
import { SavedOutfit, OutfitItem } from "../../types/closet";

export default function ArchiveScreen() {
  const [outfits, setOutfits] = useState<SavedOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOutfit, setSelectedOutfit] = useState<SavedOutfit | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load outfits function
  const loadOutfits = useCallback(async () => {
    setLoading(true);
    try {
      const allOutfits = await getAllSavedOutfits();
      setOutfits(allOutfits);
    } catch (error) {
      console.error("Error loading saved outfits:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh outfits whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadOutfits();
    }, [loadOutfits])
  );

  const handleDeleteOutfit = async (outfitId: string) => {
    if (!outfitId || outfitId.trim() === "") {
      Alert.alert("Error", "Outfit ID is missing or invalid");
      return;
    }

    // Confirm deletion
    Alert.alert(
      "Delete Outfit",
      "Are you sure you want to delete this outfit?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteOutfitFromArchive(outfitId);
              // Reload outfits after deletion
              loadOutfits();
            } catch (error) {
              console.error("Error deleting outfit:", error);
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Failed to delete outfit"
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteOutfitFromModal = async () => {
    if (!selectedOutfit) return;
    await handleDeleteOutfit(selectedOutfit.outfitId);
    setModalVisible(false);
  };

  return (
    <LinearGradient
      colors={["#E6F0FF", "#F0E6FF", "#FFE3F1"]}
      start={{ x: 0, y: 0.35 }}
      end={{ x: 1, y: 0.65 }}
      style={styles.gradientContainer}
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
        <ExpoImage
          source={require("@/assets/images/logoName.png")}
          style={styles.logo}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : outfits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No saved outfits yet</Text>
            <Text style={styles.emptySubtext}>
              Save outfits from recommendations to see them here
            </Text>
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            {outfits.map((outfit, index) => (
              <View key={outfit.outfitId || index} style={styles.outfitCard}>
                {/* Delete button - top right */}
                <TouchableOpacity
                  style={styles.deleteIconButton}
                  onPress={() => handleDeleteOutfit(outfit.outfitId)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>

                <Text style={styles.occasionLabel}>{outfit.occasionLabel}</Text>
                <Text style={styles.reasonText}>{outfit.reasonText}</Text>

                {/* Items images */}
                {outfit.items && outfit.items.length > 0 && (
                  <View style={styles.itemsContainer}>
                    {outfit.items.map((item: OutfitItem, itemIndex: number) => (
                      <TouchableOpacity
                        key={itemIndex}
                        onPress={() => setSelectedImage(item.itemImage)}
                        activeOpacity={0.8}
                      >
                        <ExpoImage
                          source={{ uri: item.itemImage }}
                          style={styles.itemImage}
                          contentFit="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* View details button */}
                <Pressable
                  onPress={() => {
                    setSelectedOutfit(outfit);
                    setModalVisible(true);
                  }}
                  style={styles.viewDetailsButton}
                >
                  <Text style={styles.viewDetailsButtonText}>View Details</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal for outfit details */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedOutfit && (
              <>
                <Text style={styles.modalTitle}>
                  {selectedOutfit.occasionLabel}
                </Text>
                <Text style={styles.modalReasonText}>
                  {selectedOutfit.reasonText}
                </Text>

                {/* Items in modal */}
                {selectedOutfit.items && selectedOutfit.items.length > 0 && (
                  <ScrollView style={styles.modalItemsContainer}>
                    {selectedOutfit.items.map(
                      (item: OutfitItem, index: number) => (
                        <View key={index} style={styles.modalItemCard}>
                          <ExpoImage
                            source={{ uri: item.itemImage }}
                            style={styles.modalItemImage}
                            contentFit="cover"
                          />
                          <View style={styles.modalItemDetails}>
                            <Text style={styles.modalItemName}>
                              {item.itemName}
                            </Text>
                            <Text style={styles.modalItemCategory}>
                              {item.itemCategory}
                            </Text>
                            {item.colors.length > 0 && (
                              <Text style={styles.modalItemText}>
                                Colors: {item.colors.join(", ")}
                              </Text>
                            )}
                            {item.style.length > 0 && (
                              <Text style={styles.modalItemText}>
                                Style: {item.style.join(", ")}
                              </Text>
                            )}
                          </View>
                        </View>
                      )
                    )}
                  </ScrollView>
                )}

                <View style={styles.modalButtonsRow}>
                  <TouchableOpacity
                    style={[
                      styles.deleteButton,
                      deleting && styles.deleteButtonDisabled,
                    ]}
                    onPress={handleDeleteOutfitFromModal}
                    disabled={deleting}
                  >
                    <Text style={styles.deleteButtonText}>
                      {deleting ? "Deleting..." : "Delete"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal for enlarged image */}
      <Modal
        visible={selectedImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.imageModalContainer}>
          <TouchableOpacity
            style={styles.imageModalBackdrop}
            activeOpacity={1}
            onPress={() => setSelectedImage(null)}
          />
          {selectedImage && (
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={styles.imageWrapper}
            >
              <ExpoImage
                source={{ uri: selectedImage }}
                style={styles.enlargedImage}
                contentFit="contain"
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.imageCloseButton}
            onPress={() => setSelectedImage(null)}
          >
            <Text style={styles.imageCloseButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 150,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  outfitCard: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    position: "relative",
  },
  deleteIconButton: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
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
    marginBottom: 16,
  },
  itemImage: {
    width: 110,
    height: 110,
    borderRadius: 12,
    backgroundColor: "#E5E5E5",
  },
  viewDetailsButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "rgb(108, 99, 255)",
    alignItems: "center",
    justifyContent: "center",
  },
  viewDetailsButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "rgb(108, 99, 255)",
    marginBottom: 8,
    textAlign: "center",
  },
  modalReasonText: {
    fontSize: 16,
    color: "#1A1A1A",
    marginBottom: 20,
    textAlign: "center",
  },
  modalItemsContainer: {
    maxHeight: 400,
  },
  modalItemCard: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  modalItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  modalItemDetails: {
    flex: 1,
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  modalItemCategory: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  modalItemText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 20,
    width: "100%",
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: "#EF4444",
    alignItems: "center",
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: "rgb(108, 99, 255)",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  imageModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalBackdrop: {
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
  },
  imageCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  imageCloseButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
});
