import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform, Linking } from 'react-native';

export async function downloadPDF(url: string, fileName: string): Promise<string> {
  const fileUri = FileSystem.documentDirectory + fileName;
  
  const downloadResult = await FileSystem.downloadAsync(url, fileUri);
  
  if (downloadResult.status !== 200) {
    throw new Error('Erreur lors du téléchargement du PDF');
  }
  
  return downloadResult.uri;
}

export async function sharePDF(fileUri: string, fileName: string): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();
  
  if (!isAvailable) {
    throw new Error('Le partage n\'est pas disponible sur cet appareil');
  }
  
  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/pdf',
    dialogTitle: `Partager ${fileName}`,
  });
}

export async function openPDF(fileUri: string): Promise<void> {
  const canOpen = await Linking.canOpenURL(fileUri);
  if (canOpen) {
    await Linking.openURL(fileUri);
  } else {
    throw new Error('Impossible d\'ouvrir le PDF');
  }
}

