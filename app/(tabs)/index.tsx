import { Ionicons } from "@expo/vector-icons";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { useRef, useState } from "react";
import { Image } from "react-native";
import { CameraView, CameraViewHandle } from "../../components/MyCamera";

export default function Index() {
  const cameraRef = useRef<CameraViewHandle>(null);

  const [photoUri, setPhotoUri] = useState<string | null>(null);

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
      formData.append("image", {
        uri: photo.uri,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);

      //Can be replaced with loading the picture into a folder and uploading from there
      await fetch("https://your-api.com/upload", { // Replace with API endpoint
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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