import { View, Button } from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Button
        title="Add item"
        onPress={() => router.push('/addItemScreen')}
      />
    </View>
  );
}
