import React from 'react';
import { View } from 'react-native';
import { CameraView } from './camera/CameraView';

export default function CameraScreen() { // Gets the camera screen
    return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
        <CameraView />
    </View>
    );
}