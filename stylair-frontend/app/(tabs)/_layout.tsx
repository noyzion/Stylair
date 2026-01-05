import { Tabs, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { isAuthenticated } from '@/services/auth/auth.service';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  // Check authentication status on mount and when segments change
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      // Check if we're in auth screens - segments will be ['(tabs)', 'auth', 'login'] etc.
      const inAuthGroup = segments.some(segment => segment === 'auth');
      
      // If not authenticated and not already in auth screens, redirect to login
      if (!authenticated && !inAuthGroup) {
        // Use push instead of replace to avoid navigation errors
        router.push('/(tabs)/auth/login'); // 👈 המסלול הנכון - הקבצים בתוך (tabs)
      }
      // If authenticated and in auth screens, redirect to home
      else if (authenticated && inAuthGroup) {
        router.replace('/(tabs)');
      }
    };

    // Add a small delay to ensure Tabs are fully initialized
    const timeoutId = setTimeout(() => {
      checkAuth();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [segments, router]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: { display: 'none' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: function({ color }) {
            return <IconSymbol size={28} name="house.fill" color={color} />;
          },
        }}
      />
      {/* Auth screens - hidden from tab bar but accessible via routing */}
      <Tabs.Screen
        name="auth/login"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="auth/sign-up"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="auth/forgot-password"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="auth/verify-email"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="auth/new-password"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
