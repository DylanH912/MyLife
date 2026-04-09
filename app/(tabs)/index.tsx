import { Ionicons } from "@expo/vector-icons";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { useRef, useState } from "react";
import { Image } from "react-native";
import * as FileSystem from "expo-file-system";
import { CameraView, CameraViewHandle } from "../../components/MyCamera";

export default function Tabs() {
  const cameraRef = useRef<CameraViewHandle | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [mode, setMode] = useState<"food" | "receipt">("food");
  //const EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";
  const EXPO_PUBLIC_API_URL = "http://192.168.68.54:8000"; // CHANGE: Use your machine's local IP address and port where FastAPI is running

  const toggleMode = () => {
    setMode((prev) => (prev === "food" ? "receipt" : "food"));
  }

  const takePicture = async () => {
    try {
      const photo = await cameraRef.current?.takePhoto();

      if (!photo?.uri) {
        Alert.alert("Error", "No photo captured");
        return;
      }

      setPhotoUri(photo.uri);

      // CHANGE 1: Create FormData to hold the actual image file
      const formData = new FormData();
      
      // The key ("file") must match the variable name in your FastAPI function
      formData.append("file", {
        uri: photo.uri,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);

      // CHANGE 2: Use POST method and send the formData as the body
      // Also fixed the endpoints to match your API (/food and /receipt)
      const endpoint = mode === "food" ? "/food" : "/receipt";
      
      const response = await fetch(`${EXPO_PUBLIC_API_URL}${endpoint}`, {
        method: "POST",
        body: formData,
        headers: {
          "Accept": "application/json",
          // Note: DO NOT set 'Content-Type': 'multipart/form-data' manually. 
          // fetch will do it automatically with the correct "boundary".
        },
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert(`${mode === "food" ? "Food" : "Receipt"} Result`, JSON.stringify(data));
      } else {
        const errorText = await response.text();
        Alert.alert("Server Error", errorText);
      }

    } catch (err) {
      console.error(err);
      Alert.alert("Network Error", "Check if your API is running and the IP address is correct.");
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} />

      {photoUri && (
        <Image source={{ uri: photoUri }} style={{ width: 100, height: 100 }} />
      )}

      <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
        <Ionicons
          name={mode === "food" ? "fast-food" : "receipt"}
          size={24}
          color="black"
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.cameraButton} onPress={takePicture}>
        <Ionicons name="camera" size={32} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  cameraButton: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 40,
  },
  toggleButton: {
    position: "absolute",
    top: 60,
    right: 20,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 30,
  },

});