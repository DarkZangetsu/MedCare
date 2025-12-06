// Types pour l'application MedCare Mobile

export interface User {
  id: string;
  phone: string;
  name?: string;
  age?: number;
  pathologies?: string[];
  createdAt: string;
}

export interface Reminder {
  id: string;
  type: 'medication' | 'appointment' | 'analysis';
  title: string;
  description?: string;
  date: string;
  time: string;
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
  endDate?: string;
  isActive: boolean;
  notificationId?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  type: 'note' | 'measurement' | 'photo';
  content?: string;
  measurementType?: 'glycemia' | 'blood_pressure' | 'weight' | 'temperature' | 'other';
  measurementValue?: number;
  measurementUnit?: string;
  photoUri?: string;
  createdAt: string;
}

export interface AITriageResult {
  id: string;
  symptoms: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  advice: string;
  recommendation: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatar?: string;
  price: number;
  isOnline: boolean;
  rating?: number;
}

export interface Consultation {
  id: string;
  doctorId: string;
  doctor: Doctor;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  consultationId: string;
  senderId: string;
  senderType: 'patient' | 'doctor';
  content?: string;
  photoUri?: string;
  audioUri?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  consultationId: string;
  amount: number;
  operator: 'mvola' | 'orange' | 'airtel';
  status: 'pending' | 'success' | 'failed';
  transactionId?: string;
  createdAt: string;
}

export interface MedicalPDF {
  id: string;
  consultationId: string;
  fileName: string;
  fileUri: string;
  createdAt: string;
}

