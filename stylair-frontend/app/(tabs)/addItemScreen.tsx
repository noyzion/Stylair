import { useState } from 'react';
import {View, Text, ScrollView, StyleSheet, Pressable, Modal} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { ImageBackground } from 'react-native';
import { styles } from '../../assets/styles/AddItemScreen.styles';
import { TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { KeyboardAvoidingView, Platform } from 'react-native';

type ClosetItem = {
  id: string;
  imageUri: string;
  category: 'Top' | 'Bottom' | 'Dress' | 'Shoes';
  subCategory?: string; 
  color: string;
  style?: 'Casual' | 'Formal' | 'Sport' | 'Evening';
  season?: 'Summer' | 'Winter' | 'All';
  source: 'manual' | 'ai-image' | 'ai-product';
  brand?: string;
  sku?: string;
  createdAt: string;
};

type UserChoice = 'manual' | 'ai-image' | 'ai-product';

export default function AddItemScreen() {
    const [image, setImage] = useState<string | null>(null);
    const [choice, setChoice] = useState<UserChoice | null>(null);
    const [category, setCategory] = useState<'Top' | 'Bottom' | 'Dress' | 'Shoes' | null>(null);
    const [subCategory, setSubCategory] = useState('');
    const [color, setColor] = useState('');
    const [style, setStyle] = useState<'Casual' | 'Formal' | 'Sport' | 'Evening' | null>('Casual');
    const [season, setSeason] = useState<'Summer' | 'Winter' | 'Spring' | 'Fall' | 'All' | null>('Summer');
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [tempCategory, setTempCategory] = useState<'Top' | 'Bottom' | 'Dress' | 'Shoes' | null>(null);
    const [touched, setTouched] = useState({image: false,category: false,color: false,});
    const [brand, setBrand] = useState('');
    const [sku, setSku] = useState('');

    const isFormValid = !!image && !!category && color.trim().length > 0;
    const isProductValid = brand.trim().length > 0 && sku.trim().length > 0;


    const pickImage = async () => {
        const permissionResult =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        
            if (!permissionResult.granted) {
                alert('Permission to access gallery is required!');
                return;
              }
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'], 
                allowsEditing: true,
                quality: 1,
              });
              if (!result.canceled) {
                console.log(result.assets[0].uri);
                setImage(result.assets[0].uri);
                setTouched(prev => ({ ...prev, image: true }));
              }   
    };

    const takeImage = async () => {
        const permissionResult =
            await ImagePicker.requestCameraPermissionsAsync();
        
            if (!permissionResult.granted) {
                alert('Permission to access gallery is required!');
                return;
              }
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'], 
                allowsEditing: true,
                quality: 1,
              });
              if (!result.canceled) {
                setImage(result.assets[0].uri);
                setTouched(prev => ({ ...prev, image: true }));
              }               
    };

    return (
        
      <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: '#F5F5F7' }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
    
        <View style={{backgroundColor: 'white'}}> 
            <Text style ={styles.header} >Add Item To Your Closet</Text>
        </View>

        <View style={styles.imageCard}>
            <ImageBackground source={image ? { uri: image } : undefined} style={styles.imageBackground}
              imageStyle={styles.imageBackgroundImage}>
              {image && <View style={styles.overlay} />}
              <View style={styles.cardContent}>
                {!image && ( <Ionicons name="image-outline" size={64} color="#C7C7CC" style={{ marginBottom: 20 }}/>)}
                <View style={styles.photoButtonsRow}>
                  <Pressable onPress={takeImage}>
                    <View style={styles.uploadPhotoButton}>
                      <Ionicons name="camera-outline" size={16} color="white" />
                      <Text style={styles.uploadPhotoText}>Take Photo</Text>
                    </View>
                  </Pressable>
                  <Pressable onPress={pickImage}>
                    <View style={styles.uploadPhotoButton}>
                      <Ionicons name="image-outline" size={16} color="white" />
                      <Text style={styles.uploadPhotoText}>Upload Photo</Text>
                    </View>
                  </Pressable>
                </View>
              </View>
            </ImageBackground>
          </View>
          {touched.image && !image && (
         <Text style={[styles.errorText, { textAlign: 'center', marginTop: 8 }]}>Image is required</Text>)}

          <Text style={styles.dividerText}> How would you like to add item details?</Text>
          <View style={styles.columnCardsUserChoice}> 

            <Pressable onPress={() => setChoice('manual')}>
            <View style={[styles.option, choice == 'manual' && styles.optionSelected]}>
            <View style={[styles.iconContainer, choice == 'manual' && styles.iconContainerSelected]}> 
              <Ionicons name="pencil-outline" size={20} color={choice === 'manual' ? 'white' : 'rgb(108, 99, 255)'}/>
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.choiceText,choice === 'manual' && { color: 'rgb(108, 99, 255)' },]}>Fill Manually</Text>
                <Text style={styles.descriptionText}>Enter item details yourself</Text>
              </View>
            </View>
            </Pressable>

            <Pressable onPress={() => setChoice('ai-image')}>
              <View style={[styles.option, choice == 'ai-image' && styles.optionSelected]}>
              <View style={[styles.iconContainer, choice == 'ai-image' && styles.iconContainerSelected]}>
                <Ionicons name="sparkles-outline" size={20} color={choice === 'ai-image' ? 'white' : 'rgb(108, 99, 255)'} />
                </View> 
                <View style={{ marginLeft: 12 }}>
                <Text style={[styles.choiceText,choice === 'ai-image' && { color: 'rgb(108, 99, 255)' },]} >Generate with AI (from image)</Text>
                <Text style= {styles.descriptionText}>Let AI analyze the photo</Text>
              </View>
            </View>
            </Pressable>
            <Pressable onPress={() => setChoice('ai-product')}>
              <View style={[styles.option, choice == 'ai-product' && styles.optionSelected]}>
              <View style={[styles.iconContainer, choice == 'ai-product' && styles.iconContainerSelected]}>
                <Ionicons name="barcode-outline" size={20} color={choice === 'ai-product' ? 'white' : 'rgb(108, 99, 255)'} />
                </View> 
                <View style={{ marginLeft: 12 }}>
                <Text style={[styles.choiceText,choice === 'ai-product' && { color: 'rgb(108, 99, 255)' },]}>
                  Generate with AI (brand & SKU)</Text>
                <Text style= {styles.descriptionText}>Use brand and product code</Text>
                </View>
              </View>
            </Pressable>
          </View>

          {choice === 'ai-product' && (
            <View style={styles.aiCard}>
              <View style={styles.aiIconWrapper}>
                <Ionicons name="pricetag-outline" size={26} color="rgb(108, 99, 255)" />
              </View>
              <Text style={styles.formLabel}>Brand</Text>
              <View style={styles.inputBox}>
                <TextInput value={brand} onChangeText={setBrand}  placeholder="e.g. Nike, Zara, Levi's" style={{ padding: 0 }}/>
              </View>
              <Text style={styles.formLabel}>SKU / Model Number</Text>
              <View style={styles.inputBox}>
                <TextInput value={sku} onChangeText={setSku} placeholder="e.g. AB123456, 501-ORIGINAL" style={{ padding: 0 }}/>
              </View>
              <Pressable disabled={!isProductValid} onPress={() => {// generateFromBrandAndSKU()
                }}>
                <View style={[styles.aiButton,!isProductValid && { opacity: 0.5},]}>
                  <Ionicons name="sparkles-outline" size={18} color="white" />
                  <Text style={styles.aiButtonText}>Generate Details </Text>
                </View>
              </Pressable>
            </View>
          )}

          {choice === 'ai-image' && (
            <View style={styles.aiCard}>
              <View style={styles.aiIconWrapper}>
                <Ionicons name="sparkles" size={26} color="rgb(108, 99, 255)" />
              </View>
               <Text style={styles.aiTitle}>AI will analyze your photo</Text>
               <Text style={styles.aiDescription}> Detect category, color, style, and more</Text>
              <Pressable disabled={!image} onPress={() => { // generateFromImage() 
                }}>
                <View style={[styles.aiButton, !image && { opacity: 0.5 },]} >
                  <Ionicons name="sparkles-outline" size={18} color="white" />
                  <Text style={styles.aiButtonText}>Generate Details</Text>
                </View>
              </Pressable>
            </View>
          )}

          {choice === 'manual' && (<View style={styles.manualFormContainer}>
            
            <Text style={styles.formLabel}>Category *</Text>
            <Pressable onPress={() => {setTempCategory(category); setIsCategoryOpen(true)}}>
                <View style={styles.inputBox}>
                  <Text style={{ color: category ? '#111' : '#999' }}>
                    {category || 'Select a category'}
                  </Text>
                </View>
              </Pressable>
              {touched.category && !category && (<Text style={styles.errorText}>Category is required</Text>)}
            <Modal visible={isCategoryOpen} transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select a category</Text>
                      <Picker selectedValue={tempCategory} onValueChange={(value) => { setTempCategory(value);}}>
                        <Picker.Item label="Top" value="Top" />
                        <Picker.Item label="Bottom" value="Bottom" />
                        <Picker.Item label="Dress" value="Dress" />
                        <Picker.Item label="Shoes" value="Shoes" />
                      </Picker>
                      <Pressable onPress={() => setIsCategoryOpen(false)}>
                         <Text style={styles.modalClose}>Cancel</Text>
                      </Pressable>
                      <Pressable onPress={() => {setCategory(tempCategory);   
                      setTouched(prev => ({ ...prev, category: true })); setIsCategoryOpen(false); }}>
                        <Text style={styles.modalDone}>Done</Text>
                      </Pressable>

                    </View>
                  </View>
                </Modal>

            <Text style={styles.formLabel}>Sub-Category (optional)</Text>
              <View style={styles.inputBox}> 
                <TextInput value={subCategory} onChangeText={setSubCategory} placeholder="e.g T-shirt, Jeans, Sneakers" style={{ padding:0}}/>
              </View>

            <Text style={styles.formLabel}>Color *</Text>
              <View style={[styles.inputBox, touched.color && !color && styles.inputError,]}>
                <TextInput value={color} onChangeText={(text) => { setColor(text); 
                  setTouched(prev => ({ ...prev, color: true }));}} placeholder="e.g Blue" style={{ padding:0}}/>
              </View>
              {touched.color && !color && (<Text style={styles.errorText}>Color is required</Text>)}
      
            <Text style={styles.formLabel}>Style</Text>
            <View style={styles.chipsRow}>
              <Pressable onPress={() => setStyle('Casual')}>
                <View style={[styles.chip, style === 'Casual' && styles.chipSelected]}>
                <Text  style={style === 'Casual'  ? styles.chipTextSelected : styles.chipText}>Casual</Text>
                </View>
              </Pressable>
              <Pressable onPress={() => setStyle('Formal')}>
                <View style={[styles.chip, style === 'Formal' && styles.chipSelected]}>
                <Text  style={style === 'Formal'  ? styles.chipTextSelected : styles.chipText}>Formal</Text>
                </View>
              </Pressable>
              <Pressable onPress={() => setStyle('Sport')}>
                <View style={[styles.chip, style === 'Sport' && styles.chipSelected]}>
                <Text  style={style === 'Sport'  ? styles.chipTextSelected : styles.chipText}>Sport</Text>
                </View>
              </Pressable>
              <Pressable onPress={() => setStyle('Evening')}>
                <View style={[styles.chip, style === 'Evening' && styles.chipSelected]}>
                <Text  style={style === 'Evening'  ? styles.chipTextSelected : styles.chipText}>Evening</Text>
                </View>
              </Pressable>
            </View>
            <Text style={styles.formLabel}>Season</Text>
            <View style={styles.chipsRow}>

            <Pressable onPress={() => setSeason('Summer')}>
              <View style={[styles.chip, season === 'Summer' && styles.chipSelected]}>
                <Text style={season === 'Summer' ? styles.chipTextSelected : styles.chipText}>
                  Summer
                </Text>
              </View>
            </Pressable>
            <Pressable onPress={() => setSeason('Winter')}>
              <View style={[styles.chip, season === 'Winter' && styles.chipSelected]}>
                <Text style={season === 'Winter' ? styles.chipTextSelected : styles.chipText}>
                Winter
                </Text>
              </View>
            </Pressable>
            <Pressable onPress={() => setSeason('Fall')}>
              <View style={[styles.chip, season === 'Fall' && styles.chipSelected]}>
                <Text style={season === 'Fall' ? styles.chipTextSelected : styles.chipText}>
                Fall
                </Text>
              </View>
            </Pressable>
            <Pressable onPress={() => setSeason('Spring')}>
              <View style={[styles.chip, season === 'Spring' && styles.chipSelected]}>
                <Text style={season === 'Spring' ? styles.chipTextSelected : styles.chipText}>
                Spring
                </Text>
              </View>
            </Pressable>
            <Pressable onPress={() => setSeason('All')}>
              <View style={[styles.chip, season === 'All' && styles.chipSelected]}>
                <Text style={season === 'All' ? styles.chipTextSelected : styles.chipText}>
                All
                </Text>
              </View>
            </Pressable>
            </View>
                   
          </View>
        )}
       {choice === 'manual' && (
        <Pressable
        disabled={!isFormValid}
        onPress={() => {
          setTouched({ image: true, category: true, color: true });
          if (!isFormValid) return;
          // saveItem()
        }}
        style={({ pressed }) => [
          styles.saveButton,
          !isFormValid && { opacity: 0.5 },
          pressed && styles.saveButtonPressed,
        ]}
      >
        <Text style={styles.saveButtonText}>Save to Closet</Text>
      </Pressable> )}

      </ScrollView>
</KeyboardAvoidingView>
    )
}


