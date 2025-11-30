import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingProps {
  message?: string;
}

export function Loading({ message }: LoadingProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#4A90E2" />
      {message && (
        <Text className="mt-4 text-gray-600 text-base">{message}</Text>
      )}
    </View>
  );
}

