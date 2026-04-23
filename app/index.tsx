import React, { useState } from "react";
import {
  Text,
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const API_BASE = "http://140.104.37.131:8000";

async function apiRegister(email: string, password: string) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 5000);
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    signal: controller.signal,
  });
  clearTimeout(id);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail ?? "Registration failed.");
  return data;
}

async function apiLogin(email: string, password: string) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 5000);
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    signal: controller.signal,
  });
  clearTimeout(id);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail ?? "Login failed.");
  return data;
}

const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

type Mode = "login" | "register";

function Field({
  label,
  value,
  onChange,
  placeholder,
  secure,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  secure?: boolean;
  error?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#7A869A"
        secureTextEntry={secure}
        autoCapitalize="none"
        keyboardType={label === "Email" ? "email-address" : "default"}
        style={[
          fieldStyles.input,
          focused && fieldStyles.inputFocused,
          !!error && fieldStyles.inputError,
        ]}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {error ? <Text style={fieldStyles.errorText}>{error}</Text> : null}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#355070",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F4F7FB",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#14213D",
    borderWidth: 1.5,
    borderColor: "#E1E8F2",
  },
  inputFocused: {
    borderColor: "#4E6FAE",
    backgroundColor: "#FFFFFF",
  },
  inputError: {
    borderColor: "#D9534F",
  },
  errorText: {
    marginTop: 5,
    fontSize: 12,
    color: "#D9534F",
    fontWeight: "600",
  },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirm?: string;
  }>({});

  const validate = () => {
    const next: typeof errors = {};
    if (!isValidEmail(email)) next.email = "Enter a valid email address.";
    if (password.length < 8) next.password = "Password must be at least 8 characters.";
    if (mode === "register" && password !== confirm)
      next.confirm = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === "register") {
        await apiRegister(email.trim(), password);
        Alert.alert("Account created!", "You can now log in.");
        setMode("login");
        setPassword("");
        setConfirm("");
      } else {
        const result = await apiLogin(email.trim(), password);
        const idNumber = JSON.stringify(result);
        Alert.alert("Logged in! Id: ", idNumber);
        await AsyncStorage.setItem("userId", idNumber);
        router.replace({
          pathname: "/(tabs)"
        });
      }
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setErrors({});
    setPassword("");
    setConfirm("");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Hero ── */}
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>
            {mode === "login" ? "Welcome back" : "Get started"}
          </Text>
          <Text style={styles.header}>
            {mode === "login" ? "Log in to your account" : "Create your account"}
          </Text>
          <Text style={styles.description}>
            {mode === "login"
              ? "Track your nutrition, monitor your weight, and stay consistent with your health goals."
              : "Join to start logging meals, tracking progress, and building better habits."}
          </Text>
        </View>

        {/* ── Card ── */}
        <View style={styles.card}>
          <Field
            label="Email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            error={errors.email}
          />
          <Field
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            secure
            error={errors.password}
          />
          {mode === "register" && (
            <Field
              label="Confirm Password"
              value={confirm}
              onChange={setConfirm}
              placeholder="••••••••"
              secure
              error={errors.confirm}
            />
          )}

          <Pressable
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {mode === "login" ? "Log In" : "Create Account"}
              </Text>
            )}
          </Pressable>
        </View>

        {/* ── Divider + Toggle ── */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable style={styles.switchCard} onPress={switchMode}>
          <Text style={styles.switchText}>
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <Text style={styles.switchLink}>
              {mode === "login" ? "Sign up" : "Log in"}
            </Text>
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  hero: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4E6FAE",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  header: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    color: "#14213D",
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#5C677D",
    marginTop: 10,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E6ECF5",
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: "#14213D",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E1E8F2",
  },
  dividerText: {
    fontSize: 13,
    color: "#7A869A",
    fontWeight: "600",
  },
  switchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E6ECF5",
    alignItems: "center",
    marginBottom: 20,
  },
  switchText: {
    fontSize: 14,
    color: "#5C677D",
    fontWeight: "500",
  },
  switchLink: {
    color: "#4E6FAE",
    fontWeight: "800",
  },
  trustRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  trustPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF1FB",
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: "#D8E3F4",
  },
  trustDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#1F8A5B",
  },
  trustText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#355070",
  },
});
