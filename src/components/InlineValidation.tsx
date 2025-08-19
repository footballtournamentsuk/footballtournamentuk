import React, { useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { validateEmail, validatePassword } from '@/utils/authErrors';
import { calculatePasswordStrength } from '@/utils/passwordStrength';

interface ValidationState {
  isValid: boolean;
  message?: string;
  type?: 'success' | 'error' | 'warning';
}

interface InlineValidationProps {
  value: string;
  type: 'email' | 'password' | 'confirmPassword';
  compareValue?: string; // For password confirmation
  onValidationChange?: (isValid: boolean) => void;
  debounceMs?: number;
  className?: string;
  showOnFocus?: boolean;
}

export const InlineValidation: React.FC<InlineValidationProps> = ({
  value,
  type,
  compareValue,
  onValidationChange,
  debounceMs = 300,
  className = "",
  showOnFocus = true
}) => {
  const [validation, setValidation] = useState<ValidationState>({ isValid: true });
  const [shouldShow, setShouldShow] = useState(false);

  const validateValue = useCallback((val: string, compareVal?: string) => {
    if (!val && !shouldShow) {
      setValidation({ isValid: true });
      onValidationChange?.(true);
      return;
    }

    let result: ValidationState = { isValid: true };

    switch (type) {
      case 'email':
        if (!val) {
          result = { isValid: true };
        } else if (!validateEmail(val)) {
          result = {
            isValid: false,
            message: 'Please enter a valid email address',
            type: 'error'
          };
        } else {
          result = {
            isValid: true,
            message: 'Email format is valid',
            type: 'success'
          };
        }
        break;

      case 'password':
        if (!val) {
          result = { isValid: true };
        } else {
          const passwordValidation = validatePassword(val);
          const strength = calculatePasswordStrength(val);
          
          if (!passwordValidation.valid) {
            result = {
              isValid: false,
              message: passwordValidation.errors[0],
              type: 'error'
            };
          } else if (strength.score < 3) {
            result = {
              isValid: true,
              message: `Password strength: ${strength.label}`,
              type: 'warning'
            };
          } else {
            result = {
              isValid: true,
              message: `Strong password`,
              type: 'success'
            };
          }
        }
        break;

      case 'confirmPassword':
        if (!val) {
          result = { isValid: true };
        } else if (!compareVal) {
          result = {
            isValid: false,
            message: 'Please enter a password first',
            type: 'error'
          };
        } else if (val !== compareVal) {
          result = {
            isValid: false,
            message: 'Passwords do not match',
            type: 'error'
          };
        } else {
          result = {
            isValid: true,
            message: 'Passwords match',
            type: 'success'
          };
        }
        break;
    }

    setValidation(result);
    onValidationChange?.(result.isValid);
  }, [type, onValidationChange, shouldShow]);

  // Debounced validation
  React.useEffect(() => {
    const timer = setTimeout(() => {
      validateValue(value, compareValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, compareValue, validateValue, debounceMs]);

  // Show validation on focus/blur
  const handleFocus = () => {
    if (showOnFocus) {
      setShouldShow(true);
    }
  };

  const handleBlur = () => {
    // Keep showing if there's a value or error
    if (!value && validation.isValid) {
      setShouldShow(false);
    }
  };

  // Don't render if not showing and no message
  if (!shouldShow && !validation.message) {
    return null;
  }

  // Don't show success for empty values unless explicitly showing
  if (!value && validation.type === 'success' && !shouldShow) {
    return null;
  }

  const getIcon = () => {
    switch (validation.type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      default:
        return null;
    }
  };

  const getTextColor = () => {
    switch (validation.type) {
      case 'success':
        return 'text-success';
      case 'error':
        return 'text-destructive';
      case 'warning':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div 
      className={`flex items-center gap-2 mt-1 text-sm transition-all duration-200 ${className}`}
      onFocus={handleFocus}
      onBlur={handleBlur}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {getIcon()}
      <span className={getTextColor()}>
        {validation.message}
      </span>
    </div>
  );
};
