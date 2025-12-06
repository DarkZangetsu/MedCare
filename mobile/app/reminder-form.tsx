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
        <View className="bg-white px-5 py-5 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900">Nouveau rappel</Text>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
          {/* Type */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-3">Type de rappel</Text>
            <View className="flex-row gap-3">
              {(['medication', 'appointment', 'analysis'] as const).map((t) => (
                <Button
                  key={t}
                  title={
                    t === 'medication'
                      ? 'Médicament'
                      : t === 'appointment'
                      ? 'RDV'
                      : 'Analyse'
                  }
                  onPress={() => setType(t)}
                  variant={type === t ? 'primary' : 'outline'}
                  size="sm"
                  className="flex-1"
                />
              ))}
            </View>
          </View>

          <View className="mb-5">
            <Input
              label="Titre"
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: Prendre médicament"
            />
          </View>

          {/* Fréquence (uniquement pour les médicaments) */}
          {type === 'medication' && (
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-3">Fréquence</Text>
              <View className="flex-row gap-2 flex-wrap">
                {(['once', 'daily', 'weekly', 'monthly'] as const).map((freq) => (
                  <Button
                    key={freq}
                    title={
                      freq === 'once'
                        ? 'Une fois'
                        : freq === 'daily'
                        ? 'Tous les jours'
                        : freq === 'weekly'
                        ? 'Toutes les semaines'
                        : 'Tous les mois'
                    }
                    onPress={() => {
                      setFrequency(freq);
                      if (freq === 'once') {
                        setEndDate(null);
                      }
                    }}
                    variant={frequency === freq ? 'primary' : 'outline'}
                    size="sm"
                    className="flex-1 min-w-[45%]"
                  />
                ))}
              </View>
              
              {/* Date de fin (pour les rappels récurrents) */}
              {frequency !== 'once' && (
                <View className="mt-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2.5">Date de fin (optionnel)</Text>
                  <TouchableOpacity
                    onPress={() => setShowEndDatePicker(true)}
                    className="bg-white border border-gray-300 rounded-lg px-4 py-3.5 flex-row items-center justify-between"
                  >
                    <Text className="text-gray-900 text-base">
                      {endDate
                        ? endDate.toLocaleDateString('fr-FR', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
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
          )}

          <View className="mb-5">
            <Input
              label="Description (optionnel)"
              value={description}
              onChangeText={setDescription}
              placeholder="Détails supplémentaires"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Date et Heure */}
          <View className="flex-row gap-4 mb-5">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-700 mb-2.5">Date</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="bg-white border border-gray-300 rounded-lg px-4 py-3.5 flex-row items-center justify-between"
              >
                <Text className="text-gray-900 text-base">
                  {date.toLocaleDateString('fr-FR', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
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
            </View>

            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-700 mb-2.5">Heure</Text>
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                className="bg-white border border-gray-300 rounded-lg px-4 py-3.5 flex-row items-center justify-between"
              >
                <Text className="text-gray-900 text-base">
                  {time.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
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

          <Button
            title="Enregistrer le rappel"
            onPress={handleSave}
            isLoading={isLoading}
            className="mt-2"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

