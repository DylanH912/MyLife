import { Ionicons } from "@expo/vector-icons";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CameraScreen from "./camera";
import { CameraView } from './camera/CameraView';

export default function Index() {
    const takePicture = () => {
        Alert.alert("Camera", "Picture Taken");
    };

    return (
        <View style={styles.container}>

            <View style={{flex: 1}}>
                <CameraView />
            </View>

            {/* Snapchat Style Camera Button */}
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