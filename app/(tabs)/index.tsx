import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Text,
  Button,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Tabs() {
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    AsyncStorage.getItem("userId").then(setUserId);
  }, []);

  const cameraRef = useRef<any>(null);
  const insets = useSafeAreaInsets();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [mode, setMode] = useState<"food" | "receipt">("food");
  const [loading, setLoading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const API_BASE_URL = "http://140.104.36.1:8000";

  // --- NEW: prompt state ---
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [isUncertain, setIsUncertain] = useState(false);
  const [detectedName, setDetectedName] = useState<string | null>(null);
  const [currentPhoto, setCurrentPhoto] = useState<{ uri: string } | null>(null);
  // --- --- --- --- --- --- ---

  const toggleMode = () => {
    setMode((prev) => (prev === "food" ? "receipt" : "food"));
  };

  const uploadConfirmedFood = async (finalName: string) => {
    if (!currentPhoto) return;

    const uploadEndpoint = `/food/upload`;
    const uploadBody = {
      file_url: currentPhoto.uri,
      mode,
      userId: userId ?? "1",
      food_name: finalName,
    };

    try {
      const uploadRes = await fetch(`${API_BASE_URL}${uploadEndpoint}`, {
        method: "POST",
        body: JSON.stringify(uploadBody),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const uploadData = await uploadRes.json();

      if (uploadRes.ok && uploadData.success === true) {
        Alert.alert("Upload successful", uploadData.message || "Nutritional info saved.");
      } else {
        Alert.alert("Upload failed", JSON.stringify(uploadData, null, 2));
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Network Error", "Check server connection or IP address");
    } finally {
      setIsPromptOpen(false);
      setPromptText("");
      setCurrentPhoto(null);
      setDetectedName(null);
    }
  };

  const takePicture = async () => {
    if (loading) return;

    try {
      if (!cameraRef.current) {
        Alert.alert("Camera not ready");
        return;
      }

      setLoading(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });

      if (!photo?.uri) {
        setLoading(false);
        Alert.alert("Error", "No photo captured");
        return;
      }

      setPhotoUri(photo.uri);
      setCurrentPhoto(photo);

      const formData = new FormData();
      formData.append("file", {
        uri: photo.uri,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);
      formData.append("mode", mode);
      formData.append("userId", userId ?? "");

      const classifyEndpoint = `/food`;

      const response = await fetch(`${API_BASE_URL}${classifyEndpoint}`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.status === "success" && data.category) {
        const detected = data.category;
        setDetectedName(detected);
        setIsUncertain(false);
        setIsPromptOpen(true); // instead of Alert.prompt
      } else if (response.ok && data.status === "uncertain") {
        setIsUncertain(true);
        setIsPromptOpen(true); // instead of Alert.prompt
      } else {
        Alert.alert("Server Error", JSON.stringify(data, null, 2));
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Network Error", "Check server connection or IP address");
    } finally {
      setLoading(false);
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

      {isPromptOpen && (
        <View style={styles.promptOverlay}>
          <Text style={styles.promptTitle}>
            {isUncertain ? "Uncertain result" : `Confirm item`}
          </Text>
          <Text style={styles.promptMessage}>
            {isUncertain
              ? "We could not clearly identify the item. Please describe it below."
              : `Our system thinks this is: "${detectedName}"\nIs this correct?`}
          </Text>

          <TextInput
            style={styles.promptInput}
            value={promptText}
            onChangeText={setPromptText}
            placeholder={isUncertain ? "Describe the item..." : "Edit or confirm name..."}
            autoFocus
            onSubmitEditing={() => {
              const finalName = promptText.trim() || detectedName || "";
              if (!finalName) {
                Alert.alert("Invalid input", "Please enter a valid food name.");
                return;
              }
              uploadConfirmedFood(finalName);
            }}
          />

          <View style={styles.promptButtons}>
            <Button title="Cancel" onPress={() => setIsPromptOpen(false)} />
            <Button
              title="Confirm"
              onPress={() => {
                const finalName = promptText.trim() || detectedName || "";
                if (!finalName) {
                  Alert.alert("Invalid input", "Please enter a valid food name.");
                  return;
                }
                uploadConfirmedFood(finalName);
              }}
            />
          </View>
        </View>
      )}

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
    padding: 20,
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
    borderColor: "white",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // --- NEW styles for prompt ---
  promptOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginBottom: 6,
  },
  promptMessage: {
    fontSize: 14,
    color: "white",
    textAlign: "center",
    marginBottom: 12,
  },
  promptInput: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    fontSize: 15,
  },
  promptButtons: {
    flexDirection: "row",
    gap: 12,
  },
});