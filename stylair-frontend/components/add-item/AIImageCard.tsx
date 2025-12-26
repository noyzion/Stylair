import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
          <Ionicons name="sparkles-outline" size={18} color="white" />
          <Text style={styles.aiButtonText}>Generate Details</Text>
        </View>
      </Pressable>
    </View>
  );
}
