import { Ionicons } from "@expo/vector-icons";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { useRef } from "react";
import { CameraView, CameraViewHandle } from "../../components/MyCamera";

export default function Index() {
  const cameraRef = useRef<CameraViewHandle>(null);

  const takePicture = async () => {
    const photo = await cameraRef.current?.takePhoto();

    if (photo) {
      Alert.alert("Photo Taken", photo.path);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} />

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