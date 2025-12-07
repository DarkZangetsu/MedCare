import { create } from 'zustand';
import { Reminder } from '../types';
import { apolloClient } from '../services/api';
import {
  GET_REMINDERS,
  CREATE_REMINDER,
  UPDATE_REMINDER,
  DELETE_REMINDER,
} from '../services/api';

interface RemindersState {
  reminders: Reminder[];
  isLoading: boolean;
  error: string | null;
  fetchReminders: () => Promise<void>;
  addReminder: (reminder: Omit<Reminder, 'id'>) => Promise<void>;
  updateReminder: (id: string, reminder: Partial<Reminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  getUpcomingReminders: () => Reminder[];
}

export const useRemindersStore = create<RemindersState>()((set, get) => ({
  reminders: [],
  isLoading: false,
  error: null,
  fetchReminders: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apolloClient.query({
        query: GET_REMINDERS,
        fetchPolicy: 'network-only',
      });
      const reminders = (data.reminders || []).map((r: any) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        description: r.description || undefined,
        date: r.date,
        time: r.time,
        frequency: r.frequency || 'once',
        endDate: r.endDate || undefined,
        isActive: r.isActive || r.is_active || true,
        notificationId: r.notificationId || r.notification_id || undefined,
      }));
      set({ reminders, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching reminders:', error);
      set({ error: error.message || 'Erreur lors du chargement des rappels', isLoading: false });
    }
  },
  addReminder: async (reminderData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_REMINDER,
        variables: {
          type: reminderData.type,
          title: reminderData.title,
          description: reminderData.description || null,
          date: reminderData.date,
          time: reminderData.time,
          frequency: reminderData.frequency || 'once',
          endDate: reminderData.endDate || null,
          notificationId: reminderData.notificationId || null,
        },
      });
      
      console.log('Create reminder response:', JSON.stringify(data, null, 2));
      
      if (!data?.createReminder?.reminder) {
        throw new Error('Le serveur n\'a pas retourné de rappel créé');
      }
      
      const newReminder = data.createReminder.reminder;
      
      if (!newReminder.id) {
        throw new Error('Le rappel créé n\'a pas d\'identifiant');
      }
      
      const reminder: Reminder = {
        id: newReminder.id,
        type: newReminder.type,
        title: newReminder.title,
        description: newReminder.description || undefined,
        date: newReminder.date,
        time: newReminder.time,
        frequency: newReminder.frequency || 'once',
        endDate: newReminder.endDate || undefined,
        isActive: newReminder.isActive || newReminder.is_active || true,
        notificationId: newReminder.notificationId || newReminder.notification_id || undefined,
      };
      set((state) => ({
        reminders: [...state.reminders, reminder],
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Error creating reminder:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      const errorMessage = error?.message || 
                          error?.graphQLErrors?.[0]?.message || 
                          error?.networkError?.message ||
                          'Erreur lors de la création du rappel';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },
  updateReminder: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const variables: any = { id };
      if (updates.type !== undefined) variables.type = updates.type;
      if (updates.title !== undefined) variables.title = updates.title;
      if (updates.description !== undefined) variables.description = updates.description || null;
      if (updates.date !== undefined) variables.date = updates.date;
      if (updates.time !== undefined) variables.time = updates.time;
      if (updates.isActive !== undefined) variables.isActive = updates.isActive;
      if (updates.notificationId !== undefined) variables.notificationId = updates.notificationId || null;

      const { data } = await apolloClient.mutate({
        mutation: UPDATE_REMINDER,
        variables,
      });
      const updatedReminder = data.updateReminder.reminder;
      const reminder: Reminder = {
        id: updatedReminder.id,
        type: updatedReminder.type,
        title: updatedReminder.title,
        description: updatedReminder.description || undefined,
        date: updatedReminder.date,
        time: updatedReminder.time,
        isActive: updatedReminder.isActive || updatedReminder.is_active || true,
        notificationId: updatedReminder.notificationId || updatedReminder.notification_id || undefined,
      };
      set((state) => ({
        reminders: state.reminders.map((r) => (r.id === id ? reminder : r)),
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Error updating reminder:', error);
      set({ error: error.message || 'Erreur lors de la mise à jour du rappel', isLoading: false });
      throw error;
    }
  },
  deleteReminder: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apolloClient.mutate({
        mutation: DELETE_REMINDER,
        variables: { id },
      });
      set((state) => ({
        reminders: state.reminders.filter((r) => r.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Error deleting reminder:', error);
      set({ error: error.message || 'Erreur lors de la suppression du rappel', isLoading: false });
      throw error;
    }
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
}));

