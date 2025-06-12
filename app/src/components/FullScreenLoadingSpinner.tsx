import { ActivityIndicator, View } from 'react-native';

const FullScreenLoadingSpinner = ({ isLoading = false, isTransparent = false }) => {
    if (!isLoading) return null;
    return (
        <View
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: isTransparent ? 'transparent' : '#00000050',
                zIndex: 1,
            }}>
            <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
    );
};

export default FullScreenLoadingSpinner;
