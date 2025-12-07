import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { Reminder } from '../types';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token = null;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4A90E2',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }
      
      // Essayer d'obtenir le token push (nécessite projectId pour les push notifications)
      // Les notifications locales fonctionnent sans projectId
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      
      if (projectId) {
        try {
          const expoPushToken = await Notifications.getExpoPushTokenAsync({
            projectId: projectId,
          });
          token = expoPushToken.data;
        } catch (error: any) {
          console.warn('Failed to get Expo push token:', error.message);
          // Les notifications locales fonctionneront toujours
        }
      } else {
        // Pas de projectId configuré - les notifications locales fonctionneront toujours
        console.log('No projectId found. Push notifications disabled, but local notifications will work.');
        console.log('To enable push notifications, run: eas init');
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }
  } catch (error) {
    console.warn('Error registering for push notifications:', error);
    // Continuer sans push token - les notifications locales fonctionneront
  }

  return token;
}

export async function scheduleReminderNotification(reminder: Reminder): Promise<string> {
  const notificationDate = new Date(`${reminder.date}T${reminder.time}`);
  const now = new Date();
  
  if (notificationDate <= now) {
    throw new Error('La date du rappel doit être dans le futur');
  }

  // Pour les rappels récurrents, programmer plusieurs notifications
  if (reminder.frequency && reminder.frequency !== 'once' && reminder.endDate) {
    const endDate = new Date(reminder.endDate);
    const notifications: string[] = [];
    let currentDate = new Date(notificationDate);
    
    while (currentDate <= endDate) {
      if (currentDate >= now) {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `Rappel: ${reminder.title}`,
            body: reminder.description || `N'oubliez pas votre ${reminder.type === 'medication' ? 'médicament' : reminder.type === 'appointment' ? 'rendez-vous' : 'analyse'}`,
            data: { reminderId: reminder.id },
            sound: true,
          },
          trigger: currentDate,
        });
        notifications.push(notificationId);
      }
      
      // Calculer la prochaine date selon la fréquence
      if (reminder.frequency === 'daily') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (reminder.frequency === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (reminder.frequency === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else {
        break;
      }
    }
    
    // Retourner le premier ID de notification (on stocke le premier, les autres sont programmées)
    return notifications[0] || '';
  } else {
    // Rappel unique
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Rappel: ${reminder.title}`,
        body: reminder.description || `N'oubliez pas votre ${reminder.type === 'medication' ? 'médicament' : reminder.type === 'appointment' ? 'rendez-vous' : 'analyse'}`,
        data: { reminderId: reminder.id },
        sound: true,
      },
      trigger: notificationDate,
    });

    return notificationId;
  }
}

export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

