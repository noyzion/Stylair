import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../../assets/styles/AddItemScreen.styles';

type Props = {
  disabled: boolean;
  onGenerate: () => void;
};

export function AIImageCard(props: Props) {
    const disabled = props.disabled;
    const onGenerate = props.onGenerate;
  return (
    <View style={styles.aiCard}>
      <View style={styles.aiIconWrapper}>
        <Ionicons name="sparkles" size={26} color="rgb(108, 99, 255)" />
      </View>

      <Text style={styles.aiTitle}>AI will analyze your photo</Text>
      <Text style={styles.aiDescription}>Detect category, color, style, and more</Text>

      <Pressable disabled={disabled} onPress={onGenerate}>
        <View style={[styles.aiButton, disabled && { opacity: 0.5 }]}>
          <BlurView intensity={75} tint="light" style={StyleSheet.absoluteFillObject} />
          <LinearGradient
            colors={['rgba(108, 99, 255, 0.8)', 'rgba(139, 92, 246, 0.9)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
          <Ionicons name="sparkles-outline" size={18} color="white" />
          <Text style={styles.aiButtonText}>Generate Details</Text>
        </View>
      </Pressable>
    </View>
  );
}
