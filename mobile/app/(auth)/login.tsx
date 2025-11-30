import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { LOGIN } from '../../src/services/api';
import { useMutation } from '@apollo/client';
import { useAuthStore } from '../../src/stores/authStore';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [login, { loading }] = useMutation(LOGIN);
  const { setToken, setUser } = useAuthStore();

  const handleLogin = async () => {
    if (!phone || phone.length < 10) {
      setError('Veuillez entrer un numéro de téléphone valide');
      return;
    }

    if (!password || password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setError('');
    try {
      const result = await login({ 
        variables: { 
          phone: phone.trim(), 
          password: password 
        } 
      });
      
      if (result.data?.login?.token && result.data?.login?.user) {
        const userData = result.data.login.user;
        // Normaliser les pathologies pour s'assurer que c'est un tableau
        const normalizedUser = {
          ...userData,
          pathologies: Array.isArray(userData.pathologies) ? userData.pathologies : (userData.pathologies || []),
        };
        setToken(result.data.login.token);
        setUser(normalizedUser);
        router.replace('/(tabs)/dashboard');
      } else {
        setError('Erreur lors de la connexion');
      }
    } catch (err: any) {
      console.error('Login Error:', err);
      const errorMessage = err.graphQLErrors?.[0]?.message || err.networkError?.message || err.message || 'Erreur lors de la connexion';
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
            Bienvenue sur MedCare
          </Text>
          <Text className="text-gray-600 text-base">
            Connectez-vous à votre compte
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
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          error={error}
          className="mt-4"
        />

        <Button
          title="Se connecter"
          onPress={handleLogin}
          isLoading={loading}
          className="mt-6"
        />

        <View className="flex-row justify-center items-center mt-6">
          <Text className="text-gray-600 text-sm">
            Vous n'avez pas de compte ?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text className="text-blue-600 font-semibold text-sm">
              S'inscrire
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

