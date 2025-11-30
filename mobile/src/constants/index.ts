// Constantes de l'application

export const COLORS = {
  primary: '#4A90E2',
  secondary: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  background: '#F9FAFB',
  white: '#FFFFFF',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
};

export const OPERATORS = {
  mvola: {
    name: 'MVola',
    color: '#10B981',
  },
  orange: {
    name: 'Orange Money',
    color: '#FF6600',
  },
  airtel: {
    name: 'Airtel Money',
    color: '#E60012',
  },
} as const;

export const MEASUREMENT_TYPES = {
  glycemia: 'Glycémie',
  blood_pressure: 'Tension artérielle',
  weight: 'Poids',
  temperature: 'Température',
  other: 'Autre',
} as const;

export const REMINDER_TYPES = {
  medication: 'Médicament',
  appointment: 'Rendez-vous',
  analysis: 'Analyse',
} as const;

