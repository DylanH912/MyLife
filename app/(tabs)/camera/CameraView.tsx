import React, {forwardRef, useEffect,useImperativeHandle,useRef,useState,} from "react";
import { StyleSheet, Text, View } from "react-native";
import {Camera,CameraPermissionStatus,useCameraDevices,} from "react-native-vision-camera";

export type CameraViewProps = {};

export type CameraViewHandle = {
  takePhoto: () => Promise<any>;
};

export const CameraView = forwardRef<CameraViewHandle, CameraViewProps>(
  (props, ref) => {
    const camera = useRef<Camera>(null);
    const devices = useCameraDevices();
    const device = Array.isArray(devices)
      ? devices.find((d) => d.position === "back")
      : (devices as any).back;

    const [hasPermission, setHasPermission] = useState(false);

    useEffect(() => {
      (async () => {
        const permission: CameraPermissionStatus =
          await Camera.requestCameraPermission();
        // Camera.requestCameraPermission() returns "granted" | "denied"
        setHasPermission(permission === "granted");
    })();
    }, []);
    useImperativeHandle(ref, () => ({
      takePhoto: async () => {
        if (!camera.current) return;
        return await camera.current.takePhoto({ flash: "off" });
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