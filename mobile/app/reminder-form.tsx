import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../src/components/ui/Button';
import { Input } from '../src/components/ui/Input';
import { useRemindersStore } from '../src/stores/remindersStore';
import { Reminder } from '../src/types';
import { scheduleReminderNotification } from '../src/services/notifications';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ReminderFormScreen() {
  const router = useRouter();
  const { addReminder, fetchReminders } = useRemindersStore();
  const [type, setType] = useState<Reminder['type']>('medication');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [frequency, setFrequency] = useState<Reminder['frequency']>('once');
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const reminderData: Omit<Reminder, 'id'> = {
        type,
        title: title.trim(),
        description: description.trim() || undefined,
        date: date.toISOString().split('T')[0],
        time: time.toTimeString().slice(0, 5),
        frequency: type === 'medication' ? frequency : 'once',
        endDate: endDate ? endDate.toISOString().split('T')[0] : undefined,
        isActive: true,
      };

      const notificationId = await scheduleReminderNotification({
        ...reminderData,
        id: 'temp',
      });

      await addReminder({
        ...reminderData,
        notificationId,
      });

      // Recharger les rappels après création
      await fetchReminders();

      router.back();
    } catch (error: any) {
      console.error('Error creating reminder:', error);
      Alert.alert('Erreur', error.message || 'Impossible de créer le rappel');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header avec bouton retour */}
        <View className="bg-white px-5 py-4 border-b border-gray-200 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4 p-2 -ml-2"
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900 flex-1">Nouveau rappel</Text>
        </View>

        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Section: Type de rappel */}
          <View className="mb-6">
            <Text className="text-base font-bold text-gray-900 mb-4">Type de rappel</Text>
            <View className="flex-row gap-3">
              {(['medication', 'appointment', 'analysis'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setType(t)}
                  className={`flex-1 py-3.5 px-4 rounded-xl border-2 items-center justify-center ${
                    type === t
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Ionicons
                    name={
                      t === 'medication'
                        ? 'medical'
                        : t === 'appointment'
                        ? 'calendar'
                        : 'flask'
                    }
                    size={24}
                    color={type === t ? '#FFFFFF' : '#6B7280'}
                  />
                  <Text
                    className={`text-sm font-semibold mt-2 ${
                      type === t ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {t === 'medication'
                      ? 'Médicament'
                      : t === 'appointment'
                      ? 'Rendez-vous'
                      : 'Analyse'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Section: Informations principales */}
          <View className="mb-6">
            <Text className="text-base font-bold text-gray-900 mb-4">Informations</Text>
            
            <View className="mb-4">
              <Input
                label="Titre *"
                value={title}
                onChangeText={setTitle}
                placeholder="Ex: Prendre médicament"
              />
            </View>

            {/* Date et Heure dans une carte */}
            <View className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-3">Date et heure</Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3.5 flex-row items-center justify-between"
                >
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">Date</Text>
                    <Text className="text-base font-medium text-gray-900">
                      {date.toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </Text>
                  </View>
                  <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) setDate(selectedDate);
                    }}
                    minimumDate={new Date()}
                  />
                )}

                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3.5 flex-row items-center justify-between"
                >
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">Heure</Text>
                    <Text className="text-base font-medium text-gray-900">
                      {time.toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <Ionicons name="time-outline" size={20} color="#6B7280" />
                </TouchableOpacity>
                {showTimePicker && (
                  <DateTimePicker
                    value={time}
                    mode="time"
                    display="default"
                    onChange={(event, selectedTime) => {
                      setShowTimePicker(false);
                      if (selectedTime) setTime(selectedTime);
                    }}
                  />
                )}
              </View>
            </View>
          </View>

          {/* Section: Fréquence (uniquement pour les médicaments) */}
          {type === 'medication' && (
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 mb-4">Fréquence</Text>
              <View className="bg-white rounded-xl p-4 border border-gray-200">
                <View className="flex-row gap-2 flex-wrap">
                  {(['once', 'daily', 'weekly', 'monthly'] as const).map((freq) => (
                    <TouchableOpacity
                      key={freq}
                      onPress={() => {
                        setFrequency(freq);
                        if (freq === 'once') {
                          setEndDate(null);
                        }
                      }}
                      className={`py-2.5 px-4 rounded-lg border-2 flex-1 min-w-[45%] ${
                        frequency === freq
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold text-center ${
                          frequency === freq ? 'text-white' : 'text-gray-700'
                        }`}
                      >
                        {freq === 'once'
                          ? 'Une fois'
                          : freq === 'daily'
                          ? 'Tous les jours'
                          : freq === 'weekly'
                          ? 'Toutes les semaines'
                          : 'Tous les mois'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                {/* Date de fin (pour les rappels récurrents) */}
                {frequency !== 'once' && (
                  <View className="mt-4 pt-4 border-t border-gray-200">
                    <Text className="text-sm font-semibold text-gray-700 mb-2.5">Date de fin (optionnel)</Text>
                    <TouchableOpacity
                      onPress={() => setShowEndDatePicker(true)}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3.5 flex-row items-center justify-between"
                    >
                      <Text className={`text-base ${endDate ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                        {endDate
                          ? endDate.toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                          : 'Sélectionner une date'}
                      </Text>
                      <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                    </TouchableOpacity>
                    {showEndDatePicker && (
                      <DateTimePicker
                        value={endDate || new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                          setShowEndDatePicker(false);
                          if (selectedDate) setEndDate(selectedDate);
                        }}
                        minimumDate={date}
                      />
                    )}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Section: Description */}
          <View className="mb-6">
            <Text className="text-base font-bold text-gray-900 mb-4">Détails supplémentaires</Text>
            <View className="bg-white rounded-xl p-4 border border-gray-200">
              <Input
                label=""
                value={description}
                onChangeText={setDescription}
                placeholder="Ajouter une description ou des notes..."
                multiline
                numberOfLines={4}
                className="min-h-[100px]"
              />
            </View>
          </View>

          {/* Bouton d'enregistrement */}
          <Button
            title="Enregistrer le rappel"
            onPress={handleSave}
            isLoading={isLoading}
            className="mt-2"
            disabled={!title.trim()}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

