// src/types/index.ts

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

export interface User {
  id: string;
  _id: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  profile: UserProfile;
}

export interface Appointment {
  _id: string;
  patient: User;
  doctor: User;
  dateTime: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  symptoms?: string;
  meetingLink?: string;
}

export interface Conversation {
  _id: string;
  participants: User[];
  lastMessage?: Message;
  lastActivity: string;
}

export interface Message {
  _id: string;
  sender: User;
  content: string;
  createdAt: string;
  conversation: string;
}

export interface AIAnalysis {
  _id: string;
  type: 'symptom' | 'vitals' | 'image' | 'voice';
  analysis: {
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
    suggestedSpecialty: string;
    urgency: 'low' | 'medium' | 'high' | 'emergency';
  };
  createdAt: string;
}

export interface Stats {
  upcomingAppointments: number;
  aiAnalyses: number;
  newMessages: number;
  prescriptionsReady: number;
}

export interface Prescription {
  _id: string;
  patient: User;
  doctor: User;
  medication: string;
  status: 'pending' | 'filled' | 'cancelled';
  createdAt: string;
}

export interface Activity {
  _id: string;
  type: 'appointment' | 'message' | 'ai-analysis' | 'prescription';
  description: string;
  timestamp: string;
  relatedId?: string; // ID of Appointment, Message, AIAnalysis, or Prescription
}

export interface DoctorProfile {
  specialty?: string;
  licenseNumber?: string;
  experience?: number;
  rating?: number;
  consultationFee?: number;
  bio?: string;
  verified?: boolean;
}

export interface Doctor extends User {
  doctorProfile: DoctorProfile;
}

export interface HealthMetrics {
  _id?: string;
  height?: number;
  weight?: number;
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  lastUpdated?: Date;
}


export interface MedicalRecord {
  _id: string;
  patient: User | { _id: string };
  doctor?: User | { _id: string };
  appointment?: string;
  type: 'consultation' | 'test' | 'prescription' | 'report';
  title?: string;
  description?: string;
  files?: Array<{
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
  }>;
  tags?: string[];
  isPrivate?: boolean;
  createdAt: Date;
  updatedAt?: Date;
}