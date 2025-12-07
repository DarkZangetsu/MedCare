import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { useConsultationsStore } from '../../src/stores/consultationsStore';
import { downloadPDF, sharePDF, openPDF } from '../../src/services/storage';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function PDFScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { consultations } = useConsultationsStore();
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const consultation = consultations.find((c) => c.id === id);

  useEffect(() => {
    if (consultation) {
      loadPDF();
    }
  }, [consultation]);

  const loadPDF = async () => {
    if (!consultation) return;

    setIsDownloading(true);
    try {
      // TODO: Récupérer l'URL du PDF depuis l'API
      const mockPdfUrl = `https://example.com/pdf/${consultation.id}.pdf`;
      const fileName = `consultation_${consultation.id}_${format(new Date(), 'yyyyMMdd')}.pdf`;
      
      const downloadedUri = await downloadPDF(mockPdfUrl, fileName);
      setPdfUri(downloadedUri);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de télécharger le PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!pdfUri || !consultation) return;

    try {
      const fileName = `consultation_${consultation.id}.pdf`;
      await sharePDF(pdfUri, fileName);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de partager le PDF');
    }
  };

  const handleOpen = async () => {
    if (!pdfUri) return;

    try {
      await openPDF(pdfUri);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible d\'ouvrir le PDF');
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
        <Text className="text-2xl font-bold text-gray-900 flex-1">Document médical</Text>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        <Card className="mb-6">
          <View className="items-center py-6">
            <View className="w-20 h-20 rounded-full bg-red-100 items-center justify-center mb-4">
              <Ionicons name="document-text" size={40} color="#DC2626" />
            </View>
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Consultation du {format(new Date(consultation.createdAt), "d MMMM yyyy", { locale: fr })}
            </Text>
            <Text className="text-gray-600 text-center">
              Dr. {consultation.doctor.name}
            </Text>
            <Text className="text-gray-600 text-center">
              {consultation.doctor.specialty}
            </Text>
          </View>
        </Card>

        {isDownloading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text className="text-gray-600 mt-4">Téléchargement du PDF...</Text>
          </View>
        ) : pdfUri ? (
          <>
            <Card className="mb-4 bg-green-50 border-green-200">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text className="text-green-900 ml-3 flex-1">
                  PDF téléchargé avec succès
                </Text>
              </View>
            </Card>

            <View className="flex-row mb-4">
              <Button
                title="Ouvrir"
                onPress={handleOpen}
                variant="primary"
                className="flex-1 mr-2"
              />
              <Button
                title="Partager"
                onPress={handleShare}
                variant="outline"
                className="flex-1 ml-2"
              />
            </View>

            <Card className="bg-blue-50 border-blue-200">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={24} color="#2563EB" />
                <Text className="text-blue-900 ml-3 flex-1 text-sm">
                  Vous pouvez partager ce document via WhatsApp, email ou d'autres applications.
                </Text>
              </View>
            </Card>
          </>
        ) : (
          <View className="items-center justify-center py-12">
            <Ionicons name="document-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-600 text-center mt-4">
              Aucun document disponible
            </Text>
            <Button
              title="Réessayer"
              onPress={loadPDF}
              className="mt-6"
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

