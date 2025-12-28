import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../assets/styles/AddItemScreen.styles';

export type UserChoice = 'manual' | 'ai-image' | 'ai-product';

type Props = {
  value: UserChoice | null;
  onChange: (choice: UserChoice) => void;
};

export function UserChoiceSelector({ value, onChange }: Props) {
  return (
    <>
      <Text style={styles.dividerText}>
        How would you like to add item details?
      </Text>

      <View style={styles.columnCardsUserChoice}>

        <Pressable onPress={() => onChange('manual')}>
          <View style={[styles.option, value === 'manual' && styles.optionSelected]}>
            <View
              style={[styles.iconContainer,value === 'manual' && styles.iconContainerSelected,]}>
              <Ionicons name="pencil-outline" size={20} color={value === 'manual' ? 'white' : 'rgb(108, 99, 255)'} />
            </View>

            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.choiceText, value === 'manual' && { color: 'rgb(108, 99, 255)' }, ]}>
                Fill Manually
              </Text>
              <Text style={styles.descriptionText}>
                Enter item details yourself
              </Text>
            </View>
          </View>
        </Pressable>

        <Pressable onPress={() => onChange('ai-image')}>
          <View style={[styles.option, value === 'ai-image' && styles.optionSelected]}>
            <View style={[styles.iconContainer, value === 'ai-image' && styles.iconContainerSelected,]} >
              <Ionicons name="sparkles-outline" size={20} color={value === 'ai-image' ? 'white' : 'rgb(108, 99, 255)'}/>
            </View>

            <View style={{ marginLeft: 12 }}>
              <Text style={[ styles.choiceText, value === 'ai-image' && { color: 'rgb(108, 99, 255)' }, ]} >
                Generate with AI (from image)
              </Text>
              <Text style={styles.descriptionText}>
                Let AI analyze the photo
              </Text>
            </View>
          </View>
        </Pressable>

        <Pressable onPress={() => onChange('ai-product')}>
          <View style={[styles.option, value === 'ai-product' && styles.optionSelected]}>
            <View style={[styles.iconContainer,value === 'ai-product' && styles.iconContainerSelected,]} >
              <Ionicons name="barcode-outline" size={20} color={value === 'ai-product' ? 'white' : 'rgb(108, 99, 255)'}/>
            </View>

            <View style={{ marginLeft: 12 }}>
              <Text
                style={[ styles.choiceText, value === 'ai-product' && { color: 'rgb(108, 99, 255)' },]} >
                Generate with AI (brand & SKU)
              </Text>
              <Text style={styles.descriptionText}>
                Use brand and product code
              </Text>
            </View>
          </View>
        </Pressable>
      </View>
    </>
  );
}
