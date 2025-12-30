import { useState } from "react";
import { TextInput, View, StyleSheet, Pressable, Platform, KeyboardAvoidingView, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CognitoUser } from "amazon-cognito-identity-js";
import { userPool } from "@/services/auth/cognito";

export default function NewPassword() {
    const { email: emailParam, code: codeParam } = useLocalSearchParams<{ email: string; code: string }>();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleSubmit = () => {
        if (!password || !confirmPassword) {
            setError("Please enter both passwords");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        if (!emailParam || !codeParam) {
            setError("Email and code are required");
            return;
        }

        setIsLoading(true);
        setError("");

        const cognitoUser = new CognitoUser({
            Username: emailParam as string,
            Pool: userPool,
        });

        cognitoUser.confirmPassword(codeParam as string, password, {
            onSuccess: () => {
                setIsLoading(false);
                router.push("/(tabs)/auth/login");
            },
            onFailure: (err) => {
                setIsLoading(false);
                setError(err.message || "Failed to reset password");
            },
        });
    };

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
                                placeholder="New Password" placeholderTextColor="#999" value={password}
                                onChangeText={(v) => {
                                    setPassword(v);
                                    setError("");
                                }} secureTextEntry autoCapitalize="none" />
                            
                        </View>    
                        <View style={styles.inputContainer}>
                          <Ionicons name="refresh-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
                            <TextInput style={styles.input}
                                placeholder="Confirm Password" placeholderTextColor="#999" value={confirmPassword}
                                onChangeText={(v) => {
                                    setConfirmPassword(v);
                                    setError("");
                                }} secureTextEntry autoCapitalize="none" />
                        </View>

                        {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

                        <Pressable 
                            style={[styles.loginButton, (isLoading || !password || !confirmPassword) && styles.disabledButton]} 
                            onPress={handleSubmit}
                            disabled={isLoading || !password || !confirmPassword}>
                            <BlurView intensity={75} tint="light" style={StyleSheet.absoluteFillObject} />
                            <LinearGradient
                                colors={['rgba(108, 99, 255, 0.8)', 'rgba(139, 92, 246, 0.9)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFillObject} />
                            <ThemedText style={styles.loginButtonText}>
                                {isLoading ? "Resetting..." : "Submit"}
                            </ThemedText>
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
    disabledButton: {
        opacity: 0.6,
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
    errorText: {
        color: "#FF3B30",
        fontSize: 14,
        marginTop: 8,
        marginBottom: 8,
        textAlign: "center",
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

