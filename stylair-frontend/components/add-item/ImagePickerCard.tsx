import { View, Text, Pressable, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../assets/styles/AddItemScreen.styles';

type Props = {
  image: string | null;
  onPickImage: () => void;
  onTakeImage: () => void;
};

export function ImagePickerCard({ image, onPickImage, onTakeImage }: Props) {
  return (
    <View style={styles.imageCard}>
      <ImageBackground source={image ? { uri: image } : undefined} style={styles.imageBackground} imageStyle={styles.imageBackgroundImage}>
        {image && <View style={styles.overlay} />}
        <View style={styles.cardContent}>
          {!image && ( <Ionicons name="image-outline" size={64} color="#C7C7CC" style={{ marginBottom: 20 }} /> )}
          <View style={styles.photoButtonsRow}>
            <Pressable onPress={onTakeImage}>
              <View style={styles.uploadPhotoButton}>
                <Ionicons name="camera-outline" size={16} color="white" />
                <Text style={styles.uploadPhotoText}>Take Photo</Text>
              </View>
            </Pressable>
            <Pressable onPress={onPickImage}>
              <View style={styles.uploadPhotoButton}>
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
