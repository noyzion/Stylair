import { Image } from 'expo-image';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';



export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <Image source={require('@/assets/images/logoShirt.png')} style={styles.backgroundIcon} />

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 50,
    alignItems: 'center',
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
    opacity: 0.4,
    width: 430,
    height: 450,
    alignSelf: 'center',
  },
  buttonsArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    gap: 10,
  },
  actionButton: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 5,
    borderColor: 'rgba(0, 0, 0, 0.54)',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  actionButtonText: {
    fontFamily: 'Manrope-Regular',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '600',
  },  
  
});

