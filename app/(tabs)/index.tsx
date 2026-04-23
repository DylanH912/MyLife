import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Text,
  Button,
  ActivityIndicator, // Added for the spinner
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Tabs() {
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    AsyncStorage.getItem("userId").then(setUserId);
}, []);
  const cameraRef = useRef<any>(null);
  const insets = useSafeAreaInsets();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [mode, setMode] = useState<"food" | "receipt">("food");
  const [loading, setLoading] = useState(false); // Added loading state
  const [permission, requestPermission] = useCameraPermissions();

  const API_BASE_URL = "http://140.104.38.113:8000";

  const toggleMode = () => {
    setMode((prev) => (prev === "food" ? "receipt" : "food"));
  };

  const takePicture = async () => {
    if (loading) return; // Prevent double taps

    try {
      if (!cameraRef.current) {
        Alert.alert("Camera not ready");
        return;
      }

      setLoading(true); // Start spinner

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5, // Compressed for faster upload
      });

      if (!photo?.uri) {
        setLoading(false);
        Alert.alert("Error", "No photo captured");
        return;
      }

      setPhotoUri(photo.uri);

      const formData = new FormData();
      formData.append("file", {
        uri: photo.uri,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);
      
      // Added this to satisfy your FastAPI backend requirements
      formData.append("mode", mode);
      formData.append("userId", userId ?? ""); // Pass the userId to the backend 

      const endpoint = mode === "food" ? "/food" : "/receipt";

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          `${mode === "food" ? "Food" : "Receipt"} Result`,
          JSON.stringify(data, null, 2)
        );
      } else {
        Alert.alert("Server Error", JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Network Error", "Check server connection or IP address");
    } finally {
      setLoading(false); // Stop spinner
    }
  };

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Camera permission required</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFill} ref={cameraRef} facing="back" />

      <View style={styles.controls}>
        {photoUri && (
          <Image
            source={{ uri: photoUri }}
            style={[styles.preview, { top: insets.top + 16 }]}
          />
        )}

        <TouchableOpacity 
          style={[styles.toggleButton, { top: insets.top + 16 }]} 
          onPress={toggleMode}
          disabled={loading}
        >
          <Ionicons
            name={mode === "food" ? "fast-food" : "receipt"}
            size={24}
            color={loading ? "#ccc" : "black"}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.cameraButton,
            { bottom: insets.bottom + 24 },
            loading && { backgroundColor: "#ddd" },
          ]} 
          onPress={takePicture}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="black" />
          ) : (
            <Ionicons name="camera" size={32} color="black" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  controls: { flex: 1, backgroundColor: "transparent" },
  cameraButton: {
    position: "absolute",
    alignSelf: "center",
    padding: 20, // Bigger hit area
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 50,
  },
  toggleButton: {
    position: "absolute",
    right: 20,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 30,
  },
  preview: {
    position: "absolute",
    left: 20,
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white'
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
