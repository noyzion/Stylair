import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image as ExpoImage } from "expo-image";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Link, useFocusEffect } from "expo-router";
import {
  getAllItemsFromCloset,
  deleteItemFromCloset,
} from "../../services/closet.service";
import { OutfitItem } from "../../types/closet";

export default function MyClosetScreen() {
  const [items, setItems] = useState<OutfitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<OutfitItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load items function
  const loadItems = useCallback(async () => {
    setLoading(true); // show "loading..."
    try {
      const allItems = await getAllItemsFromCloset();
      setItems(allItems); // set items to the state
    } catch (error) {
      console.error("Error loading items:", error);
    } finally {
      setLoading(false); // hide "loading..."
    }
  }, []);

  // Refresh items whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    // Confirm deletion
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
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
            await deleteItemFromCloset(selectedItem.itemImage);
            setModalVisible(false);
            // Reload items after deletion
            loadItems();
          } catch (error) {
            Alert.alert(
              "Error",
              error instanceof Error ? error.message : "Failed to delete item"
            );
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  // Group items by category
  const itemsByCategory = {
    top: items.filter((item) => item.itemCategory === "top"),
    bottom: items.filter((item) => item.itemCategory === "bottom"),
    shoes: items.filter((item) => item.itemCategory === "shoes"),
    accessories: items.filter((item) => item.itemCategory === "accessories"),
    dress: items.filter((item) => item.itemCategory === "dress"),
  };

  const CategorySection = ({
    title,
    categoryItems,
  }: {
    title: string;
    categoryItems: OutfitItem[];
  }) => {
    if (categoryItems.length === 0) return null;

    return (
      <View style={styles.categorySection}>
        <Text style={styles.categoryTitle}>{title}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {categoryItems.map((item) => (
            <TouchableOpacity
              key={item.itemId}
              onPress={() => {
                setSelectedItem(item);
                setModalVisible(true);
              }}
              style={styles.itemImageContainer}
            >
              <ExpoImage
                source={{ uri: item.itemImage }}
                style={styles.itemImage}
                contentFit="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
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
        ) : items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your closet is empty</Text>
            <Text style={styles.emptySubtext}>
              Add items to your closet to see them here
            </Text>
          </View>
        ) : (
          <>
            {itemsByCategory.top.length > 0 && (
              <>
                <CategorySection
                  title="Top"
                  categoryItems={itemsByCategory.top}
                />
                {(itemsByCategory.bottom.length > 0 ||
                  itemsByCategory.shoes.length > 0 ||
                  itemsByCategory.accessories.length > 0 ||
                  itemsByCategory.dress.length > 0) && (
                  <View style={styles.divider} />
                )}
              </>
            )}
            {itemsByCategory.bottom.length > 0 && (
              <>
                <CategorySection
                  title="Bottom"
                  categoryItems={itemsByCategory.bottom}
                />
                {(itemsByCategory.shoes.length > 0 ||
                  itemsByCategory.accessories.length > 0 ||
                  itemsByCategory.dress.length > 0) && (
                  <View style={styles.divider} />
                )}
              </>
            )}
            {itemsByCategory.shoes.length > 0 && (
              <>
                <CategorySection
                  title="Shoes"
                  categoryItems={itemsByCategory.shoes}
                />
                {(itemsByCategory.accessories.length > 0 ||
                  itemsByCategory.dress.length > 0) && (
                  <View style={styles.divider} />
                )}
              </>
            )}
            {itemsByCategory.accessories.length > 0 && (
              <>
                <CategorySection
                  title="Accessories"
                  categoryItems={itemsByCategory.accessories}
                />
                {itemsByCategory.dress.length > 0 && (
                  <View style={styles.divider} />
                )}
              </>
            )}
            {itemsByCategory.dress.length > 0 && (
              <CategorySection
                title="Dress"
                categoryItems={itemsByCategory.dress}
              />
            )}
          </>
        )}
      </ScrollView>

      {/* Modal for item details */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedItem && (
              <>
                <ExpoImage
                  source={{ uri: selectedItem.itemImage }}
                  style={styles.modalImage}
                  contentFit="contain"
                />
                <Text style={styles.modalTitle}>{selectedItem.itemName}</Text>
                <View style={styles.modalDetails}>
                  <Text style={styles.modalDetailLabel}>Category:</Text>
                  <Text style={styles.modalDetailText}>
                    {selectedItem.itemCategory}
                  </Text>
                </View>
                {selectedItem.colors.length > 0 && (
                  <View style={styles.modalDetails}>
                    <Text style={styles.modalDetailLabel}>Colors:</Text>
                    <Text style={styles.modalDetailText}>
                      {selectedItem.colors.join(", ")}
                    </Text>
                  </View>
                )}
                {selectedItem.style.length > 0 && (
                  <View style={styles.modalDetails}>
                    <Text style={styles.modalDetailLabel}>Style:</Text>
                    <Text style={styles.modalDetailText}>
                      {selectedItem.style.join(", ")}
                    </Text>
                  </View>
                )}
                {selectedItem.season.length > 0 && (
                  <View style={styles.modalDetails}>
                    <Text style={styles.modalDetailLabel}>Season:</Text>
                    <Text style={styles.modalDetailText}>
                      {selectedItem.season.join(", ")}
                    </Text>
                  </View>
                )}
                <View style={styles.modalButtonsRow}>
                  <TouchableOpacity
                    style={[
                      styles.deleteButton,
                      deleting && styles.deleteButtonDisabled,
                    ]}
                    onPress={handleDeleteItem}
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
  divider: {
    height: 1,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    marginVertical: 20,
    marginHorizontal: 20,
  },
  categorySection: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  horizontalScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  horizontalScrollContent: {
    gap: 12,
  },
  itemImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 12,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  itemImage: {
    width: "100%",
    height: "100%",
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
    alignItems: "center",
  },
  modalImage: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
    textAlign: "center",
  },
  modalDetails: {
    flexDirection: "row",
    marginBottom: 12,
    width: "100%",
  },
  modalDetailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginRight: 8,
    minWidth: 80,
  },
  modalDetailText: {
    fontSize: 14,
    color: "#1A1A1A",
    flex: 1,
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
});
