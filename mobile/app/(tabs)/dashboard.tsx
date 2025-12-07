import { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../src/components/ui/Card';
import { useAuthStore } from '../../src/stores/authStore';
import { useRemindersStore } from '../../src/stores/remindersStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { getUpcomingReminders, fetchReminders } = useRemindersStore();
  const upcomingReminders = getUpcomingReminders();

  useEffect(() => {
    fetchReminders();
  }, []);

  const quickActions = [
    {
      title: 'Journal',
      icon: 'book-outline',
      color: '#4A90E2',
      onPress: () => router.push('/(tabs)/journal'),
    },
    {
      title: 'Consultation',
      icon: 'chatbubbles-outline',
      color: '#10B981',
      onPress: () => router.push('/(tabs)/consultations'),
    },
    {
      title: 'Triage IA',
      icon: 'medical-outline',
      color: '#F59E0B',
      onPress: () => router.push('/ai-triage'),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white px-6 py-6 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900">
            Bonjour {user?.name || 'Patient'}
          </Text>
          <Text className="text-gray-600 mt-1">
            {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
          </Text>
        </View>

        {/* Prochains rappels */}
        {upcomingReminders.length > 0 && (
          <View className="px-6 py-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Prochains rappels
            </Text>
            {upcomingReminders.slice(0, 3).map((reminder) => (
              <Card key={reminder.id} className="mb-3">
                <View className="flex-row items-center">
                  <View
                    className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                      reminder.type === 'medication'
                        ? 'bg-blue-100'
                        : reminder.type === 'appointment'
                        ? 'bg-green-100'
                        : 'bg-purple-100'
                    }`}
                  >
                    <Ionicons
                      name={
                        reminder.type === 'medication'
                          ? 'bandage'
                          : reminder.type === 'appointment'
                          ? 'calendar-outline'
                          : 'flask-outline'
                      }
                      size={24}
                      color={
                        reminder.type === 'medication'
                          ? '#2563EB'
                          : reminder.type === 'appointment'
                          ? '#10B981'
                          : '#9333EA'
                      }
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900">
                      {reminder.title}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {format(
                        new Date(`${reminder.date}T${reminder.time}`),
                        "d MMM à HH:mm",
                        { locale: fr }
                      )}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/reminders')}
              className="mt-2"
            >
              <Text className="text-blue-600 text-sm font-medium">
                Voir tous les rappels →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Boutons rapides */}
        <View className="px-6 py-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Accès rapide
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={action.onPress}
                className="w-[30%] mb-4"
              >
                <Card className="items-center py-6">
                  <View
                    className="w-16 h-16 rounded-full items-center justify-center mb-3"
                    style={{ backgroundColor: `${action.color}20` }}
                  >
                    <Ionicons
                      name={action.icon as any}
                      size={32}
                      color={action.color}
                    />
                  </View>
                  <Text className="text-sm font-medium text-gray-900 text-center">
                    {action.title}
                  </Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

