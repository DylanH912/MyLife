import { CameraView } from 'app/tabs/camera/CameraView'; //fix
import React from 'react';
import { View } from 'react-native';

export default function CameraScreen() {
    return (
        <View style={{ flex: 1 }}>
            <CameraView />
        </View>
    );
}