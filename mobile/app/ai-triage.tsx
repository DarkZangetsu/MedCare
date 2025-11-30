import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../src/components/ui/Card';
import { Button } from '../src/components/ui/Button';
import { Input } from '../src/components/ui/Input';
import { apolloClient, AI_TRIAGE } from '../src/services/api';
import { useMutation } from '@apollo/client';
import { AITriageResult } from '../src/types';

export default function AITriageScreen() {
  const router = useRouter();
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState<AITriageResult | null>(null);
  const [triage, { loading }] = useMutation(AI_TRIAGE);

  const handleTriage = async () => {
    if (!symptoms.trim()) {
      return;
    }

    try {
      // Mock pour l'instant
      const mockResult: AITriageResult = {
        id: Date.now().toString(),
        symptoms: symptoms.trim(),
        severity: 'medium',
        advice: 'Il est recommandé de surveiller vos symptômes. Reposez-vous et hydratez-vous bien. Si les symptômes persistent ou s\'aggravent, consultez un médecin.',
        recommendation: 'Consultation recommandée dans les 24-48h si les symptômes persistent.',
        createdAt: new Date().toISOString(),
      };
      
      setResult(mockResult);
    } catch (error: any) {
      console.error('Error:', error);
    }
  };

  const getSeverityColor = (severity: AITriageResult['severity']) => {
    const colors = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
      critical: '#DC2626',
    };
    return colors[severity];
  };

  const getSeverityLabel = (severity: AITriageResult['severity']) => {
    const labels = {
      low: 'Faible',
      medium: 'Modérée',
      high: 'Élevée',
      critical: 'Critique',
    };
    return labels[severity];
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Triage IA</Text>
        <Text className="text-gray-600 text-sm mt-1">
          Décrivez vos symptômes pour obtenir une évaluation
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {!result ? (
          <>
            <Input
              label="Décrivez vos symptômes"
              value={symptoms}
              onChangeText={setSymptoms}
              placeholder="Ex: Maux de tête depuis 2 jours, fièvre légère, fatigue..."
              multiline
              numberOfLines={8}
            />

            <Button
              title="Analyser"
              onPress={handleTriage}
              isLoading={loading}
              className="mt-4"
            />

            <Card className="mt-6 bg-blue-50 border-blue-200">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={24} color="#2563EB" />
                <Text className="text-sm text-blue-900 ml-3 flex-1">
                  Cette analyse est fournie à titre informatif uniquement et ne remplace pas une consultation médicale professionnelle.
                </Text>
              </View>
            </Card>
          </>
        ) : (
          <>
            <Card className="mb-4">
              <View className="flex-row items-center mb-4">
                <View
                  className="w-16 h-16 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: `${getSeverityColor(result.severity)}20` }}
                >
                  <Ionicons
                    name="medical"
                    size={32}
                    color={getSeverityColor(result.severity)}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900">Gravité</Text>
                  <Text
                    className="text-2xl font-bold"
                    style={{ color: getSeverityColor(result.severity) }}
                  >
                    {getSeverityLabel(result.severity)}
                  </Text>
                </View>
              </View>
            </Card>

            <Card className="mb-4">
              <Text className="text-lg font-semibold text-gray-900 mb-2">Conseils</Text>
              <Text className="text-gray-700">{result.advice}</Text>
            </Card>

            <Card className="mb-4">
              <Text className="text-lg font-semibold text-gray-900 mb-2">Recommandation</Text>
              <Text className="text-gray-700">{result.recommendation}</Text>
            </Card>

            <View className="flex-row">
              <Button
                title="Nouvelle analyse"
                onPress={() => {
                  setResult(null);
                  setSymptoms('');
                }}
                variant="outline"
                className="flex-1 mr-2"
              />
              <Button
                title="Consulter un médecin"
                onPress={() => router.push('/(tabs)/consultations')}
                className="flex-1 ml-2"
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

