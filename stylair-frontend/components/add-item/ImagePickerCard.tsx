import { View, Text, Pressable, ImageBackground, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../../assets/styles/AddItemScreen.styles';

type Props = {
  image: string | null;
  onPickImage: () => void;
  onTakeImage: () => void;
};

export function ImagePickerCard({ image, onPickImage, onTakeImage }: Props) {
  return (
    <View style={styles.imageCard}>
      <ImageBackground source={image ? { uri: image } : undefined} style={styles.imageBackground}
                                 imageStyle={styles.imageBackgroundImage}>
        {image && <View style={styles.overlay} />}
        <View style={styles.cardContent}>
          {!image && ( <Ionicons name="image-outline" size={64} color="#C7C7CC" style={{ marginBottom: 20 }} /> )}
          <View style={styles.photoButtonsRow}>
            <Pressable onPress={onTakeImage}>
              <View style={styles.uploadPhotoButton}>
                <BlurView intensity={75} tint="light" style={StyleSheet.absoluteFillObject} />
                <LinearGradient
                  colors={['rgba(108, 99, 255, 0.8)', 'rgba(139, 92, 246, 0.9)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <Ionicons name="camera-outline" size={16} color="white" />
                <Text style={styles.uploadPhotoText}>Take Photo</Text>
              </View>
            </Pressable>
            <Pressable onPress={onPickImage}>
              <View style={styles.uploadPhotoButton}>
                <BlurView intensity={75} tint="light" style={StyleSheet.absoluteFillObject} />
                <LinearGradient
                  colors={['rgba(108, 99, 255, 0.8)', 'rgba(139, 92, 246, 0.9)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <Ionicons name="image-outline" size={16} color="white" />
                <Text style={styles.uploadPhotoText}>Upload Photo</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}
