import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
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
      const { data } = await triage({
        variables: {
          symptoms: symptoms.trim(),
        },
      });

      console.log('Full response data:', JSON.stringify(data, null, 2));
      
      if (data?.aiTriage?.triage) {
        const triageData = data.aiTriage.triage;
        console.log('Triage data received:', JSON.stringify(triageData, null, 2));
        console.log('Severity value:', triageData.severity);
        console.log('Severity type:', typeof triageData.severity);
        
        // Vérifier que severity existe
        if (!triageData.severity) {
          console.error('Severity is missing in response:', triageData);
          Alert.alert(
            'Erreur', 
            `Les données reçues sont incomplètes. Severity manquant.\n\nDonnées reçues: ${JSON.stringify(triageData)}`
          );
          return;
        }
        
        const severityValue = triageData.severity.toLowerCase().trim();
        console.log('Normalized severity:', severityValue);
        
        setResult({
          id: triageData.id,
          symptoms: symptoms.trim(),
          severity: severityValue as AITriageResult['severity'],
          advice: triageData.advice || 'Aucun conseil disponible',
          recommendation: triageData.recommendation || 'Aucune recommandation disponible',
          createdAt: new Date().toISOString(),
        });
      } else {
        console.error('No triage data in response:', JSON.stringify(data, null, 2));
        Alert.alert('Erreur', 'Aucune donnée reçue. Veuillez réessayer.');
      }
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert(
        'Erreur',
        error.message || 'Impossible d\'analyser les symptômes. Veuillez réessayer.'
      );
    }
  };

  const getSeverityColor = (severity: AITriageResult['severity'] | undefined) => {
    if (!severity) return '#6B7280'; // Gris par défaut
    const colors = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
      critical: '#DC2626',
    };
    return colors[severity] || '#6B7280';
  };

  const getSeverityLabel = (severity: AITriageResult['severity'] | undefined) => {
    if (!severity) return 'Non défini';
    const labels = {
      low: 'Faible',
      medium: 'Modérée',
      high: 'Élevée',
      critical: 'Critique',
    };
    return labels[severity] || 'Non défini';
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
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">Triage IA</Text>
            <Text className="text-gray-600 text-sm mt-1">
              Décrivez vos symptômes pour obtenir une évaluation
            </Text>
          </View>
        </View>

        <ScrollView 
          className="flex-1 px-6 py-4"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
        {!result ? (
          <>
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 mb-4">Symptômes</Text>
              <View className="bg-white rounded-xl p-4 border border-gray-200">
                <Input
                  label=""
                  value={symptoms}
                  onChangeText={setSymptoms}
                  placeholder="Ex: Maux de tête depuis 2 jours, fièvre légère, fatigue..."
                  multiline
                  numberOfLines={8}
                  className="min-h-[150px]"
                />
              </View>
            </View>

            <Button
              title="Analyser les symptômes"
              onPress={handleTriage}
              isLoading={loading}
              disabled={!symptoms.trim()}
              className="mb-6"
            />

            <Card className="bg-blue-50 border-blue-200">
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
            {/* Carte de gravité */}
            <Card className="mb-4">
              <View className="flex-row items-center">
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
                  <Text className="text-sm text-gray-500 mb-1">Niveau de gravité</Text>
                  <Text
                    className="text-2xl font-bold"
                    style={{ color: getSeverityColor(result.severity) }}
                  >
                    {getSeverityLabel(result.severity)}
                  </Text>
                  {!result.severity && (
                    <Text className="text-xs text-red-500 mt-1">
                      (Gravité non disponible)
                    </Text>
                  )}
                </View>
              </View>
            </Card>

            {/* Conseils */}
            <Card className="mb-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="bulb-outline" size={20} color="#6B7280" />
                <Text className="text-lg font-semibold text-gray-900 ml-2">Conseils</Text>
              </View>
              <Text className="text-gray-700 leading-6">{result.advice}</Text>
            </Card>

            {/* Recommandation */}
            <Card className="mb-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="checkmark-circle-outline" size={20} color="#6B7280" />
                <Text className="text-lg font-semibold text-gray-900 ml-2">Recommandation</Text>
              </View>
              <Text className="text-gray-700 leading-6">{result.recommendation}</Text>
            </Card>

            {/* Boutons d'action */}
            <View className="flex-row gap-3 mb-4">
              <Button
                title="Nouvelle analyse"
                onPress={() => {
                  setResult(null);
                  setSymptoms('');
                }}
                variant="outline"
                className="flex-1"
              />
              <Button
                title="Consulter un médecin"
                onPress={() => router.push('/(tabs)/consultations')}
                className="flex-1"
              />
            </View>
          </>
        )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

