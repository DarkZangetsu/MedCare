import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/stores/authStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Profil</Text>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        <Card className="mb-6">
          <View className="items-center py-6">
            <View className="w-24 h-24 rounded-full bg-blue-100 items-center justify-center mb-4">
              <Ionicons name="person" size={48} color="#2563EB" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-1">
              {user?.name || 'Patient'}
            </Text>
            <Text className="text-gray-600">{user?.phone}</Text>
            {user?.age && (
              <Text className="text-gray-600 mt-1">{user.age} ans</Text>
            )}
          </View>
        </Card>

        {user?.pathologies && Array.isArray(user.pathologies) && user.pathologies.length > 0 && (
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Pathologies
            </Text>
            {user.pathologies.map((pathology, index) => (
              <View
                key={index}
                className="bg-gray-100 rounded-lg px-4 py-2 mb-2"
              >
                <Text className="text-gray-900">{pathology}</Text>
              </View>
            ))}
          </Card>
        )}

        <Card className="mb-6">
          <TouchableOpacity
            onPress={() => router.push('/(auth)/profile')}
            className="flex-row items-center justify-between py-4 border-b border-gray-200"
          >
            <View className="flex-row items-center">
              <Ionicons name="create-outline" size={24} color="#6B7280" />
              <Text className="text-gray-900 ml-3">Modifier le profil</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/ai-triage')}
            className="flex-row items-center justify-between py-4 border-b border-gray-200"
          >
            <View className="flex-row items-center">
              <Ionicons name="medical-outline" size={24} color="#6B7280" />
              <Text className="text-gray-900 ml-3">Triage IA</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {}}
            className="flex-row items-center justify-between py-4"
          >
            <View className="flex-row items-center">
              <Ionicons name="settings-outline" size={24} color="#6B7280" />
              <Text className="text-gray-900 ml-3">Paramètres</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </Card>

        <Button
          title="Déconnexion"
          onPress={handleLogout}
          variant="danger"
          className="mb-6"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

