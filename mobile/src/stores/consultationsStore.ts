import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Consultation, Doctor, Message, Payment } from '../types';

interface ConsultationsState {
  doctors: Doctor[];
  consultations: Consultation[];
  currentConsultation: Consultation | null;
  isLoading: boolean;
  setDoctors: (doctors: Doctor[]) => void;
  addConsultation: (doctorId: string) => Promise<Consultation>;
  addMessage: (consultationId: string, message: Omit<Message, 'id' | 'createdAt'>) => Promise<void>;
  setCurrentConsultation: (consultation: Consultation | null) => void;
  updateConsultationStatus: (id: string, status: Consultation['status']) => Promise<void>;
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => Promise<void>;
}

export const useConsultationsStore = create<ConsultationsState>()(
  persist(
    (set, get) => ({
      doctors: [],
      consultations: [],
      currentConsultation: null,
      isLoading: false,
      setDoctors: (doctors) => set({ doctors }),
      addConsultation: async (doctorId) => {
        const doctor = get().doctors.find((d) => d.id === doctorId);
        if (!doctor) throw new Error('Doctor not found');
        
        const newConsultation: Consultation = {
          id: Date.now().toString(),
          doctorId,
          doctor,
          status: 'pending',
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          consultations: [newConsultation, ...state.consultations],
        }));
        
        return newConsultation;
      },
      addMessage: async (consultationId, messageData) => {
        const newMessage: Message = {
          ...messageData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          consultations: state.consultations.map((c) =>
            c.id === consultationId
              ? {
                  ...c,
                  messages: [...c.messages, newMessage],
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
          currentConsultation:
            state.currentConsultation?.id === consultationId
              ? {
                  ...state.currentConsultation,
                  messages: [...state.currentConsultation.messages, newMessage],
                  updatedAt: new Date().toISOString(),
                }
              : state.currentConsultation,
        }));
        // TODO: Envoyer message via WebSocket/API
      },
      setCurrentConsultation: (consultation) => set({ currentConsultation: consultation }),
      updateConsultationStatus: async (id, status) => {
        set((state) => ({
          consultations: state.consultations.map((c) =>
            c.id === id ? { ...c, status, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },
      addPayment: async (paymentData) => {
        // TODO: Appel API pour créer le paiement
        console.log('Payment created:', paymentData);
      },
    }),
    {
      name: 'consultations-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

