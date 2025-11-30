export interface User {
  id: string;
  email: string;
  role: "doctor" | "admin";
  name?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatar?: string;
  price: number;
  isOnline: boolean;
  rating?: number;
  user: User;
}

export interface Patient {
  id: string;
  phone: string;
  name?: string;
  age?: number;
  pathologies?: string[];
}

export interface Consultation {
  id: string;
  patient: Patient;
  doctor: Doctor;
  status: "pending" | "active" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  consultation: string;
  senderId: string;
  senderType: "patient" | "doctor";
  content?: string;
  photoUrl?: string;
  audioUrl?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  consultation: Consultation;
  amount: number;
  operator: "mvola" | "orange" | "airtel";
  status: "pending" | "success" | "failed";
  transactionId?: string;
  createdAt: string;
}

