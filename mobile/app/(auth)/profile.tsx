import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { useAuthStore } from '../../src/stores/authStore';

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [pathologies, setPathologies] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Le nom est requis');
      return;
    }

    setError('');
    try {
      await updateProfile({
        name: name.trim(),
        age: age ? parseInt(age, 10) : undefined,
        pathologies: pathologies
          ? pathologies.split(',').map((p) => p.trim())
          : undefined,
      });
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerClassName="flex-grow px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Créer votre profil
          </Text>
          <Text className="text-gray-600 text-base">
            Complétez vos informations pour commencer
          </Text>
        </View>

        <Input
          label="Nom complet"
          value={name}
          onChangeText={setName}
          placeholder="Jean Dupont"
          error={error}
        />

        <Input
          label="Âge"
          value={age}
          onChangeText={setAge}
          placeholder="30"
          keyboardType="numeric"
        />

        <Input
          label="Pathologies (optionnel)"
          value={pathologies}
          onChangeText={setPathologies}
          placeholder="Diabète, Hypertension (séparées par des virgules)"
          multiline
          numberOfLines={3}
        />

        <Button
          title="Continuer"
          onPress={handleSave}
          className="mt-6"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

