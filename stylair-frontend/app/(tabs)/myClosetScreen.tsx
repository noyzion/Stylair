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
import { Link, useFocusEffect, useRouter } from "expo-router";
import {
  getAllItemsFromCloset,
  deleteItemFromCloset,
} from "../../services/closet.service";
import { OutfitItem } from "../../types/closet";

type CategoryFilter = "all" | "top" | "bottom" | "shoes" | "accessories" | "dress";

export default function MyClosetScreen() {
  const router = useRouter();
  const [items, setItems] = useState<OutfitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<OutfitItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState<{
    style: boolean;
    color: boolean;
    season: boolean;
  }>({
    style: true,
    color: true,
    season: true,
  });

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

  // Get filtered items based on selected category and filters
  const getFilteredItems = (): OutfitItem[] => {
    let filtered = selectedCategory === "all" 
      ? items 
      : itemsByCategory[selectedCategory] || [];

    // Apply style filter (multi-select)
    if (selectedStyles.length > 0) {
      const styleSet = new Set(selectedStyles.map((s) => s.toLowerCase()));
      filtered = filtered.filter((item) =>
        item.style.some((s) => styleSet.has(s.toLowerCase()))
      );
    }

    // Apply color filter (multi-select)
    if (selectedColors.length > 0) {
      const colorSet = new Set(selectedColors.map((c) => c.toLowerCase()));
      filtered = filtered.filter((item) =>
        item.colors.some((c) => colorSet.has(c.toLowerCase()))
      );
    }

    // Apply season filter (multi-select)
    if (selectedSeasons.length > 0) {
      const normalizedSelectedSeasons = selectedSeasons.map((s) =>
        s.toLowerCase().trim()
      );
      const hasAllSeasonSelected = normalizedSelectedSeasons.includes("all season");

      filtered = filtered.filter((item) =>
        item.season.some((s) => {
          const normalized = s.toLowerCase().trim();
          if (hasAllSeasonSelected && (normalized === "all" || normalized === "all season")) {
            return true;
          }
          return normalizedSelectedSeasons.includes(normalized);
        })
      );
    }

    return filtered;
  };

  const filteredItems = getFilteredItems();

  // Get unique values for filters from filtered category items
  const getAvailableFilters = () => {
    const categoryItems = selectedCategory === "all" 
      ? items 
      : itemsByCategory[selectedCategory] || [];

    const styles = new Set<string>();
    const colors = new Set<string>();
    const seasons = new Set<string>();

    categoryItems.forEach((item) => {
      item.style.forEach((s) => styles.add(s));
      item.colors.forEach((c) => colors.add(c));
      item.season.forEach((s) => {
        // Normalize season values to avoid duplicates
        const normalizedSeason = s.toLowerCase().trim();
        if (normalizedSeason === "all" || normalizedSeason === "all season") {
          seasons.add("All Season");
        } else {
          // Capitalize first letter
          const capitalized = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
          seasons.add(capitalized);
        }
      });
    });

    // Sort seasons with "All Season" first if it exists
    const seasonsArray = Array.from(seasons);
    const allSeasonIndex = seasonsArray.findIndex(s => 
      s.toLowerCase() === "all season" || s.toLowerCase() === "all"
    );
    if (allSeasonIndex > -1) {
      seasonsArray.splice(allSeasonIndex, 1);
      seasonsArray.unshift("All Season");
    }

    return {
      styles: Array.from(styles).sort(),
      colors: Array.from(colors).sort(),
      seasons: seasonsArray,
    };
  };

  const availableFilters = getAvailableFilters();

  // Reset secondary filters when category changes
  const handleCategoryChange = (category: CategoryFilter) => {
    setSelectedCategory(category);
    setSelectedStyles([]);
    setSelectedColors([]);
    setSelectedSeasons([]);
  };

  // Toggle filter section
  const toggleFilter = (filterType: "style" | "color" | "season") => {
    setExpandedFilters((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }));
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedStyles.length > 0) count++;
    if (selectedColors.length > 0) count++;
    if (selectedSeasons.length > 0) count++;
    return count;
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedStyles([]);
    setSelectedColors([]);
    setSelectedSeasons([]);
  };

  // Category tabs configuration
  const categories = [
    { key: "all" as CategoryFilter, label: "All", count: items.length },
    { key: "top" as CategoryFilter, label: "Top", count: itemsByCategory.top.length },
    { key: "bottom" as CategoryFilter, label: "Bottom", count: itemsByCategory.bottom.length },
    { key: "shoes" as CategoryFilter, label: "Shoes", count: itemsByCategory.shoes.length },
    { key: "accessories" as CategoryFilter, label: "Accessories", count: itemsByCategory.accessories.length },
    { key: "dress" as CategoryFilter, label: "Dress", count: itemsByCategory.dress.length },
  ];


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

      {/* Category Tabs */}
      {!loading && items.length > 0 && (
        <View style={styles.tabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsContainer}
            contentContainerStyle={styles.tabsContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.key}
                onPress={() => handleCategoryChange(category.key)}
                style={[
                  styles.tab,
                  selectedCategory === category.key && styles.tabActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedCategory === category.key && styles.tabTextActive,
                  ]}
                >
                  {category.label}
                </Text>
                {category.count > 0 && (
                  <Text
                    style={[
                      styles.tabCount,
                      selectedCategory === category.key && styles.tabCountActive,
                    ]}
                  >
                    {category.count}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Filter Button */}
          <TouchableOpacity
            onPress={() => {
              setFilterModalVisible(true);
              // Ensure filters are expanded when modal opens
              setExpandedFilters({ style: true, color: true, season: true });
            }}
            style={[
              styles.filterButton,
              getActiveFiltersCount() > 0 && styles.filterButtonActive,
            ]}
          >
            <IconSymbol
              name="slider.horizontal.3"
              size={18}
              color={getActiveFiltersCount() > 0 ? "#FFFFFF" : "#1A1A1A"}
            />
            {getActiveFiltersCount() > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

          {/* Active Filters Summary */}
          {getActiveFiltersCount() > 0 && (
            <View style={styles.activeFiltersContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.activeFiltersChips}
              >
                {selectedStyles.length > 0 && (
                  <View style={styles.activeFilterChip}>
                    <Text style={styles.activeFilterChipText}>
                      Style: {selectedStyles.join(", ")}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setSelectedStyles([])}
                      style={styles.activeFilterChipClose}
                    >
                      <Text style={styles.activeFilterChipCloseText}>×</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {selectedColors.length > 0 && (
                  <View style={styles.activeFilterChip}>
                    <Text style={styles.activeFilterChipText}>
                      Color: {selectedColors.join(", ")}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setSelectedColors([])}
                      style={styles.activeFilterChipClose}
                    >
                      <Text style={styles.activeFilterChipCloseText}>×</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {selectedSeasons.length > 0 && (
                  <View style={styles.activeFilterChip}>
                    <Text style={styles.activeFilterChipText}>
                      Season: {selectedSeasons.join(", ")}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setSelectedSeasons([])}
                      style={styles.activeFilterChipClose}
                    >
                      <Text style={styles.activeFilterChipCloseText}>×</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </View>
          )}

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
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No items in this category
            </Text>
            <Text style={styles.emptySubtext}>
              Try selecting a different category
            </Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {filteredItems.map((item) => (
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
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <Pressable
          style={styles.filterModalOverlay}
          onPress={() => setFilterModalVisible(false)}
        >
          <View
            style={styles.filterModalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Filters</Text>
              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                style={styles.filterModalClose}
              >
                <IconSymbol name="xmark" size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.filterModalScroll}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.filterModalScrollContent}
              nestedScrollEnabled={true}
            >
              {/* Style Filter */}
              <View style={styles.filterModalSection}>
                <TouchableOpacity
                  onPress={() => toggleFilter("style")}
                  style={styles.filterModalSectionHeader}
                >
                  <Text style={styles.filterModalSectionTitle}>Style</Text>
                  <IconSymbol
                    name={expandedFilters.style ? "chevron.up" : "chevron.down"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
                {expandedFilters.style && (
                  <View style={styles.filterModalChips}>
                    {availableFilters.styles.length > 0 ? (
                      <>
                        <TouchableOpacity
                          onPress={() => setSelectedStyles([])}
                          style={[
                            styles.filterModalChip,
                            selectedStyles.length === 0 && styles.filterModalChipActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.filterModalChipText,
                              selectedStyles.length === 0 &&
                                styles.filterModalChipTextActive,
                            ]}
                          >
                            All
                          </Text>
                        </TouchableOpacity>
                        {availableFilters.styles.map((style) => {
                          const isSelected = selectedStyles.includes(style);
                          return (
                            <TouchableOpacity
                              key={style}
                              onPress={() => {
                                setSelectedStyles((prev) =>
                                  isSelected
                                    ? prev.filter((s) => s !== style)
                                    : [...prev, style]
                                );
                              }}
                              style={[
                                styles.filterModalChip,
                                isSelected && styles.filterModalChipActive,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.filterModalChipText,
                                  isSelected && styles.filterModalChipTextActive,
                                ]}
                              >
                                {style}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </>
                    ) : (
                      <Text style={styles.filterModalEmptyText}>
                        No styles available in this category
                      </Text>
                    )}
                  </View>
                )}
                {!expandedFilters.style && (
                  <Text style={styles.filterModalCollapsedText}>
                    Tap to expand
                  </Text>
                )}
              </View>

              {/* Color Filter */}
              <View style={styles.filterModalSection}>
                <TouchableOpacity
                  onPress={() => toggleFilter("color")}
                  style={styles.filterModalSectionHeader}
                >
                  <Text style={styles.filterModalSectionTitle}>Color</Text>
                  <IconSymbol
                    name={expandedFilters.color ? "chevron.up" : "chevron.down"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
                {expandedFilters.color && (
                  <View style={styles.filterModalChips}>
                    {availableFilters.colors.length > 0 ? (
                      <>
                        <TouchableOpacity
                          onPress={() => setSelectedColors([])}
                          style={[
                            styles.filterModalChip,
                            selectedColors.length === 0 &&
                              styles.filterModalChipActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.filterModalChipText,
                              selectedColors.length === 0 &&
                                styles.filterModalChipTextActive,
                            ]}
                          >
                            All
                          </Text>
                        </TouchableOpacity>
                        {availableFilters.colors.map((color) => {
                          const isSelected = selectedColors.includes(color);
                          return (
                            <TouchableOpacity
                              key={color}
                              onPress={() => {
                                setSelectedColors((prev) =>
                                  isSelected
                                    ? prev.filter((c) => c !== color)
                                    : [...prev, color]
                                );
                              }}
                              style={[
                                styles.filterModalChip,
                                isSelected && styles.filterModalChipActive,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.filterModalChipText,
                                  isSelected && styles.filterModalChipTextActive,
                                ]}
                              >
                                {color}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </>
                    ) : (
                      <Text style={styles.filterModalEmptyText}>
                        No colors available in this category
                      </Text>
                    )}
                  </View>
                )}
                {!expandedFilters.color && (
                  <Text style={styles.filterModalCollapsedText}>
                    Tap to expand
                  </Text>
                )}
              </View>

              {/* Season Filter */}
              <View style={styles.filterModalSection}>
                <TouchableOpacity
                  onPress={() => toggleFilter("season")}
                  style={styles.filterModalSectionHeader}
                >
                  <Text style={styles.filterModalSectionTitle}>Season</Text>
                  <IconSymbol
                    name={expandedFilters.season ? "chevron.up" : "chevron.down"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
                {expandedFilters.season && (
                  <View style={styles.filterModalChips}>
                    {availableFilters.seasons.length > 0 ? (
                      <>
                        <TouchableOpacity
                          onPress={() => setSelectedSeasons([])}
                          style={[
                            styles.filterModalChip,
                            selectedSeasons.length === 0 &&
                              styles.filterModalChipActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.filterModalChipText,
                              selectedSeasons.length === 0 &&
                                styles.filterModalChipTextActive,
                            ]}
                          >
                            All
                          </Text>
                        </TouchableOpacity>
                        {availableFilters.seasons.map((season) => {
                          const isSelected = selectedSeasons.includes(season);
                          return (
                            <TouchableOpacity
                              key={season}
                              onPress={() => {
                                setSelectedSeasons((prev) =>
                                  isSelected
                                    ? prev.filter((s) => s !== season)
                                    : [...prev, season]
                                );
                              }}
                              style={[
                                styles.filterModalChip,
                                isSelected && styles.filterModalChipActive,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.filterModalChipText,
                                  isSelected && styles.filterModalChipTextActive,
                                ]}
                              >
                                {season}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </>
                    ) : (
                      <Text style={styles.filterModalEmptyText}>
                        No seasons available in this category
                      </Text>
                    )}
                  </View>
                )}
                {!expandedFilters.season && (
                  <Text style={styles.filterModalCollapsedText}>
                    Tap to expand
                  </Text>
                )}
              </View>
            </ScrollView>

            <View style={styles.filterModalFooter}>
              <TouchableOpacity
                onPress={clearAllFilters}
                style={styles.filterModalClearButton}
              >
                <Text style={styles.filterModalClearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                style={styles.filterModalApplyButton}
              >
                <Text style={styles.filterModalApplyButtonText}>
                  Apply ({filteredItems.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

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
                    style={styles.editButton}
                    onPress={() => {
                      setModalVisible(false);
                      // Navigate to edit screen with item data
                      router.push({
                        pathname: "/(tabs)/addItemScreen",
                        params: {
                          editMode: "true",
                          itemId: selectedItem.itemId,
                          itemImage: selectedItem.itemImage,
                          itemName: selectedItem.itemName,
                          itemCategory: selectedItem.itemCategory,
                          colors: JSON.stringify(selectedItem.colors),
                          styles: JSON.stringify(selectedItem.style),
                          seasons: JSON.stringify(selectedItem.season),
                          size: selectedItem.size || "",
                          tags: JSON.stringify(selectedItem.tags || []),
                        },
                      });
                    }}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
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
    paddingHorizontal: 20,
  },
  tabsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 10,
  },
  tabsContainer: {
    flex: 1,
    maxHeight: 60,
  },
  tabsContent: {
    gap: 8,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(108, 99, 255, 0.2)",
  },
  filterButtonActive: {
    backgroundColor: "rgb(108, 99, 255)",
    borderColor: "rgb(108, 99, 255)",
  },
  filterBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  activeFiltersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(108, 99, 255, 0.1)",
  },
  activeFiltersChips: {
    flexDirection: "row",
  },
  activeFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgb(108, 99, 255)",
    marginRight: 6,
  },
  activeFilterChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
    marginRight: 4,
  },
  activeFilterChipClose: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  activeFilterChipCloseText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    lineHeight: 14,
  },
  filterModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  filterModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    minHeight: 600,
    paddingBottom: 0,
    flexDirection: "column",
    width: "100%",
  },
  filterModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  filterModalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  filterModalClose: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  filterModalScroll: {
    flex: 1,
  },
  filterModalScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  filterModalSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  filterModalSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  filterModalSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  filterModalChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  filterModalChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterModalChipActive: {
    backgroundColor: "rgb(108, 99, 255)",
    borderColor: "rgb(108, 99, 255)",
  },
  filterModalChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A1A1A",
  },
  filterModalChipTextActive: {
    color: "#FFFFFF",
  },
  filterModalFooter: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  filterModalClearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  filterModalClearButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  filterModalApplyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "rgb(108, 99, 255)",
    alignItems: "center",
    justifyContent: "center",
  },
  filterModalApplyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  filterModalEmptyText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    paddingVertical: 10,
  },
  filterModalCollapsedText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    paddingVertical: 8,
    paddingLeft: 4,
  },
  filterChips: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  filterChipsContent: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(108, 99, 255, 0.2)",
  },
  filterChipActive: {
    backgroundColor: "rgb(108, 99, 255)",
    borderColor: "rgb(108, 99, 255)",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1A1A1A",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginRight: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tabActive: {
    backgroundColor: "rgb(108, 99, 255)",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  tabCount: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    textAlign: "center",
  },
  tabCountActive: {
    color: "#FFFFFF",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
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
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "flex-start",
  },
  itemImageContainer: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden",
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
  editButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: "rgb(108, 99, 255)",
    alignItems: "center",
  },
  editButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
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
