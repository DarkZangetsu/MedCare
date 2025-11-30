import { Stack } from 'expo-router';
import { useEffect } from 'react';
import '../global.css';
import { AppApolloProvider } from '../src/providers/ApolloProvider';
import { registerForPushNotificationsAsync } from '../src/services/notifications';

export default function RootLayout() {
  useEffect(() => {
    // Enregistrer les notifications (gère les erreurs silencieusement)
    registerForPushNotificationsAsync().catch((error) => {
      console.warn('Failed to register push notifications:', error);
      // Les notifications locales fonctionneront toujours même sans push token
    });
  }, []);

  return (
    <AppApolloProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="reminder-form" options={{ headerShown: false }} />
        <Stack.Screen name="journal-form" options={{ headerShown: false }} />
        <Stack.Screen name="ai-triage" options={{ headerShown: false }} />
        <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="payment/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="pdf/[id]" options={{ headerShown: false }} />
      </Stack>
    </AppApolloProvider>
  );
}

