import { useState } from 'react';
import {View, Text, ScrollView, StyleSheet, Pressable} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { ImageBackground } from 'react-native';

type ClosetItem = {
  id: string;
  imageUri: string;
  category: 'Top' | 'Bottom' | 'Dress' | 'Shoes' | 'Outerwear';
  subCategory?: string; // T-Shirt, Jeans, Blazer
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
    const [choice, setChoice] = useState<UserChoice  | null>(null);

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
                console.log(result.assets[0].uri);
                setImage(result.assets[0].uri);
              }   

    };

    
    return (
        <ScrollView  style={{ flex: 1, backgroundColor: 'White', }}>
          
        <View style={{backgroundColor: 'white'}}> 
            <Text style ={styles.header} >Add Item To Your Closet</Text>
        </View>

        <View style={styles.imageCard}>
            <ImageBackground source={image ? { uri: image } : null} style={styles.imageBackground}
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

          <Text style={styles.dividerText}> How would you like to add item details?</Text>
          <View style={styles.columnCardsUserChoice}> 
            <Pressable>
            <View style={styles.option}>
              <Ionicons name="pencil-outline" size={20} color="#6C63FF" />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.choiceText}>Fill Manually</Text>
                <Text style={styles.descriptionText}>Enter item details yourself</Text>
              </View>
            </View>
            </Pressable>
            <Pressable>
              <View style={styles.option}>
                <Ionicons name="sparkles-outline" size={20} color="#6C63FF" />
                <View style={{ marginLeft: 12 }}>
                <Text style= {styles.choiceText}>Generate with AI (from image)</Text>
                <Text style= {styles.descriptionText}>Let AI analyze the photo</Text>
              </View>
            </View>
            </Pressable>
            <Pressable>
              <View style={styles.option}>
                <Ionicons name="barcode-outline" size={20} color="#6C63FF" />
                <View style={{ marginLeft: 12 }}>
                <Text style= {styles.choiceText}>Generate with AI (brand & SKU)</Text>
                <Text style= {styles.descriptionText}>Use brand and product code</Text>
                </View>
              </View>
            </Pressable>
          </View>
         </ScrollView>
    )
}

const styles = StyleSheet.create({
  header: {
    fontFamily: 'Poppins',
    fontSize: 24,
    fontWeight: 'bold',
    color: 'rgb(108, 99, 255)',
    marginTop: 80,
    margin: 15,
    textAlign: 'center',
  }, 
  uploadPhotoButton: {
    backgroundColor: 'rgb(108, 99, 255)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',    
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  photoButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  uploadPhotoText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 8,          
  },  
  dividerText: {
    textAlign: 'center',
    marginVertical: 12,
    color: '#111',
    fontSize: 18,
    marginTop: 20,
  },  
  imageCard: {
    height: 280,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBackgroundImage: {
    resizeMode: 'cover', 
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  cardContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  columnCardsUserChoice: {
    marginTop: 8,
    paddingHorizontal: 20,
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  choiceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  descriptionText: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },  
});
  


