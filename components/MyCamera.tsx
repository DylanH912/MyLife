import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState,} from "react";
import { StyleSheet, Text, View } from "react-native";
import { Camera, CameraPermissionStatus, useCameraDevices,} from "react-native-vision-camera";

export type CameraViewProps = {};

export type CameraViewHandle = {
  takePhoto: () => Promise<any>;
};

export const CameraView = forwardRef<CameraViewHandle, CameraViewProps>(
  (props, ref) => {
    const camera = useRef<Camera>(null);
    const devices = useCameraDevices();
    const device = devices.find((d) => d.position === "back");

    const [hasPermission, setHasPermission] = useState(false);

    useEffect(() => {
      (async () => {
        const permission: CameraPermissionStatus =
          await Camera.requestCameraPermission();
        setHasPermission(permission === "granted");
      })();
    }, []);

    useImperativeHandle(ref, () => ({
    takePhoto: async () => {
    if (!camera.current) return;

    const photo = await camera.current.takePhoto({ flash: "off" });

    return {
      uri: `file://${photo.path}`,
      type: "image/jpeg",
      name: `photo_${Date.now()}.jpg`,
    };
  },
}));

    if (!device) {
      return <Text>Loading camera…</Text>;
    }

    if (!hasPermission) {
      return <Text>No camera permission</Text>;
    }

    return (
      <View style={StyleSheet.absoluteFill}>
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          photo={true}
        />
      </View>
    );
  }
);