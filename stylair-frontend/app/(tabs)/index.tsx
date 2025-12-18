import { Image } from 'expo-image';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Bubbles from '@/components/Bubbles';



export default function HomeScreen() {
  return (
    <LinearGradient
      colors={['#E6F0FF', '#F0E6FF', '#FFE3F1']}
      start={{ x: 0, y: 0.35 }}
      end={{ x: 1, y: 0.65 }}
      style={{ flex: 1 }}
    >
    <Bubbles />
    <ThemedView style={styles.container}>

      <Image source={require('@/assets/images/Shirt.png')} style={styles.backgroundIcon} />

      <Image source={require('@/assets/images/logoName.png')} style={styles.logo} />
      <ThemedText type="subtitle" style={styles.subtitleContainer}>your digital closet</ThemedText>
    
      <ThemedView style={styles.buttonsArea}>
       <Link href="/(tabs)/addItemScreen" asChild>
        <Pressable style={styles.actionButton}>
         <ThemedText style={styles.actionButtonText}>Add item to closet</ThemedText>
        </Pressable>
       </Link>

       <Link href="/closet" asChild>
        <Pressable style={styles.actionButton}>
         <ThemedText style={styles.actionButtonText}>My closet</ThemedText>
        </Pressable>
       </Link>

       <Link href="/archive" asChild>
        <Pressable style={styles.actionButton}>
         <ThemedText style={styles.actionButtonText}>Archive</ThemedText>
        </Pressable>
       </Link>
      </ThemedView>
    </ThemedView>
    </LinearGradient>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 50,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 50,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  subtitleContainer: {
    fontFamily: 'Manrope-Regular',
    fontWeight: '700',
    fontSize: 20,
    marginTop: -20,
  },
  logo: {
    width: 200,
    height: 100,
    alignSelf: 'center',
  },
  backgroundIcon: {
    position: 'absolute',
    top: 250,
    opacity: 1,
    width: 420,
    height: 480,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
  },
  buttonsArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    gap: 10,
  },
  actionButton: {
    width: 260,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },  
  glowLeft: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: '#CFE3FF',
    opacity: 0.45,
    top: 180,
    left: -220,
  },
  glowRight: {
    position: 'absolute',
    width: 520,
    height: 520,
    borderRadius: 260,
    backgroundColor: '#FFD6EB',
    opacity: 0.45,
    top: 140,
    right: -240,
  },  
  
});

