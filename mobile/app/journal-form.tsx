import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../src/components/ui/Button';
import { Input } from '../src/components/ui/Input';
import { useJournalStore } from '../src/stores/journalStore';
import { JournalEntry } from '../src/types';
import { format } from 'date-fns';

export default function JournalFormScreen() {
  const router = useRouter();
  const { addEntry } = useJournalStore();
  const [type, setType] = useState<JournalEntry['type']>('note');
  const [content, setContent] = useState('');
  const [measurementType, setMeasurementType] = useState<JournalEntry['measurementType']>('glycemia');
  const [measurementValue, setMeasurementValue] = useState('');
  const [measurementUnit, setMeasurementUnit] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Nous avons besoin de la permission pour accéder à vos photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (type === 'note' && !content.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une note');
      return;
    }
    if (type === 'measurement' && !measurementValue) {
      Alert.alert('Erreur', 'Veuillez entrer une valeur');
      return;
    }
    if (type === 'photo' && !photoUri) {
      Alert.alert('Erreur', 'Veuillez sélectionner une photo');
      return;
    }

    setIsLoading(true);
    try {
      await addEntry({
        date: format(new Date(), 'yyyy-MM-dd'),
        type,
        content: type === 'note' ? content : undefined,
        measurementType: type === 'measurement' ? measurementType : undefined,
        measurementValue: type === 'measurement' ? parseFloat(measurementValue.replace(',', '.')) : undefined,
        measurementUnit: type === 'measurement' ? measurementUnit : undefined,
        photoUri: type === 'photo' ? photoUri : undefined,
      });
      router.back();
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900">Nouvelle entrée</Text>
        </View>

        <ScrollView className="flex-1 px-6 py-4">
          {/* Type */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Type</Text>
            <View className="flex-row">
              {(['note', 'measurement', 'photo'] as const).map((t) => (
                <Button
                  key={t}
                  title={
                    t === 'note'
                      ? 'Note'
                      : t === 'measurement'
                      ? 'Mesure'
                      : 'Photo'
                  }
                  onPress={() => setType(t)}
                  variant={type === t ? 'primary' : 'outline'}
                  size="sm"
                  className="mr-2 flex-1"
                />
              ))}
            </View>
          </View>

          {type === 'note' && (
            <Input
              label="Note"
              value={content}
              onChangeText={setContent}
              placeholder="Écrivez votre note..."
              multiline
              numberOfLines={6}
            />
          )}

          {type === 'measurement' && (
            <>
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Type de mesure</Text>
                <View className="flex-row flex-wrap">
                  {(['glycemia', 'blood_pressure', 'weight', 'temperature'] as const).map((mt) => {
                    const labels: Record<string, string> = {
                      glycemia: 'Glycémie',
                      blood_pressure: 'Tension artérielle',
                      weight: 'Poids',
                      temperature: 'Température',
                    };
                    return (
                      <Button
                        key={mt}
                        title={labels[mt] || mt}
                        onPress={() => setMeasurementType(mt)}
                        variant={measurementType === mt ? 'primary' : 'outline'}
                        size="sm"
                        className="mr-2 mb-2"
                      />
                    );
                  })}
                </View>
              </View>
              <Input
                label="Valeur"
                value={measurementValue}
                onChangeText={(text) => {
                  // Permettre les chiffres, les virgules et les points
                  const cleaned = text.replace(/[^0-9,.]/g, '');
                  // Remplacer les points par des virgules pour la cohérence
                  const normalized = cleaned.replace(/\./g, ',');
                  // S'assurer qu'il n'y a qu'une seule virgule
                  const parts = normalized.split(',');
                  if (parts.length <= 2) {
                    setMeasurementValue(normalized);
                  }
                }}
                placeholder="Ex: 120,5"
                keyboardType="decimal-pad"
              />
              <Input
                label="Unité (optionnel)"
                value={measurementUnit}
                onChangeText={setMeasurementUnit}
                placeholder="Ex: mg/dL, kg, °C"
              />
            </>
          )}

          {type === 'photo' && (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Photo</Text>
              {photoUri ? (
                <View>
                  <Image
                    source={{ uri: photoUri }}
                    className="w-full h-64 rounded-lg mb-2"
                    resizeMode="cover"
                  />
                  <Button
                    title="Changer la photo"
                    onPress={pickImage}
                    variant="outline"
                  />
                </View>
              ) : (
                <Button
                  title="Sélectionner une photo"
                  onPress={pickImage}
                  variant="outline"
                />
              )}
            </View>
          )}

          <Button
            title="Enregistrer"
            onPress={handleSave}
            isLoading={isLoading}
            className="mt-6"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

