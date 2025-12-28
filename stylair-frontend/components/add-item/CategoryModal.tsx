import { View, Text, Modal, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { styles } from '../../assets/styles/AddItemScreen.styles';
import { Category } from '../../app/(tabs)/addItemScreen';

type Props = {
  visible: boolean;
  value: Category | null;
  onChange: (v: Category | null) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function CategoryModal({
  visible,
  value,
  onChange,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select a category</Text>

          <Picker selectedValue={value} onValueChange={onChange}>
            <Picker.Item label="Top" value="top" />
            <Picker.Item label="Bottom" value="bottom" />
            <Picker.Item label="Dress" value="dress" />
            <Picker.Item label="Shoes" value="shoes" />
          </Picker>

          <Pressable onPress={onClose}>
            <Text style={styles.modalClose}>Cancel</Text>
          </Pressable>

          <Pressable onPress={onConfirm}>
            <Text style={styles.modalDone}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
