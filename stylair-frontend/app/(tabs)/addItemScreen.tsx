import { useState } from 'react';
import {View, Text, ScrollView, StyleSheet, Pressable, TextInput} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Linking } from 'react-native';

export default function AddItemScreen() {
    const [item, addItem] = useState(null);
    const [image, setImage] = useState<string | null>(null);
    const [sku, setSku] = useState('');
    const [brand, setBrand] = useState('');
    
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
    const handleSearch = () => {
      const query = `${brand} ${sku}`;
      const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      Linking.openURL(url);
    };
    
    return (
        <ScrollView  style={{ flex: 1, backgroundColor: 'White', }}>
        <View style={{backgroundColor: 'white'}}> 
            <Text style ={styles.header} >Add Item To Your Closet</Text>
        </View>
        <View style ={styles.photoButtonsRow}>
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
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.inputRow}>
        <TextInput style={styles.input} placeholder="SKU" value={sku} onChangeText={setSku}/>
        <TextInput style={styles.input} placeholder="Brand" value={brand} onChangeText={setBrand}/>
        </View>
         <Pressable style={[styles.searchButton, !(sku && brand) && styles.disabledButton]}
                    disabled={!(sku && brand)} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search on brand website</Text></Pressable>
         
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
    marginHorizontal: 6, 
  },
  photoButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 6,
    textAlign: 'center',
  },
  uploadPhotoText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },  
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
  },
  searchButton: {
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgb(108, 99, 255)',
    alignSelf: 'center',
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: 'transparent',
  },
  searchButtonText: {
    color: 'rgb(108, 99, 255)',
    fontSize: 14,
    fontWeight: '500',
  },
  disabledButton: {
    borderColor: '#ccc',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    textAlign: 'center',
  },
  dividerText: {
    textAlign: 'center',
    marginVertical: 12,
    color: '#999',
    fontSize: 16,
  },
  
});
  


