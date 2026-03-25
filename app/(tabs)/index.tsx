import { Ionicons } from "@expo/vector-icons";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { useRef, useState } from "react";
import { Image } from "react-native";
import * as FileSystem from "expo-file-system";
import { CameraView, CameraViewHandle } from "../../components/MyCamera";

export default function Index() {
  const cameraRef = useRef<CameraViewHandle>(null);

  const [mode, setMode] = useState<"food" | "receipt">("food");

  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const toggleScanMode = () => {
    if (mode === "food")
      setMode("receipt");
    else
      setMode("food");
  }

  const takePicture = async () => { //Picture taking and uploading logic
    try {
      const photo = await cameraRef.current?.takePhoto();

      if (!photo?.uri) {
        Alert.alert("Error", "No photo captured");
        return;
      }

      setPhotoUri(photo.uri);
      Alert.alert("Photo Taken", photo.uri);

      const formData = new FormData();

      if (mode === "food") {
        formData.append("image", {
          uri: photo.uri,
          name: "photo.jpg",
          type: "image/jpeg",
        } as any);
      } else {
        formData.append("file", {
          uri: photo.uri,
          name: "photo.jpg",
          type: "image/jpeg",
        } as any);
      }
      
      if (mode === "food") { // - - - FOOD MODE - - -
        const response = await fetch(`https://localhost:8000/api/food?file_path=${photo.uri}`)
      } else { // - - - RECEIPT MODE  - - -
        // Call to backend
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Upload Error", String(err));
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} />

      {photoUri && (
        <Image source={{ uri: photoUri }} style={{ width: 100, height: 100 }} />
      )}
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
});