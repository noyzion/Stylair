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
import { userPool } from "@/services/auth/cognito";
import { CognitoUserAttribute, CognitoUser ,AuthenticationDetails} from "amazon-cognito-identity-js";

export default function SignUp() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const handleSignUp = () => {
        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
          }
          setIsLoading(true);
          setError("");
            const fullName = `${firstName} ${lastName}`.trim();
            const attributeList = [
            new CognitoUserAttribute({ Name: "name", Value: fullName }),
            new CognitoUserAttribute({ Name: "given_name", Value: firstName }),
            new CognitoUserAttribute({ Name: "family_name", Value: lastName }),
            new CognitoUserAttribute({ Name: "email", Value: email })
          ];
          userPool.signUp(email, password, attributeList, [], (err, result) => {
            setIsLoading(false);
            
            if (err) {
              setError(err.message || "Sign up failed");
              return;
            }
            router.push(`/(tabs)/auth/verify-email?email=${email}`);
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
                        <ThemedText style={styles.title}>Create Account</ThemedText>
                        <ThemedText style={styles.subtitle}>Sign up to get started</ThemedText>
                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
                            <TextInput style={styles.input}
                                placeholder="First Name" placeholderTextColor="#999" value={firstName}
                                onChangeText={setFirstName} autoCapitalize="words" />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
                            <TextInput style={styles.input}
                                placeholder="Last Name" placeholderTextColor="#999" value={lastName}
                                onChangeText={setLastName} autoCapitalize="words" />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
                            <TextInput style={styles.input}
                                placeholder="Email" placeholderTextColor="#999" value={email}
                                onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
                            <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#999" value={password}
                                onChangeText={setPassword} secureTextEntry autoCapitalize="none"/>
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="refresh-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
                            <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor="#999" value={confirmPassword}
                                onChangeText={setConfirmPassword} secureTextEntry autoCapitalize="none"/>
                        </View>

                        {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

                        <Pressable 
                            style={[styles.loginButton, (isLoading || !firstName || !lastName || !email || !password || !confirmPassword) && styles.disabledButton]} 
                            onPress={handleSignUp}
                            disabled={isLoading || !firstName || !lastName || !email || !password || !confirmPassword}>
                            <BlurView intensity={75} tint="light" style={StyleSheet.absoluteFillObject} />
                            <LinearGradient
                                colors={['rgba(108, 99, 255, 0.8)', 'rgba(139, 92, 246, 0.9)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFillObject} />
                            <ThemedText style={styles.loginButtonText}>
                                {isLoading ? "Signing up..." : "Sign Up"}
                            </ThemedText>
                        </Pressable>
                        <Pressable onPress={() => router.push("/(tabs)/auth/login")} style={styles.backButton}>
                            <ThemedText style={styles.backButtonText}>Already have an account? Sign in </ThemedText>
                            <Ionicons name="arrow-forward-outline" size={20} color="#6C63FF" />
                        </Pressable>
                        <Pressable onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back-outline" size={20} color="#6C63FF" />
                            <ThemedText style={styles.backButtonText}>Back</ThemedText>
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
        paddingBottom: 10,
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
        marginTop: 15,
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
    errorText: {
        color: "#FF3B30",
        fontSize: 14,
        marginTop: 8,
        marginBottom: 8,
        textAlign: "center",
        fontFamily: "Manrope-Regular",
    },
    disabledButton: {
        opacity: 0.6,
    },
});

