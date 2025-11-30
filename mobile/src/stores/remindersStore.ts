import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Reminder } from '../types';

interface RemindersState {
  reminders: Reminder[];
  isLoading: boolean;
  addReminder: (reminder: Omit<Reminder, 'id'>) => Promise<void>;
  updateReminder: (id: string, reminder: Partial<Reminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  getUpcomingReminders: () => Reminder[];
}

export const useRemindersStore = create<RemindersState>()(
  persist(
    (set, get) => ({
      reminders: [],
      isLoading: false,
      addReminder: async (reminderData) => {
        const newReminder: Reminder = {
          ...reminderData,
          id: Date.now().toString(),
        };
        set((state) => ({
          reminders: [...state.reminders, newReminder],
        }));
        // TODO: Appel API pour sauvegarder
      },
      updateReminder: async (id, updates) => {
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
        // TODO: Appel API pour mettre à jour
      },
      deleteReminder: async (id) => {
        set((state) => ({
          reminders: state.reminders.filter((r) => r.id !== id),
        }));
        // TODO: Appel API pour supprimer
      },
      getUpcomingReminders: () => {
        const now = new Date();
        return get()
          .reminders.filter((r) => {
            if (!r.isActive) return false;
            const reminderDate = new Date(`${r.date}T${r.time}`);
            return reminderDate >= now;
          })
          .sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, 5);
      },
    }),
    {
      name: 'reminders-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

