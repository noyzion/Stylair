import { useEffect, useState, useRef, useCallback } from "react";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Location from "expo-location";
import { Link, useRouter, useFocusEffect} from "expo-router";
import { Pressable, StyleSheet, Platform, View, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import WeatherBanner from "@/components/WeatherBanner";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getCurrentUser, getUserName, isAuthenticated, logout } from "@/services/auth/auth.service";

export default function HomeScreen() {
  const router = useRouter();
  const [tempC, setTempC] = useState<number | null>(null);
  const [condition, setCondition] = useState<
    "sun" | "cloud" | "rain" | "storm" | "snow" | "wind" | "hot"
  >("sun");
  const [isNight, setIsNight] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Animation values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(-20)).current;
  const backgroundIconRotation = useRef(new Animated.Value(0)).current;

  const checkAuthStatus = useCallback(async () => {
    const isAuth = await isAuthenticated();
    setIsLoggedIn(isAuth);
    if (isAuth) {
      const userName = await getUserName();
      setUserName(userName);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Re-check auth status when the screen gains focus (e.g., after login)
  useFocusEffect(
    useCallback(() => {
      checkAuthStatus();
    }, [checkAuthStatus])
  );

  const handleLogout = useCallback(async () => {
    await logout();
    setIsLoggedIn(false);
    setUserName(null);
    router.push("/(tabs)/auth/login");
  }, [router]);

  useEffect(() => {
    // Logo animation
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(logoTranslateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Background icon gentle sway - subtle oscillation
    Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundIconRotation, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundIconRotation, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

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

      if (typeof t === "number") {
        const rounded = Math.round(t);
        setTempC(rounded);

        if (rounded >= 30) {
          setCondition("hot");
          return;
        }
      }

      if (typeof code === "number") {
        setCondition(mapWeatherCodeToCondition(code));
      }
    })();
  }, []);

  return (
    <LinearGradient
      colors={["#E6F0FF", "#F0E6FF", "#FFE3F1"]}
      start={{ x: 0, y: 0.35 }}
      end={{ x: 1, y: 0.65 }}
      style={styles.gradientContainer}>
       {isLoggedIn ? (
          <Pressable style={styles.personButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={26} color="#1A1A1A" />
          </Pressable>
        ) : (
          <Pressable style={styles.personButton} onPress={() => router.push("/(tabs)/auth/login")}>
            <Ionicons name="log-in-outline" size={26} color="#1A1A1A" />
          </Pressable>
        )}
      <ThemedView style={styles.container}>
        <Animated.Image
          source={require("@/assets/images/Shirt.png")}
          style={[
            styles.backgroundIcon,
            {
              transform: [
                {
                  rotate: backgroundIconRotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["-5deg", "5deg"],
                  }),
                },
              ],
            },
          ]}
        />

        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ translateY: logoTranslateY }],
          }}
        >
          <Image
            source={require("@/assets/images/logoName.png")}
            style={styles.logo}
          />
        </Animated.View>

        <ThemedText type="subtitle" style={styles.subtitleContainer}>
        {isLoggedIn && userName
          ? `Welcome back, ${userName}`
          : "your digital closet"}
      </ThemedText>



        <WeatherBanner
          style={styles.wrap}
          tempC={tempC ?? 18}
          condition={condition}
          isNight={isNight}
        />

        <ThemedView style={styles.buttonsArea}>
          <View style={styles.chooseWrapContainer}>
            {/* Halo effect - soft glow around the button */}
            <LinearGradient
              colors={[
                "rgba(240, 230, 255, 0.15)",
                "rgba(200, 180, 255, 0.25)",
                "rgba(240, 230, 255, 0.15)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.halo}
            />
            <Link href="/(tabs)/chooseTodaysLook" asChild>
              <Pressable style={styles.chooseWrap}>
                <BlurView
                  intensity={75}
                  tint="light"
                  style={StyleSheet.absoluteFillObject}
                />
                <LinearGradient
                  colors={[
                    "rgba(255, 255, 255, 0.30)",
                    "rgba(240, 230, 255, 0.65)",
                    "rgba(255, 255, 255, 0.30)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.chooseButtonContent}>
                  <ThemedText style={styles.chooseText}>
                    Choose today's look
                  </ThemedText>
                </View>
              </Pressable>
            </Link>
          </View>

          <ThemedView style={styles.otherButtonsArea}>
            <Link href="/(tabs)/addItemScreen" asChild>
              <Pressable style={styles.actionButton}>
                <Ionicons name="add-circle-outline" size={20} color="#4A4A4A" />
                <ThemedText style={styles.actionButtonText}>
                  Add item
                </ThemedText>
              </Pressable>
            </Link>

            <Link href="/(tabs)/myClosetScreen" asChild>
              <Pressable style={styles.actionButton}>
                <Ionicons name="shirt-outline" size={20} color="#4A4A4A" />
                <ThemedText style={styles.actionButtonText}>
                  My closet
                </ThemedText>
              </Pressable>
            </Link>

            <Link href="/(tabs)/ArchiveScreen" asChild>
              <Pressable style={styles.actionButton}>
                <Ionicons name="archive-outline" size={20} color="#4A4A4A" />
                <ThemedText style={styles.actionButtonText}>Archive</ThemedText>
              </Pressable>
            </Link>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </LinearGradient>
  );
}

function mapWeatherCodeToCondition(code: number) {
  if (code === 0) return "sun";
  if ([1, 2, 3].includes(code)) return "cloud";
  if ([45, 48].includes(code)) return "cloud";
  if ([51, 53, 55, 56, 57].includes(code)) return "rain";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([95, 96, 99].includes(code)) return "storm";
  return "cloud";
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 60,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  subtitleContainer: {
    fontFamily: "Manrope-Regular",
    fontWeight: "700",
    fontSize: 20,
    position: "absolute",
    top: 140,
    alignSelf: "center",
    color: "#1A1A1A",
    textAlign: "center",
    width: "90%",
  },
  logo: {
    width: 200,
    height: 100,
    alignSelf: "center",
  },
  backgroundIcon: {
    position: "absolute",
    top: 190,
    opacity: 1,
    width: 420,
    height: 480,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
  },
  wrap: {
    alignItems: "center",
    position: "absolute",
    top: 165,
    marginBottom: 14,
    marginLeft: -20,
  },
  buttonsArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    marginTop: 420,
    gap: 12,
    width: "100%",
  },
  otherButtonsArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    alignItems: "center",
    gap: 10,
    width: 400,
    alignSelf: "center",
  },
  actionButton: {
    flex: 1,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.30)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    gap: 0,
    paddingVertical: 8,
    paddingHorizontal: 4,
    // Minimal shadow for static buttons
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  actionButtonText: {
    fontFamily: "Manrope-Regular",
    fontWeight: "600",
    fontSize: 15,
    color: "#1A1A1A",
    textAlign: "center",
    marginTop: 2,
    marginLeft: 4,
  },
  chooseWrapContainer: {
    width: 420,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    position: "relative",
  },
  halo: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 40,
    opacity: 0.6,
  },
  chooseWrap: {
    width: 400,
    height: 68,
    borderRadius: 34,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: "rgba(240, 230, 255, 0.35)",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.25)",
    // Strong shadow only for the hero button
    ...Platform.select({
      ios: {
        shadowColor: "#8B5CF6",
        shadowOpacity: 0.6,
        shadowRadius: 40,
        shadowOffset: { width: 0, height: 20 },
      },
      android: {
        elevation: 16,
        shadowColor: "#8B5CF6",
      },
    }),
  },
  chooseButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  chooseIcon: {
    marginTop: -2,
  },
  chooseText: {
    fontFamily: "Manrope-Regular",
    fontWeight: "900",
    fontSize: 23,
    color: "#1A1A1A",
    textAlign: "center",
    letterSpacing: 0.4,
    lineHeight: 27,
    includeFontPadding: false,
  },
  homeButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  personButton:
  {
    position: "absolute",
    top: 75,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    opacity: 0.8,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
