import { useState } from "react";
import { TextInput, View, StyleSheet, Pressable, Platform, KeyboardAvoidingView, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NewPassword() {
    const [password, setPassword] = useState("");
    const [verifyPassword, setVerifyPassword] = useState("");

    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <LinearGradient colors={["#E6F0FF", "#F0E6FF", "#FFE3F1"]}
            start={{ x: 0, y: 0.35 }}
            end={{ x: 1, y: 0.65 }}
            style={styles.gradientContainer}>
            <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
                <View style={styles.logoContainer}>
                    <Image source={require("@/assets/images/logoName.png")} style={styles.logo}/>
                </View>
            </View>
            <Image source={require("@/assets/images/Shirt.png")} style={styles.backgroundIcon}/>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1 }}>
                    <View style={{ height: 50 }} />
                    <ThemedView style={styles.content}>
                        <ThemedText style={styles.title}>New Password</ThemedText>
                        <ThemedText style={styles.subtitle}>enter your new password</ThemedText>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
                            <TextInput style={styles.input}
                                placeholder="password" placeholderTextColor="#999" value={password}
                                onChangeText={setPassword} keyboardType="numeric" autoCapitalize="none" />
                            
                        </View>    
                        <View style={styles.inputContainer}>
                          <Ionicons name="refresh-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
                            <TextInput style={styles.input}
                                placeholder="verify new password" placeholderTextColor="#999" value={verifyPassword}
                                onChangeText={setVerifyPassword} keyboardType="numeric" autoCapitalize="none" />
                        </View>
                        <Pressable style={styles.loginButton} onPress={() => router.push("/auth/login")}>
                            <BlurView intensity={75} tint="light" style={StyleSheet.absoluteFillObject} />
                            <LinearGradient
                                colors={['rgba(108, 99, 255, 0.8)', 'rgba(139, 92, 246, 0.9)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFillObject} />
                            <ThemedText style={styles.loginButtonText}>Submit</ThemedText>
                        </Pressable>
                    </ThemedView>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradientContainer: {
        flex: 1,
    },
    headerContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 0,
        zIndex: 10,
    },
    container: {
        flex: 1,
    },
    backgroundIcon: {
        position: "absolute",
        top: 190,
        opacity: 0.3,
        width: 420,
        height: 480,
        alignSelf: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 10 },
        zIndex: 0,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 40,
        justifyContent: "center",
    },
    content: {
        backgroundColor: "transparent",
        width: "100%",
        maxWidth: 500,
        alignSelf: "center",
        alignItems: "center",
    },
    logoContainer: {
        alignItems: "center",
    },
    logo: {
        width: 150,
        height: 75,
        resizeMode: "contain",
    },
    title: {
        fontSize: 32,
        fontWeight: "500",
        color: "#1A1A1A",
        textAlign: "center",
        marginTop: 10,
        marginBottom: 4,
        paddingTop: 10,
        fontFamily: "Manrope-Regular",
    },
    subtitle: {
        fontSize: 16,
        fontWeight: "400",
        color: "#666",
        textAlign: "center",
        marginBottom: 24,
        fontFamily: "Manrope-Regular",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.6)",
        borderRadius: 16,
        marginBottom: 8,
        paddingHorizontal: 16,
        height: 56,
        width: "100%",
        borderWidth: 1,
        borderColor: "rgba(108, 99, 255, 0.2)",
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
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#1A1A1A",
        fontFamily: "Manrope-Regular",
    },
    loginButton: {
        paddingVertical: 14,
        paddingHorizontal: 22,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 8,
        marginBottom: 12,
        width: "100%",
        overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowColor: "#8B5CF6",
                shadowOpacity: 0.2,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
            },
            android: {
                elevation: 4,
            },
        }),
    },
    loginButtonText: {
        fontSize: 15,
        fontWeight: "500",
        color: "white",
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        marginTop: 4,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#6C63FF",
        marginLeft: 8,
        fontFamily: "Manrope-Regular",
    },
    forgotPasswordButton: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-end",
        marginTop: -8,
        marginBottom: 2,
        paddingVertical: 4,
    },
    forgotPasswordButtonText: {
        fontSize: 14,
        fontWeight: "400",
        color: "#6C63FF",
        fontFamily: "Manrope-Regular",
    },
});

