import { Ionicons } from "@expo/vector-icons";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CameraScreen from "./camera";
import { CameraView } from './camera/CameraView';

export default function Index() {
  return (
    <View style={{ flex: 1, backgroundColor: "red" }}>
      <Text style={{ color: "white", fontSize: 30 }}>
        SCREEN IS RENDERING
      </Text>
    </View>
  );
}