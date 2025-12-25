import { Image } from 'expo-image';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { StyleSheet, Pressable, View } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import WeatherBanner from '@/components/WeatherBanner';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export default function HomeScreen() {
  const [tempC, setTempC] = useState<number | null>(null);
  const [condition, setCondition] = useState<
    'sun' | 'cloud' | 'rain' | 'storm' | 'snow' | 'wind' | 'hot'
  >('sun');
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = loc.coords;

      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&current=temperature_2m,weather_code,wind_speed_10m,is_day&timezone=auto`;

      const res = await fetch(url);
      const data = await res.json();

      const isDay = data?.current?.is_day;
      setIsNight(isDay === 0);

      const t = data?.current?.temperature_2m;
      const code = data?.current?.weather_code;

      if (typeof t === 'number') {
        const rounded = Math.round(t);
        setTempC(rounded);

        if (rounded >= 30) {
          setCondition('hot');
          return;
        }
      }

      if (typeof code === 'number') setCondition(mapWeatherCodeToCondition(code));
    })();
  }, []);

  return (
    <LinearGradient
      colors={['#E6F0FF', '#F0E6FF', '#FFE3F1']}
      start={{ x: 0, y: 0.35 }}
      end={{ x: 1, y: 0.65 }}
      style={{ flex: 1 }}
    >
      <ThemedView style={styles.container}>
        <Image
          source={require('@/assets/images/Shirt.png')}
          style={styles.backgroundIcon}
        />

        <Image source={require('@/assets/images/logoName.png')} style={styles.logo} />

        <ThemedText type="subtitle" style={styles.subtitleContainer}>
          your digital closet
        </ThemedText>

        <WeatherBanner
          style={styles.wrap}
          tempC={tempC ?? 18}
          condition={condition}
          isNight={isNight}
        />

        <ThemedView style={styles.buttonsArea}>

        <Link href="/(tabs)/todayLook" asChild>
          <Pressable style={styles.firstActionButton}>
            <ThemedText style={styles.firstActionButtonText}>
              Choose today’s look
            </ThemedText>
          </Pressable>
        </Link>
          <Link href="/(tabs)/addItemScreen" asChild>
            <Pressable style={styles.firstActionButton}>
              <ThemedText style={styles.firstActionButtonText}>
                Add item to closet
              </ThemedText>
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

function mapWeatherCodeToCondition(code: number) {
  if (code === 0) return 'sun';
  if ([1, 2, 3].includes(code)) return 'cloud';
  if ([45, 48].includes(code)) return 'cloud';
  if ([51, 53, 55, 56, 57].includes(code)) return 'rain';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  if ([95, 96, 99].includes(code)) return 'storm';
  return 'cloud';
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
    top: 200,
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
    marginTop: 300,
    gap: 10,
  },
  actionButton: {
    width: 200,
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
  firstActionButton: {
    width: 250,
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
    fontFamily: 'Manrope-Regular',
    fontWeight: '700',
    fontSize: 20,
    color: '#1A1A1A',
  },
  firstActionButtonText: {
    fontFamily: 'Manrope-Regular',
    fontWeight: '700',
    fontSize: 22,
    color: '#1A1A1A',
  },  
  wrap: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 14,
  },
});
