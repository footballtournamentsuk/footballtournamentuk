export interface AuthError {
  message: string;
  code?: string;
}

export const sanitizeAuthError = (error: any): AuthError => {
  // Default generic message to prevent account enumeration
  const defaultMessage = "Authentication failed. Please check your credentials and try again.";
  
  if (!error) {
    return { message: defaultMessage };
  }

  // Handle Supabase auth errors safely
  switch (error.message) {
    case 'Invalid login credentials':
    case 'Email not confirmed':
    case 'User not found':
    case 'Invalid email or password':
      return { 
        message: "Invalid email or password. Please check your credentials and try again.",
        code: 'invalid_credentials'
      };

    case 'Email rate limit exceeded':
    case 'Too many requests':
      return { 
        message: "Too many requests. Please wait before trying again.",
        code: 'rate_limited'
      };

    case 'Password should be at least 6 characters':
      return { 
        message: "Password must be at least 6 characters long.",
        code: 'weak_password'
      };

    case 'User already registered':
      return { 
        message: "An account with this email already exists. Try signing in instead.",
        code: 'user_exists'
      };

    case 'Invalid email':
      return { 
        message: "Please enter a valid email address.",
        code: 'invalid_email'
      };

    case 'Signup is disabled':
      return { 
        message: "Account registration is currently disabled. Please contact support.",
        code: 'signup_disabled'
      };

    case 'Email link is invalid or has expired':
      return { 
        message: "The verification link is invalid or has expired. Please request a new one.",
        code: 'invalid_link'
      };

    case 'Token has expired or is invalid':
      return { 
        message: "The verification token has expired. Please request a new verification email.",
        code: 'expired_token'
      };

    default:
      // Log the actual error for debugging but don't expose it
      console.error('Auth error (sanitized):', error);
      return { 
        message: defaultMessage,
        code: 'unknown_error'
      };
  }
};

export const getPasswordRequirements = () => [
  { text: 'At least 8 characters long', minLength: 8 },
  { text: 'Contains uppercase and lowercase letters', pattern: /^(?=.*[a-z])(?=.*[A-Z])/ },
  { text: 'Contains at least one number', pattern: /\d/ },
  { text: 'Contains at least one special character', pattern: /[^a-zA-Z0-9]/ }
];

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const requirements = getPasswordRequirements();
  const errors: string[] = [];

  if (password.length < requirements[0].minLength) {
    errors.push(requirements[0].text);
  }

  requirements.slice(1).forEach(req => {
    if (req.pattern && !req.pattern.test(password)) {
      errors.push(req.text);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};