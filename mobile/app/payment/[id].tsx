import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useConsultationsStore } from '../../src/stores/consultationsStore';
import { Payment } from '../../src/types';

export default function PaymentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { consultations, addPayment, updateConsultationStatus } = useConsultationsStore();
  const [selectedOperator, setSelectedOperator] = useState<Payment['operator'] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const consultation = consultations.find((c) => c.id === id);
  const amount = consultation?.doctor.price || 0;

  const operators = [
    { id: 'mvola' as const, name: 'MVola', color: '#10B981', icon: 'phone-portrait' },
    { id: 'orange' as const, name: 'Orange Money', color: '#FF6600', icon: 'phone-portrait' },
    { id: 'airtel' as const, name: 'Airtel Money', color: '#E60012', icon: 'phone-portrait' },
  ];

  const handlePayment = async () => {
    if (!selectedOperator || !consultation) return;

    setIsProcessing(true);
    try {
      // TODO: Appel API réel pour le paiement
      // Simuler le processus de paiement
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const payment: Omit<Payment, 'id' | 'createdAt'> = {
        consultationId: consultation.id,
        amount,
        operator: selectedOperator,
        status: 'success',
        transactionId: `TXN_${Date.now()}`,
      };

      await addPayment(payment);
      await updateConsultationStatus(consultation.id, 'completed');

      Alert.alert(
        'Paiement réussi',
        'Votre paiement a été effectué avec succès.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.push(`/pdf/${consultation.id}`);
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Le paiement a échoué');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!consultation) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-600">Consultation introuvable</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <View className="bg-white px-5 py-4 border-b border-gray-200 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4 p-2 -ml-2"
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900 flex-1">Paiement</Text>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        <Card className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-900">Consultation</Text>
            <Text className="text-lg font-bold text-blue-600">
              {amount.toLocaleString()} Ar
            </Text>
          </View>
          <View className="border-t border-gray-200 pt-4">
            <Text className="text-sm text-gray-600 mb-1">
              Médecin: {consultation.doctor.name}
            </Text>
            <Text className="text-sm text-gray-600">
              Spécialité: {consultation.doctor.specialty}
            </Text>
          </View>
        </Card>

        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Choisissez votre opérateur
        </Text>

        {operators.map((operator) => (
          <TouchableOpacity
            key={operator.id}
            onPress={() => setSelectedOperator(operator.id)}
            className="mb-3"
          >
            <Card
              className={`border-2 ${
                selectedOperator === operator.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200'
              }`}
            >
              <View className="flex-row items-center">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: `${operator.color}20` }}
                >
                  <Ionicons
                    name={operator.icon as any}
                    size={24}
                    color={operator.color}
                  />
                </View>
                <Text className="text-lg font-semibold text-gray-900 flex-1">
                  {operator.name}
                </Text>
                {selectedOperator === operator.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#2563EB" />
                )}
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        <Button
          title={`Payer ${amount.toLocaleString()} Ar`}
          onPress={handlePayment}
          isLoading={isProcessing}
          disabled={!selectedOperator}
          className="mt-6"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

