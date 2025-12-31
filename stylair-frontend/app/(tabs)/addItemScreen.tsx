import { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { styles } from "../../assets/styles/AddItemScreen.styles";
import { KeyboardAvoidingView, Platform } from "react-native";
import { addItemToCloset } from "../../services/closet.service";
import { AddClosetItemRequest } from "../../types/closet";
import { ImagePickerCard } from "@/components/add-item/ImagePickerCard";
import {
  UserChoiceSelector,
  UserChoice,
} from "../../components/add-item/UserChoiceSelector";
import { AIImageCard } from "../../components/add-item/AIImageCard";
import { AIProductCard } from "../../components/add-item/AIProductCard";
import { ManualForm } from "../../components/add-item/ManualForm";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

export const CATEGORIES = ["top", "bottom", "shoes", "accessories", "dress"] as const;
export const STYLES = ["casual", "formal", "sport", "evening"] as const;
export const SEASONS = ["summer", "winter", "spring", "fall", "all"] as const;
export const SIZES_CLOTHING = ["XS", "S", "M", "L", "XL", "XXL", "one size"] as const;
export const SIZES_SHOES = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"] as const;
export const TAGS = ["favorite", "rarely used", "new", "expensive"] as const;

export type Category = (typeof CATEGORIES)[number];
export type Style = (typeof STYLES)[number];
export type Season = (typeof SEASONS)[number];
export type Tag = (typeof TAGS)[number];

export default function AddItemScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [choice, setChoice] = useState<UserChoice | null>(null);
  const [subCategory, setSubCategory] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [color, setColor] = useState<string>("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [tempCategory, setTempCategory] = useState<Category | null>(null);
  const [touched, setTouched] = useState({
    image: false,
    category: false,
    color: false,
  });
  const [brand, setBrand] = useState("");
  const [sku, setSku] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [stylesSelected, setStylesSelected] = useState<Style[]>([]);
  const [seasonsSelected, setSeasonsSelected] = useState<Season[]>([]);
  const [size, setSize] = useState<string>("");
  const [tagsSelected, setTagsSelected] = useState<Tag[]>([]);

  const hasColor = colors.length > 0 || color.trim().length > 0;
  const isFormValid = !!image && !!category && hasColor;
  const isProductValid = brand.trim().length > 0 && sku.trim().length > 0;

  const convertImageUriToBase64 = async (uri: string): Promise<string> => {
    try {
      // Use expo-file-system to read the file as base64
      // In newer versions, we can use readAsStringAsync with base64 encoding
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });
      // Return as data URI format
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error("Error converting image URI to base64:", error);
      throw error;
    }
  };

  const saveItem = async () => {
    try {
      if (!image) {
        alert("Please select an image");
        return;
      }

      // Use the base64 we already have, or convert from URI if needed
      let base64Image: string;
      if (imageBase64) {
        base64Image = imageBase64;
      } else {
        // Convert URI to base64 if we don't have it already
        base64Image = await convertImageUriToBase64(image);
      }

      const colorsToSave =
        colors.length > 0 ? colors : color.trim() ? [color.toLowerCase()] : [];

      // Debug: Log the current state values
      console.log("=== Before saving item ===");
      console.log("size state:", `"${size}"`, "trimmed:", `"${size.trim()}"`, "has value:", !!size.trim());
      console.log("tagsSelected state:", tagsSelected, "length:", tagsSelected.length);

      // Prepare the request object - always include size and tags in the object
      const trimmedSize = size.trim();
      const itemToSave: AddClosetItemRequest = {
        itemName: subCategory || category!,
        itemCategory: category!,
        itemImage: base64Image,
        style: stylesSelected.length ? stylesSelected : ["casual"],
        colors: colorsToSave,
        season: seasonsSelected.length ? seasonsSelected : ["all"],
        size: trimmedSize || undefined,  // undefined will be omitted from JSON
        tags: tagsSelected.length > 0 ? tagsSelected : undefined,  // undefined will be omitted from JSON
      };

      console.log("=== Final itemToSave object ===");
      console.log("Object keys:", Object.keys(itemToSave));
      console.log("size in object:", itemToSave.size, "type:", typeof itemToSave.size);
      console.log("tags in object:", itemToSave.tags, "type:", Array.isArray(itemToSave.tags));
      const jsonString = JSON.stringify(itemToSave);
      console.log("JSON string:", jsonString);

      await addItemToCloset(itemToSave);
      alert("Item added successfully");
      setImage(null);
      setImageBase64(null);
      setChoice(null);
      setCategory(null);
      setSubCategory("");
      setColors([]);
      setColor("");
      setStylesSelected([]);
      setSeasonsSelected([]);
      setSize("");
      setTagsSelected([]);
      setTouched({ image: false, category: false, color: false });
    } catch (error) {
      console.error(error);
      alert("Failed to add item");
    }
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Permission to access gallery is required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
      base64: true, // Get base64 directly from ImagePicker
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      console.log(asset.uri);
      setImage(asset.uri);
      // Store base64 if available
      if (asset.base64) {
        setImageBase64(`data:image/jpeg;base64,${asset.base64}`);
      }
      setTouched((prev) => ({ ...prev, image: true }));
    }
  };

  const takeImage = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Permission to access gallery is required!");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
      base64: true, // Get base64 directly from ImagePicker
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setImage(asset.uri);
      // Store base64 if available
      if (asset.base64) {
        setImageBase64(`data:image/jpeg;base64,${asset.base64}`);
      }
      setTouched((prev) => ({ ...prev, image: true }));
    }
  };

  function toggleValue<T>(
    value: T,
    list: T[],
    setList: React.Dispatch<React.SetStateAction<T[]>>
  ) {
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
    );
  }

  const applyAIGeneratedData = async (data: {
    imageUri: string;
    category: Category;
    subCategory?: string;
    colors: string[];
    styles: Style[];
    seasons: Season[];
  }) => {
    setImage(data.imageUri);
    setCategory(data.category);
    setSubCategory(data.subCategory || "");
    setColors(data.colors);
    setColor(data.colors[0] ?? "");
    setStylesSelected(data.styles);
    setSeasonsSelected(data.seasons);
    // Note: size and tags are not included in AI-generated data yet
    setSize("");
    setTagsSelected([]);

    setTouched({
      image: true,
      category: true,
      color: true,
    });

    setChoice("manual");
    
    // Convert the image URI to base64 if needed
    // Note: If the imageUri is already from ImagePicker with base64, we should store it
    // For now, we'll need to convert it when saving, or store base64 separately
    // This is a limitation - we might need to refetch the image with base64 option
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
          contentContainerStyle={styles.scrollContent}
        >
          <ImagePickerCard
            image={image}
            onPickImage={pickImage}
            onTakeImage={takeImage}
          />

          {touched.image && !image && (
            <Text
              style={[styles.errorText, { textAlign: "center", marginTop: 8 }]}
            >
              Image is required
            </Text>
          )}
          <UserChoiceSelector value={choice} onChange={setChoice} />
          {choice === "ai-image" && (
            <AIImageCard
              disabled={!image}
              onGenerate={() => {
                // כאן בעתיד יהיה API
                applyAIGeneratedData({
                  imageUri: image!,
                  category: "top",
                  subCategory: "t-shirt",
                  colors: ["black"],
                  styles: ["casual"],
                  seasons: ["all"],
                });
              }}
            />
          )}

          {choice === "ai-product" && (
            <AIProductCard
              brand={brand}
              sku={sku}
              onBrandChange={setBrand}
              onSkuChange={setSku}
              onGenerate={() => {
                // generateFromBrandAndSKU()
                applyAIGeneratedData({
                  imageUri: image!,
                  category: "top",
                  subCategory: "t-shirt",
                  colors: ["black"],
                  styles: ["casual"],
                  seasons: ["all"],
                });
                setBrand("");
                setSku("");
              }}
            />
          )}

          {choice === "manual" && (
            <ManualForm
              category={category}
              subCategory={subCategory}
              color={color}
              colors={colors}
              stylesSelected={stylesSelected}
              seasonsSelected={seasonsSelected}
              size={size}
              tagsSelected={tagsSelected}
              touched={touched}
              isCategoryOpen={isCategoryOpen}
              tempCategory={tempCategory}
              setCategory={setCategory}
              setSubCategory={setSubCategory}
              setColor={setColor}
              setColors={setColors}
              setStylesSelected={setStylesSelected}
              setSeasonsSelected={setSeasonsSelected}
              setSize={setSize}
              setTagsSelected={setTagsSelected}
              setTouched={setTouched}
              setIsCategoryOpen={setIsCategoryOpen}
              setTempCategory={setTempCategory}
              toggleValue={toggleValue}
              hasColor={hasColor}
            />
          )}

          {choice === "manual" && (
            <Pressable
              disabled={!isFormValid}
              onPress={() => {
                setTouched({ image: true, category: true, color: true });
                if (!isFormValid) return;
                saveItem();
              }}
              style={({ pressed }) => [
                styles.saveButton,
                !isFormValid && styles.saveButtonDisabled,
                pressed && styles.saveButtonPressed,
              ]}
            >
              <BlurView
                intensity={75}
                tint="light"
                style={StyleSheet.absoluteFillObject}
              />
              <LinearGradient
                colors={["rgba(108, 99, 255, 0.8)", "rgba(139, 92, 246, 0.9)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFillObject}
              />
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color="white"
              />
              <Text style={styles.saveButtonText}>Save to Closet</Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
