import React, { useMemo } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';

type WeatherBannerProps = {
    tempC?: number;
    condition?: 'sun' | 'cloud' | 'rain' | 'storm' | 'snow' | 'wind' | 'hot';
    style?: StyleProp<ViewStyle>;
    isNight?: boolean; // ✅ חדש
  };
  

function isWorkDay(date: Date) {
  // 0=Sunday ... 6=Saturday
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

function getDayLabel(date: Date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }  

function getIcon(condition: WeatherBannerProps['condition'], isNight: boolean) {
    switch (condition) {
      case 'rain':
        return '🌧️';
      case 'storm':
        return '⛈️';
      case 'snow':
        return '❄️';
      case 'wind':
        return '🌪️';
      case 'hot':
        return '🔥';
      case 'cloud':
        return isNight ? '☁️🌙' : '☁️';
      case 'sun':
      default:
        return isNight ? '🌙' : '☀️';
    }
  }
  

export default function WeatherBanner({
    tempC,
    condition = 'sun',
    style,
    isNight = false,
}: WeatherBannerProps) {
  const now = useMemo(() => new Date(), []);
  const temp = typeof tempC === 'number' ? tempC : 18; // MOCK
  const label = getDayLabel(now);
  const icon = getIcon(condition, isNight);

  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.row}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.mainText}>{temp}° • {label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 18,
  },
  mainText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#3A3A4A',
  },
  subText: {
    marginTop: 4,
    fontSize: 14,
    color: 'rgba(58,58,74,0.55)',
  },
});
