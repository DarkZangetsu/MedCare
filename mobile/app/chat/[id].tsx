import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useConsultationsStore } from '../../src/stores/consultationsStore';
import { Message } from '../../src/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuthStore } from '../../src/stores/authStore';

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentConsultation, addMessage, consultations } = useConsultationsStore();
  const { user } = useAuthStore();
  const [message, setMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  
  const consultation = currentConsultation || consultations.find((c) => c.id === id);

  useEffect(() => {
    if (consultation && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [consultation?.messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !consultation) return;

    await addMessage(consultation.id, {
      consultationId: consultation.id,
      senderId: user?.id || '',
      senderType: 'patient',
      content: message.trim(),
    });
    setMessage('');
  };

  const handlePickImage = async () => {
    if (!consultation) return;
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await addMessage(consultation.id, {
        consultationId: consultation.id,
        senderId: user?.id || '',
        senderType: 'patient',
        photoUri: result.assets[0].uri,
      });
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
      <View className="bg-white px-4 py-3 border-b border-gray-200 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">
            {consultation.doctor.name}
          </Text>
          <Text className="text-sm text-gray-600">{consultation.doctor.specialty}</Text>
        </View>
        {consultation.status === 'completed' && (
          <TouchableOpacity
            onPress={() => router.push(`/payment/${consultation.id}`)}
            className="ml-2"
          >
            <Ionicons name="card-outline" size={24} color="#2563EB" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4 py-4"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {consultation.messages.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-600 text-center mt-4">
              Aucun message pour le moment
            </Text>
          </View>
        ) : (
          consultation.messages.map((msg) => {
            const isPatient = msg.senderType === 'patient';
            return (
              <View
                key={msg.id}
                className={`mb-4 ${isPatient ? 'items-end' : 'items-start'}`}
              >
                <View
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    isPatient ? 'bg-blue-600' : 'bg-white border border-gray-200'
                  }`}
                >
                  {msg.photoUri && (
                    <Image
                      source={{ uri: msg.photoUri }}
                      className="w-full h-48 rounded-lg mb-2"
                      resizeMode="cover"
                    />
                  )}
                  {msg.content && (
                    <Text
                      className={`text-base ${
                        isPatient ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {msg.content}
                    </Text>
                  )}
                  <Text
                    className={`text-xs mt-1 ${
                      isPatient ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {format(new Date(msg.createdAt), 'HH:mm', { locale: fr })}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <View className="bg-white border-t border-gray-200 px-4 py-3 flex-row items-center">
          <TouchableOpacity
            onPress={handlePickImage}
            className="mr-3 p-2"
          >
            <Ionicons name="image-outline" size={24} color="#6B7280" />
          </TouchableOpacity>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Tapez votre message..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-3"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!message.trim()}
            className={`p-2 rounded-full ${
              message.trim() ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <Ionicons
              name="send"
              size={20}
              color={message.trim() ? '#FFFFFF' : '#9CA3AF'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

