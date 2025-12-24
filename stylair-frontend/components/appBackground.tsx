import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

export default function AppBackground({ children }) {
  return (
    <LinearGradient
      colors={['#EEF4FF', '#F5ECFF', '#FFF0F5']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >

      <View style={styles.glowLeft} />
      <View style={styles.glowRight} />

      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
