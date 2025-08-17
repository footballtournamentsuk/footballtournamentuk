import React from 'react';
import { calculatePasswordStrength } from '@/utils/passwordStrength';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ 
  password, 
  className = "" 
}) => {
  const strength = calculatePasswordStrength(password);
  
  if (!password) {
    return null;
  }

  const getBarWidth = () => {
    return `${(strength.score / 4) * 100}%`;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Strength Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-300 ease-out rounded-full"
            style={{ 
              width: getBarWidth(),
              backgroundColor: strength.color
            }}
          />
        </div>
        <span 
          className="text-xs font-medium min-w-16 text-right"
          style={{ color: strength.color }}
        >
          {strength.label}
        </span>
      </div>
      
      {/* Suggestions */}
      {strength.suggestions.length > 0 && (
        <div className="text-xs text-muted-foreground space-y-1">
          {strength.suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-center gap-1">
              <span className="w-1 h-1 bg-muted-foreground rounded-full flex-shrink-0" />
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};