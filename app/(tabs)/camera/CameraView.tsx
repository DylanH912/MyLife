import { useState } from 'react';

/**
 * NOTE:
 * - Requires Expo prebuild or custom dev client
 * - react-native-vision-camera does NOT work in Expo Go
 * - Permissions must be added to app.json
 */

// Intended to use react-native-vision-camera
// This component should:
// - Request camera permissions
// - Show live camera preview
// - Capture photo and return URI via onPhotoTaken

export type CameraViewProps = {
    onPhotoTaken?: (uri: string) => void;
    onCancel?: () => void;
};

export function CameraView({ onPhotoTaken, onCancel }: CameraViewProps) {
    const camera = useRef<Camera>(null);
    const devices = useCameraDevices();
    const device = devices.back;

    const [hasPermission, setHasPermission] = useState(false);
}