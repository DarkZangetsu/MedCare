import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useRemindersStore } from '../../src/stores/remindersStore';
import { Reminder } from '../../src/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cancelNotification, scheduleReminderNotification } from '../../src/services/notifications';

export default function RemindersScreen() {
  const router = useRouter();
  const { reminders, isLoading, fetchReminders, deleteReminder, updateReminder } = useRemindersStore();
  const [selectedType, setSelectedType] = useState<'all' | Reminder['type']>('all');

  useEffect(() => {
    fetchReminders();
  }, []);

  const filteredReminders = reminders.filter(
    (r) => selectedType === 'all' || r.type === selectedType
  );

  const handleToggleReminder = async (reminder: Reminder) => {
    try {
      if (reminder.notificationId) {
        await cancelNotification(reminder.notificationId);
      }
      
      const updatedReminder = {
        ...reminder,
        isActive: !reminder.isActive,
        notificationId: !reminder.isActive
          ? await scheduleReminderNotification({
              ...reminder,
              isActive: true,
            })
          : undefined,
      };
      
      await updateReminder(reminder.id, updatedReminder);
      await fetchReminders();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de mettre à jour le rappel');
    }
  };

  const handleDelete = (reminder: Reminder) => {
    Alert.alert(
      'Supprimer le rappel',
      'Êtes-vous sûr de vouloir supprimer ce rappel ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              if (reminder.notificationId) {
                await cancelNotification(reminder.notificationId);
              }
              await deleteReminder(reminder.id);
              await fetchReminders();
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Impossible de supprimer le rappel');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <View className="bg-white px-5 py-5 border-b border-gray-200 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-gray-900">Rappels santé</Text>
        <TouchableOpacity
          onPress={() => router.push('/reminder-form')}
          className="bg-blue-600 rounded-full p-3"
          style={{ width: 44, height: 44 }}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Filtres */}
      <View className="bg-white border-b border-gray-200 px-4 py-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          {(['all', 'medication', 'appointment', 'analysis'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setSelectedType(type)}
              className={`px-3 py-1.5 mr-2 rounded-lg ${
                selectedType === type 
                  ? 'bg-blue-600 border-2 border-blue-600' 
                  : 'bg-white border-2 border-gray-200'
              }`}
            >
            <Text
              className={`text-sm font-semibold ${
                selectedType === type ? 'text-white' : 'text-gray-700'
              }`}
            >
              {type === 'all'
                ? 'Tous'
                : type === 'medication'
                ? 'Médicaments'
                : type === 'appointment'
                ? 'RDV'
                : 'Analyses'}
            </Text>
          </TouchableOpacity>
        ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {isLoading ? (
          <View className="items-center justify-center py-16">
            <ActivityIndicator size="large" color="#2563EB" />
            <Text className="text-gray-600 text-center mt-4">Chargement des rappels...</Text>
          </View>
        ) : filteredReminders.length === 0 ? (
          <View className="items-center justify-center py-16">
            <Ionicons name="alarm-outline" size={72} color="#9CA3AF" />
            <Text className="text-gray-600 text-center mt-6 text-base">
              Aucun rappel pour le moment
            </Text>
            <Button
              title="Créer un rappel"
              onPress={() => router.push('/reminder-form')}
              className="mt-8"
            />
          </View>
        ) : (
          filteredReminders.map((reminder) => (
            <Card key={reminder.id} className="mb-4 p-5">
              <View className="flex-row items-start">
                <View
                  className={`w-14 h-14 rounded-full items-center justify-center mr-4 ${
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
                    size={26}
                    color={
                      reminder.type === 'medication'
                        ? '#2563EB'
                        : reminder.type === 'appointment'
                        ? '#10B981'
                        : '#9333EA'
                    }
                  />
                </View>
                <View className="flex-1 min-w-0">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="font-bold text-gray-900 text-base flex-1 mr-2" numberOfLines={2}>
                      {reminder.title}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleDelete(reminder)}
                      className="p-1"
                      style={{ marginTop: -4 }}
                    >
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                  {reminder.description && (
                    <Text className="text-gray-600 text-sm mb-3 leading-5" numberOfLines={2}>
                      {reminder.description}
                    </Text>
                  )}
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="time-outline" size={16} color="#6B7280" />
                    <Text className="text-sm text-gray-600 ml-1.5">
                      {format(
                        new Date(`${reminder.date}T${reminder.time}`),
                        "EEEE d MMMM yyyy à HH:mm",
                        { locale: fr }
                      )}
                      {reminder.frequency && reminder.frequency !== 'once' && (
                        <Text className="text-blue-600 font-semibold">
                          {' • '}
                          {reminder.frequency === 'daily' && 'Tous les jours'}
                          {reminder.frequency === 'weekly' && 'Toutes les semaines'}
                          {reminder.frequency === 'monthly' && 'Tous les mois'}
                          {reminder.endDate && ` jusqu'au ${format(new Date(reminder.endDate), 'd MMM yyyy', { locale: fr })}`}
                        </Text>
                      )}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleToggleReminder(reminder)}
                    className={`flex-row items-center ${
                      reminder.isActive ? 'opacity-100' : 'opacity-50'
                    }`}
                    style={{ marginTop: 4 }}
                  >
                    <View
                      className={`w-6 h-6 rounded-full mr-2.5 border-2 items-center justify-center ${
                        reminder.isActive
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {reminder.isActive && (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      )}
                    </View>
                    <Text className="text-sm font-medium text-gray-700">
                      {reminder.isActive ? 'Actif' : 'Inactif'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

