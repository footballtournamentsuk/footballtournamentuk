export interface PasswordStrength {
  score: number; // 0-4 (weak to strong)
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  suggestions: string[];
}

export const calculatePasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  const suggestions: string[] = [];

  // Length check
  if (password.length >= 8) {
    score++;
  } else {
    suggestions.push('Use at least 8 characters');
  }

  if (password.length >= 12) {
    score++;
  }

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++;
  } else {
    suggestions.push('Mix uppercase and lowercase letters');
  }

  if (/\d/.test(password)) {
    score++;
  } else {
    suggestions.push('Include at least one number');
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score++;
  } else {
    suggestions.push('Add special characters (!@#$%^&*)');
  }

  // Common patterns to avoid
  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 1);
    suggestions.push('Avoid repeating characters');
  }

  // Map score to strength
  const strengthMap = {
    0: { label: 'Very Weak' as const, color: 'hsl(var(--destructive))' },
    1: { label: 'Weak' as const, color: 'hsl(var(--destructive))' },
    2: { label: 'Fair' as const, color: 'hsl(35, 91%, 50%)' }, // Orange
    3: { label: 'Good' as const, color: 'hsl(45, 93%, 47%)' }, // Yellow
    4: { label: 'Strong' as const, color: 'hsl(var(--primary))' },
    5: { label: 'Strong' as const, color: 'hsl(var(--primary))' }
  };

  const strength = strengthMap[Math.min(5, score) as keyof typeof strengthMap];

  return {
    score: Math.min(4, score),
    label: strength.label,
    color: strength.color,
    suggestions: suggestions.slice(0, 2) // Limit to 2 most important suggestions
  };
};