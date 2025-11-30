import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../src/stores/authStore';

export default function Index() {
  const { isAuthenticated, user } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Attendre que le store soit initialisé
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!user?.name) {
    return <Redirect href="/(auth)/profile" />;
  }

  return <Redirect href="/(tabs)/dashboard" />;
}

