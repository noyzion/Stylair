import { useState } from 'react';
import {View, Text, ScrollView, StyleSheet, Pressable} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function AddItemScreen() {
    const [item, addItem] = useState(null);
    const [image, setImage] = useState<string | null>(null);

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
        <View style ={styles.buttonsRow}>
            <Pressable onPress={takeImage} >
            <View style={styles.uploadPhotoButton}>
                <Text style={styles.uploadPhotoText}>Take Photo</Text>
            </View>
            </Pressable>
            <Pressable onPress={pickImage} >
            <View style={styles.uploadPhotoButton}>
                <Text style={styles.uploadPhotoText}>Upload Photo</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end', 
    marginTop: 30,
    marginRight: 10,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  uploadPhotoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
});
  


