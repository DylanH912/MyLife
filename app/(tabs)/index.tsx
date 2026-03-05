import { Ionicons } from "@expo/vector-icons";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CameraScreen from "./camera";
import { CameraView } from './camera/CameraView';
import React, { useRef } from "react";

export default function Index() {
  const cameraRef = useRef<any>(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePhoto({
        flash: "off",
      });

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
        justifyContent: "center",
        alignItems: "center",
    },

    text: {
        fontSize: 24,
    },

    cameraButton: {
        position: "absolute",
        bottom: 40,          // distance from bottom
        alignSelf: "center", // centers horizontally

        width: 70,
        height: 70,
        borderRadius: 40,

        backgroundColor: "#ffffffff", // Snapchat yellow
        outlineColor: "Black",
        outlineWidth: 3,

        justifyContent: "center",
        alignItems: "center",
    },

});