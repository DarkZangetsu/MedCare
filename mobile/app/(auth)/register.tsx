import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { REGISTER } from '../../src/services/api';
import { useMutation } from '@apollo/client';
import { useAuthStore } from '../../src/stores/authStore';

export default function RegisterScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [register, { loading }] = useMutation(REGISTER);
  const { setToken, setUser } = useAuthStore();

  const handleRegister = async () => {
    // Validation
    if (!phone || phone.length < 10) {
      setError('Veuillez entrer un numéro de téléphone valide');
      return;
    }

    if (!password || password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!name || name.trim().length < 2) {
      setError('Veuillez entrer votre nom');
      return;
    }

    setError('');
    try {
      const result = await register({ 
        variables: { 
          phone: phone.trim(), 
          password: password,
          name: name.trim(),
          age: age ? parseInt(age, 10) : null
        } 
      });
      
      if (result.data?.register?.success && result.data?.register?.token && result.data?.register?.user) {
        const userData = result.data.register.user;
        // Normaliser les pathologies pour s'assurer que c'est un tableau
        const normalizedUser = {
          ...userData,
          pathologies: Array.isArray(userData.pathologies) ? userData.pathologies : (userData.pathologies || []),
        };
        setToken(result.data.register.token);
        setUser(normalizedUser);
        router.replace('/(tabs)/dashboard');
      } else {
        setError(result.data?.register?.message || 'Erreur lors de l\'inscription');
      }
    } catch (err: any) {
      console.error('Register Error:', err);
      const errorMessage = err.graphQLErrors?.[0]?.message || err.networkError?.message || err.message || 'Erreur lors de l\'inscription';
      setError(errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Créer un compte
          </Text>
          <Text className="text-gray-600 text-base">
            Inscrivez-vous pour commencer
          </Text>
        </View>

        <Input
          label="Numéro de téléphone"
          value={phone}
          onChangeText={setPhone}
          placeholder="+261 34 12 345 67"
          keyboardType="phone-pad"
          error={error}
        />

        <Input
          label="Nom complet"
          value={name}
          onChangeText={setName}
          placeholder="Votre nom"
          error={error}
          className="mt-4"
        />

        <Input
          label="Âge (optionnel)"
          value={age}
          onChangeText={setAge}
          placeholder="25"
          keyboardType="numeric"
          error={error}
          className="mt-4"
        />

        <Input
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          error={error}
          className="mt-4"
        />

        <Input
          label="Confirmer le mot de passe"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="••••••••"
          secureTextEntry
          error={error}
          className="mt-4"
        />

        <Button
          title="S'inscrire"
          onPress={handleRegister}
          isLoading={loading}
          className="mt-6"
        />

        <View className="flex-row justify-center items-center mt-6">
          <Text className="text-gray-600 text-sm">
            Vous avez déjà un compte ?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text className="text-blue-600 font-semibold text-sm">
              Se connecter
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-sm text-gray-500 text-center mt-6">
          En continuant, vous acceptez nos conditions d'utilisation
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

