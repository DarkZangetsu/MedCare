import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { cn } from '../../utils/cn';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className,
}: ButtonProps) {
  const baseStyles = 'rounded-lg items-center justify-center';
  
  const variantStyles = {
    primary: 'bg-blue-600 active:bg-blue-700',
    secondary: 'bg-gray-200 active:bg-gray-300',
    outline: 'border-2 border-blue-600 bg-transparent',
    danger: 'bg-red-600 active:bg-red-700',
  };
  
  const sizeStyles = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4',
  };
  
  const textVariantStyles = {
    primary: 'text-white',
    secondary: 'text-gray-900',
    outline: 'text-blue-600',
    danger: 'text-white',
  };
  
  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        (disabled || isLoading) && 'opacity-50',
        className
      )}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' ? '#2563EB' : '#FFFFFF'} />
      ) : (
        <Text
          className={cn(
            'font-semibold',
            textVariantStyles[variant],
            textSizeStyles[size]
          )}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

