import { View, Text, Pressable, Modal, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../assets/styles/AddItemScreen.styles';
import { Category, Style, Season, STYLES, SEASONS } from '../../app/(tabs)/addItemScreen';
import { CategoryModal } from './CategoryModal';

type Props = {
  category: Category | null;
  subCategory: string;
  color: string;
  colors: string[];
  stylesSelected: Style[];
  seasonsSelected: Season[];
  touched: { category: boolean; color: boolean };
  isCategoryOpen: boolean;
  tempCategory: Category | null;

  setCategory: (v: Category | null) => void;
  setSubCategory: (v: string) => void;
  setColor: (v: string) => void;
  setColors: React.Dispatch<React.SetStateAction<string[]>>;
  setStylesSelected: React.Dispatch<React.SetStateAction<Style[]>>;
  setSeasonsSelected: React.Dispatch<React.SetStateAction<Season[]>>;
  setTouched: React.Dispatch<
    React.SetStateAction<{ image: boolean; category: boolean; color: boolean }>
  >;
  setIsCategoryOpen: (v: boolean) => void;
  setTempCategory: (v: Category | null) => void;

  toggleValue: <T>(
    value: T,
    list: T[],
    setList: React.Dispatch<React.SetStateAction<T[]>>
  ) => void;

  hasColor: boolean;
};

export function ManualForm(props: Props) {
  const {
    category,
    subCategory,
    color,
    colors,
    stylesSelected,
    seasonsSelected,
    touched,
    isCategoryOpen,
    tempCategory,
    setCategory,
    setSubCategory,
    setColor,
    setColors,
    setStylesSelected,
    setSeasonsSelected,
    setTouched,
    setIsCategoryOpen,
    setTempCategory,
    toggleValue,
    hasColor,
  } = props;

  return (
    <View style={styles.manualFormContainer}>
            
    <Text style={styles.formLabel}>Category *</Text>
    <Pressable onPress={() => {setTempCategory(category); setIsCategoryOpen(true)}}>
        <View style={styles.inputBox}>
          <Text style={{ color: category ? '#111' : '#999' }}>
            {category || 'Select a category'}
          </Text>
        </View>
      </Pressable>
      {touched.category && !category && (<Text style={styles.errorText}>Category is required</Text>)}
      <CategoryModal visible={isCategoryOpen} value={tempCategory} onChange={setTempCategory} onClose={() => setIsCategoryOpen(false)}
            onConfirm={() => {setCategory(tempCategory); 
                              setTouched(prev => ({ ...prev, category: true }));
                              setIsCategoryOpen(false);
                            }}/>


    <Text style={styles.formLabel}>Sub-Category (optional)</Text>
      <View style={styles.inputBox}> 
        <TextInput value={subCategory} onChangeText={setSubCategory} placeholder="e.g T-shirt, Jeans, Sneakers" style={{ padding:0}}/>
      </View>

    <Text style={styles.formLabel}>Color *</Text>
      <View style={[styles.inputBox, touched.color && !color && styles.inputError,]}>
      <TextInput value={color} onChangeText={setColor} placeholder="e.g Blue"/>
      </View>
      <Pressable 
        disabled={!color.trim()} 
        onPress={() => { 
          if (!color.trim()) return;
          setColors(prev =>
            prev.includes(color.toLowerCase())
              ? prev
              : [...prev, color.toLowerCase()]
          );
          setColor('');
        }}
        style={[styles.addColorStyle, !color.trim() && { opacity: 0.4 }]}>
        <Ionicons name="add-circle-outline" size={18} color="white" />
        <Text style={{color: 'white',fontWeight: '600',marginLeft: 6, }}>Add Color </Text>
      </Pressable>
      <View style={styles.chipsRow}>
        {colors.map(c => (
          <View key={c} style={styles.colorChip}>
            <Text style={styles.colorChipText}>{c}</Text>
            <Pressable onPress={() => setColors(prev => prev.filter(x => x !== c))} hitSlop={8}>
              <Ionicons name="close" size={14} color="#666" />
            </Pressable>
          </View>
        ))}
      </View>
      {touched.color && !hasColor && (<Text style={styles.errorText}>Color is required</Text>)}

      <Text style={styles.formLabel}>Style</Text>
      <View style={styles.chipsRow}>
        {STYLES.map(st => {const selected = stylesSelected.includes(st);
          return (
            <Pressable key={st} onPress={() => toggleValue(st, stylesSelected, setStylesSelected)}>
              <View style={[styles.chip, selected && styles.chipSelected]}>
                <Text style={selected ? styles.chipTextSelected : styles.chipText}>
                  {st}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    
      <Text style={styles.formLabel}>Season</Text>
      <View style={styles.chipsRow}>
        {SEASONS.map(se => {
          const selected = seasonsSelected.includes(se);
          return (
            <Pressable key={se} onPress={() => toggleValue(se, seasonsSelected, setSeasonsSelected)}>
              <View style={[styles.chip, selected && styles.chipSelected]}>
                <Text style={selected ? styles.chipTextSelected : styles.chipText}>
                  {se}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
  </View>
  );
}
