import { View, Text, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../assets/styles/AddItemScreen.styles';

type Props = {
  brand: string;
  sku: string;
  onBrandChange: (v: string) => void;
  onSkuChange: (v: string) => void;
  onGenerate: () => void;
};

export function AIProductCard(props : Props) {
    const brand = props.brand;
    const sku = props.sku;
    const onBrandChange = props.onBrandChange;
    const onSkuChange = props.onSkuChange;
    const onGenerate = props.onGenerate;

  const isValid = brand.trim().length > 0 && sku.trim().length > 0;
    
  return (
    <View style={styles.aiCard}>
    <View style={styles.aiIconWrapper}>
      <Ionicons name="pricetag-outline" size={26} color="rgb(108, 99, 255)" />
    </View>
    <Text style={styles.formLabel}>Brand</Text>
    <View style={styles.inputBox}>
      <TextInput value={brand} onChangeText={onBrandChange}  placeholder="e.g. Nike, Zara, Levi's" style={{ padding: 0 }}/>
    </View>
    <Text style={styles.formLabel}>SKU / Model Number</Text>
    <View style={styles.inputBox}>
      <TextInput value={sku} onChangeText={onSkuChange} placeholder="e.g. AB123456, 501-ORIGINAL" style={{ padding: 0 }}/>
    </View>
    <Pressable disabled={!isValid} onPress={() => {// generateFromBrandAndSKU()
      }}>
      <View style={[styles.aiButton,!isValid && { opacity: 0.5},]}>
        <Ionicons name="sparkles-outline" size={18} color="white" />
        <Text style={styles.aiButtonText}>Generate Details </Text>
      </View>
    </Pressable>
  </View>
  );
}
