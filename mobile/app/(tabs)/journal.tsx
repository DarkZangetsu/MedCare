import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useJournalStore } from '../../src/stores/journalStore';
import { JournalEntry } from '../../src/types';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function JournalScreen() {
  const router = useRouter();
  const { entries, getEntriesByDate } = useJournalStore();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const todayEntries = getEntriesByDate(selectedDate);
  const uniqueDates = Array.from(
    new Set(entries.map((e) => e.date))
  ).sort((a, b) => b.localeCompare(a));

  const getEntryIcon = (entry: JournalEntry) => {
    if (entry.type === 'photo') return 'image';
    if (entry.type === 'measurement') {
      const icons: Record<string, string> = {
        glycemia: 'water',
        blood_pressure: 'pulse',
        weight: 'scale',
        temperature: 'thermometer',
      };
      return icons[entry.measurementType || ''] || 'analytics';
    }
    return 'document-text';
  };

  const getMeasurementTypeLabel = (type?: string) => {
    const labels: Record<string, string> = {
      glycemia: 'Glycémie',
      blood_pressure: 'Tension artérielle',
      weight: 'Poids',
      temperature: 'Température',
      other: 'Autre',
    };
    return labels[type || ''] || type || 'Mesure';
  };

  const formatMeasurementValue = (value?: number) => {
    if (value === undefined) return '';
    // Formater avec une virgule pour les décimales
    return value.toString().replace('.', ',');
  };

  const getEntryTitle = (entry: JournalEntry) => {
    if (entry.type === 'note') return entry.content?.substring(0, 50) || 'Note';
    if (entry.type === 'measurement') {
      const typeLabel = getMeasurementTypeLabel(entry.measurementType);
      const value = formatMeasurementValue(entry.measurementValue);
      return `${typeLabel}: ${value} ${entry.measurementUnit || ''}`.trim();
    }
    return 'Photo';
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <View className="bg-white px-6 py-4 border-b border-gray-200 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-gray-900">Journal santé</Text>
        <TouchableOpacity
          onPress={() => router.push('/journal-form')}
          className="bg-blue-600 rounded-full p-2"
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Sélecteur de date */}
      <View className="bg-white border-b border-gray-200 px-4 py-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          {uniqueDates.slice(0, 7).map((date) => (
            <TouchableOpacity
              key={date}
              onPress={() => setSelectedDate(date)}
              className={`px-3 py-1.5 mr-2 rounded-lg ${
                selectedDate === date 
                  ? 'bg-blue-600 border-2 border-blue-600' 
                  : 'bg-white border-2 border-gray-200'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  selectedDate === date ? 'text-white' : 'text-gray-700'
                }`}
              >
                {format(parseISO(date), 'd MMM', { locale: fr })}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {todayEntries.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="book-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-600 text-center mt-4">
              Aucune entrée pour cette date
            </Text>
            <Button
              title="Ajouter une entrée"
              onPress={() => router.push('/journal-form')}
              className="mt-6"
            />
          </View>
        ) : (
          todayEntries.map((entry) => (
            <Card key={entry.id} className="mb-4">
              <View className="flex-row items-start">
                <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-4">
                  <Ionicons
                    name={getEntryIcon(entry) as any}
                    size={24}
                    color="#2563EB"
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 mb-1">
                    {getEntryTitle(entry)}
                  </Text>
                  {entry.type === 'note' && entry.content && (
                    <Text className="text-gray-600 text-sm mb-2">
                      {entry.content}
                    </Text>
                  )}
                  {entry.type === 'photo' && entry.photoUri && (
                    <Image
                      source={{ uri: entry.photoUri }}
                      className="w-full h-48 rounded-lg mb-2"
                      resizeMode="cover"
                    />
                  )}
                  <Text className="text-xs text-gray-500">
                    {format(parseISO(entry.createdAt), "HH:mm", { locale: fr })}
                  </Text>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

