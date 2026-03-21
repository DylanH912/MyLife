import { Ionicons } from "@expo/vector-icons";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { useRef, useState } from "react";
import { Image } from "react-native";
import * as FileSystem from "expo-file-system";
import { CameraView, CameraViewHandle } from "../../components/MyCamera";
import * as ImagePicker from "expo-image-picker";

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

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
      if (result.canceled) return;

      const asset = result.assets[0];

      if (!asset.uri) {
        Alert.alert("Error", "No image selected");
        return;
      }

      setPhotoUri(asset.uri);

      await uploadImage(asset.uri);
    } catch (err) {
      console.error(err);
      Alert.alert("Picker error", String(err));
    }
  };

  const uploadImage = async (uri: string) => {
    const formData = new FormData();
    if (mode === "food") {
      formData.append("image", {
        uri,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);
    } else {
      formData.append("file", {
        uri,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);
    }

    if (mode === "food") { // - - - FOOD MODE - - -
        //API KEYS
        //107f03cbca3c4968b0109fef8bc415be --szimmerm
        const API_KEY = "107f03cbca3c4968b0109fef8bc415be"; // Replace with your actual API key
        
        const resp = await fetch("https://api.spoonacular.com/food/images/analyze", { 
          method: "POST",
          body: formData,
          headers: { 
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${API_KEY}`,
          },
        });
      } else { // - - - RECEIPT MODE  - - -
        //API KEYS

        const API_KEY = "J9OzeFLbOirXCP9LoVWKRK6XpOFXGOS8AMVBYsa6WwJLqTN848kBC454r81Od5cT"; // Replace with your actual API key

        const resp = await fetch("https://api.tabscanner.com/api/2/process", {
          method: "POST",
          headers: {
            "X-API-Key": API_KEY,
          },
          body: formData,
        })

        console.log(resp);
      }
  }

  const takePicture = async () => {
  try {
    const photo = await cameraRef.current?.takePhoto();

    if (!photo?.uri) {
      Alert.alert("Error", "No photo captured");
      return;
    }

    setPhotoUri(photo.uri);

    await uploadImage(photo.uri);
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

      <TouchableOpacity style={[styles.cameraButton, { bottom: 100 }]} onPress={pickImage}>
  <Ionicons name="image" size={32} color="black" />
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