import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JournalEntry } from '../types';

interface JournalState {
  entries: JournalEntry[];
  isLoading: boolean;
  addEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  getEntriesByDate: (date: string) => JournalEntry[];
  getEntriesByType: (type: JournalEntry['type']) => JournalEntry[];
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: [],
      isLoading: false,
      addEntry: async (entryData) => {
        const newEntry: JournalEntry = {
          ...entryData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          entries: [newEntry, ...state.entries],
        }));
        // TODO: Appel API pour sauvegarder
      },
      deleteEntry: async (id) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        }));
        // TODO: Appel API pour supprimer
      },
      getEntriesByDate: (date) => {
        return get()
          .entries.filter((e) => e.date === date)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      },
      getEntriesByType: (type) => {
        return get()
          .entries.filter((e) => e.type === type)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      },
    }),
    {
      name: 'journal-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

