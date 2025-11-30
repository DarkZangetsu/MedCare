import { View, Text, TouchableOpacity } from 'react-native';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
}

export function Card({ children, className, onPress }: CardProps) {
  const content = (
    <View
      className={cn(
        'bg-white rounded-xl p-4 shadow-sm border border-gray-200',
        className
      )}
    >
      {children}
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  }

  return content;
}

