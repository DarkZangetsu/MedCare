import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useConsultationsStore } from '../../src/stores/consultationsStore';
import { Doctor } from '../../src/types';
import { apolloClient, GET_DOCTORS } from '../../src/services/api';
import { useQuery } from '@apollo/client';

export default function ConsultationsScreen() {
  const router = useRouter();
  const { doctors, setDoctors, consultations, setCurrentConsultation } = useConsultationsStore();
  const { loading } = useQuery(GET_DOCTORS, {
    onCompleted: (data) => {
      if (data?.doctors) {
        setDoctors(data.doctors);
      }
    },
  });

  // Mock doctors si pas de données
  useEffect(() => {
    if (doctors.length === 0) {
      const mockDoctors: Doctor[] = [
        {
          id: '1',
          name: 'Dr. Rakoto',
          specialty: 'Médecine générale',
          price: 15000,
          isOnline: true,
          rating: 4.8,
        },
        {
          id: '2',
          name: 'Dr. Rabe',
          specialty: 'Cardiologie',
          price: 25000,
          isOnline: true,
          rating: 4.9,
        },
        {
          id: '3',
          name: 'Dr. Rasoa',
          specialty: 'Pédiatrie',
          price: 20000,
          isOnline: false,
          rating: 4.7,
        },
      ];
      setDoctors(mockDoctors);
    }
  }, []);

  const handleStartConsultation = async (doctorId: string) => {
    const { addConsultation: addConsultationToStore } = useConsultationsStore.getState();
    const consultation = await addConsultationToStore(doctorId);
    setCurrentConsultation(consultation);
    router.push(`/chat/${consultation.id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Médecins disponibles</Text>
      </View>

      {consultations.length > 0 && (
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Mes consultations
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {consultations.slice(0, 5).map((consultation) => (
              <TouchableOpacity
                key={consultation.id}
                onPress={() => {
                  setCurrentConsultation(consultation);
                  router.push(`/chat/${consultation.id}`);
                }}
                className="mr-3"
              >
                <Card className="w-32">
                  <View className="items-center">
                    <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center mb-2">
                      <Ionicons name="person" size={32} color="#2563EB" />
                    </View>
                    <Text className="text-sm font-semibold text-gray-900 text-center" numberOfLines={1}>
                      {consultation.doctor.name}
                    </Text>
                    <Text className="text-xs text-gray-600 text-center" numberOfLines={1}>
                      {consultation.status}
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView className="flex-1 px-6 py-4">
        {loading ? (
          <View className="items-center justify-center py-12">
            <Text className="text-gray-600">Chargement...</Text>
          </View>
        ) : doctors.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="medical-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-600 text-center mt-4">
              Aucun médecin disponible
            </Text>
          </View>
        ) : (
          doctors.map((doctor) => (
            <Card key={doctor.id} className="mb-4">
              <View className="flex-row items-start">
                <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center mr-4">
                  {doctor.avatar ? (
                    <Image
                      source={{ uri: doctor.avatar }}
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <Ionicons name="person" size={32} color="#2563EB" />
                  )}
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-lg font-semibold text-gray-900 flex-1">
                      {doctor.name}
                    </Text>
                    {doctor.isOnline && (
                      <View className="flex-row items-center bg-green-100 px-2 py-1 rounded-full">
                        <View className="w-2 h-2 rounded-full bg-green-600 mr-1" />
                        <Text className="text-xs text-green-700 font-medium">En ligne</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-gray-600 mb-2">{doctor.specialty}</Text>
                  {doctor.rating && (
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="star" size={16} color="#F59E0B" />
                      <Text className="text-sm text-gray-700 ml-1">
                        {doctor.rating} / 5.0
                      </Text>
                    </View>
                  )}
                  <View className="flex-row items-center justify-between mt-2">
                    <Text className="text-lg font-bold text-blue-600">
                      {doctor.price.toLocaleString()} Ar
                    </Text>
                    <Button
                      title="Consulter"
                      onPress={() => handleStartConsultation(doctor.id)}
                      size="sm"
                    />
                  </View>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

