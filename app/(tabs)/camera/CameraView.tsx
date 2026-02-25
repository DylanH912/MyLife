import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Camera, CameraPermissionStatus, getCameraDevice, useCameraDevices } from 'react-native-vision-camera';

export type CameraViewProps = {
    onPhotoTaken?: (uri: string) => void;
    onCancel?: () => void;
};

export function CameraView({ onPhotoTaken, onCancel }: CameraViewProps) {
    const camera = useRef<Camera>(null);
    const devices = useCameraDevices();
    const device = getCameraDevice(devices, 'back');

    const [hasPermission, setHasPermission] = useState<boolean>(false);

    useEffect(() => {
    (async () => {
        const permission: CameraPermissionStatus =
            await Camera.requestCameraPermission();

        setHasPermission(String(permission) === 'authorized');
        })();
    }, []);

    if (!device) {
        return <Text>Loading camera…</Text>;
    }

    if (!hasPermission) {
        return <Text>No camera permission</Text>;
    }

    const takePhoto = async () => {
        if (!camera.current) return;

    const photo = await camera.current.takePhoto({
        flash: 'off',
    });

    onPhotoTaken?.(`file://${photo.path}`);
    };

    return (
        <View style={StyleSheet.absoluteFill}>
            <Camera
                ref={camera}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                photo={true}
            />

            <View style={styles.controls}>
                <TouchableOpacity onPress={onCancel}>
                    <Text style={styles.text}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={takePhoto}>
                    <Text style={styles.text}>Capture</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    controls: {
        position: 'absolute',
        bottom: 40,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    text: {
    color: 'white',
    fontSize: 18,
    },
});