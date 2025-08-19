import React, { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useAuthSecurity } from '@/hooks/useAuthSecurity';
import { useSessionManager } from '@/hooks/useSessionManager';
import { InlineValidation } from '@/components/InlineValidation';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import { validateEmail } from '@/utils/authErrors';
import { Eye, EyeOff, Mail, Lock, UserPlus, LogIn, User, Shield, AlertTriangle, Clock } from 'lucide-react';
import logo from '/bimi-logo.svg';

const AuthPage = () => {
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Validation state
  const [emailValid, setEmailValid] = useState(true);
  const [passwordValid, setPasswordValid] = useState(true);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(true);
  
  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  // Hooks
  const { user, signUp, signIn, resetPassword } = useAuth();
  const { toast } = useToast();
  const { 
    isLocked, 
    remainingAttempts, 
    remainingTime, 
    recordAttempt, 
    checkSecurity 
  } = useAuthSecurity();
  const { setRememberMe: setSessionRememberMe } = useSessionManager();
  
  // URL params for mode switching
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');

  // Set remember me in session manager when it changes
  useEffect(() => {
    setSessionRememberMe(rememberMe);
  }, [rememberMe, setSessionRememberMe]);

  // Handle password reset mode
  useEffect(() => {
    if (mode === 'reset') {
      setShowForgotPassword(true);
    }
  }, [mode]);

  // Store intended URL for redirect after login
  useEffect(() => {
    const intendedUrl = searchParams.get('redirect');
    if (intendedUrl) {
      sessionStorage.setItem('intended-url', intendedUrl);
    }
  }, [searchParams]);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Security check
    if (!checkSecurity()) return;
    
    // Validation
    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return;
    }

    if (!emailValid || !email) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!passwordValid || !password) {
      toast({
        title: "Invalid Password",
        description: "Please enter a valid password that meets the requirements",
        variant: "destructive",
      });
      return;
    }

    if (!confirmPasswordValid || password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please ensure both passwords match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signUp(email, password, name, rememberMe);
      
      if (error) {
        recordAttempt('signup');
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      recordAttempt('signup');
      toast({
        title: "Sign Up Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Security check
    if (!checkSecurity()) return;

    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signIn(email, password, rememberMe);
      
      if (error) {
        recordAttempt('signin');
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      recordAttempt('signin');
      toast({
        title: "Sign In Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Security check
    if (!checkSecurity()) return;

    if (!forgotPasswordEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(forgotPasswordEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await resetPassword(forgotPasswordEmail);
      
      if (error) {
        recordAttempt('reset');
        toast({
          title: "Reset Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setResetEmailSent(true);
        toast({
          title: "Reset Email Sent",
          description: "Check your email for password reset instructions",
        });
      }
    } catch (err) {
      recordAttempt('reset');
      toast({
        title: "Reset Failed", 
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex flex-col">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 p-4 sm:p-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="Football Tournaments UK logo" 
              className="w-8 h-8 sm:w-10 sm:h-10" 
            />
            <h1 className="text-lg sm:text-xl font-bold text-foreground">
              Football Tournaments UK
            </h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md space-y-6">
          
          {/* Security warning */}
          {isLocked && (
            <Alert variant="destructive" className="mb-6">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Account temporarily locked due to multiple failed attempts. 
                Time remaining: {remainingTime}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Rate limit warning */}
          {!isLocked && remainingAttempts <= 2 && remainingAttempts > 0 && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {remainingAttempts} attempt{remainingAttempts === 1 ? '' : 's'} remaining before temporary lockout
              </AlertDescription>
            </Alert>
          )}

          <Card className="border-border/20 bg-card/95 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4 pb-6">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold">
                  Welcome to Football Tournaments UK
                </CardTitle>
                <CardDescription className="text-base">
                  Sign in to your account or create a new one to get started
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              {!showForgotPassword ? (
                <Tabs defaultValue="signin" className="space-y-6">
                  <TabsList className="grid grid-cols-2 w-full h-12 touch-manipulation">
                    <TabsTrigger 
                      value="signin" 
                      className="flex items-center gap-2 min-h-[44px]"
                      disabled={isLocked}
                    >
                      <LogIn className="w-4 h-4" />
                      <span className="hidden sm:inline">Sign In</span>
                      <span className="sm:hidden">Sign In</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="signup" 
                      className="flex items-center gap-2 min-h-[44px]"
                      disabled={isLocked}
                    >
                      <UserPlus className="w-4 h-4" />
                      <span className="hidden sm:inline">Sign Up</span>
                      <span className="sm:hidden">Sign Up</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Sign In Form */}
                  <TabsContent value="signin" className="space-y-4">
                    <form onSubmit={handleSignIn} className="space-y-4" noValidate>
                      <div className="space-y-2">
                        <Label htmlFor="signin-email" className="sr-only sm:not-sr-only">
                          Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="signin-email"
                            name="email"
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-12 touch-manipulation"
                            disabled={isLocked || isLoading}
                            autoComplete="email"
                            autoCapitalize="none"
                            spellCheck={false}
                            aria-describedby="signin-email-validation"
                            required
                          />
                        </div>
                        <InlineValidation
                          value={email}
                          type="email"
                          onValidationChange={setEmailValid}
                          debounceMs={500}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signin-password" className="sr-only sm:not-sr-only">
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="signin-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-10 h-12 touch-manipulation"
                            disabled={isLocked || isLoading}
                            autoComplete="current-password"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent touch-manipulation"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLocked}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="remember-signin"
                            checked={rememberMe}
                            onCheckedChange={(checked) => setRememberMe(!!checked)}
                            disabled={isLocked || isLoading}
                            className="touch-manipulation"
                          />
                          <Label 
                            htmlFor="remember-signin" 
                            className="text-sm font-normal cursor-pointer"
                          >
                            Remember me
                          </Label>
                        </div>
                        
                        <Button
                          type="button"
                          variant="link"
                          className="px-0 font-normal text-sm h-auto touch-manipulation"
                          onClick={() => setShowForgotPassword(true)}
                          disabled={isLocked}
                        >
                          Forgot password?
                        </Button>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 touch-manipulation"
                        disabled={isLocked || isLoading || !emailValid}
                        aria-describedby={isLocked ? "security-warning" : undefined}
                      >
                        {isLoading ? (
                          <>
                            <Clock className="mr-2 h-4 w-4 animate-spin" />
                            Signing In...
                          </>
                        ) : (
                          <>
                            <LogIn className="mr-2 h-4 w-4" />
                            Sign In
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Sign Up Form */}
                  <TabsContent value="signup" className="space-y-4">
                    <form onSubmit={handleSignUp} className="space-y-4" noValidate>
                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="sr-only sm:not-sr-only">
                          Full Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="signup-name"
                            name="name"
                            type="text"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-10 h-12 touch-manipulation"
                            disabled={isLocked || isLoading}
                            autoComplete="name"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="sr-only sm:not-sr-only">
                          Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="signup-email"
                            name="email"
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-12 touch-manipulation"
                            disabled={isLocked || isLoading}
                            autoComplete="email"
                            autoCapitalize="none"
                            spellCheck={false}
                            aria-describedby="signup-email-validation"
                            required
                          />
                        </div>
                        <InlineValidation
                          value={email}
                          type="email"
                          onValidationChange={setEmailValid}
                          debounceMs={500}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="sr-only sm:not-sr-only">
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="signup-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-10 h-12 touch-manipulation"
                            disabled={isLocked || isLoading}
                            autoComplete="new-password"
                            aria-describedby="signup-password-strength"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent touch-manipulation"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLocked}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <PasswordStrengthIndicator 
                          password={password} 
                          className="mt-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-confirm-password" className="sr-only sm:not-sr-only">
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="signup-confirm-password"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 pr-10 h-12 touch-manipulation"
                            disabled={isLocked || isLoading}
                            autoComplete="new-password"
                            aria-describedby="signup-confirm-password-validation"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent touch-manipulation"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isLocked}
                            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <InlineValidation
                          value={confirmPassword}
                          type="confirmPassword"
                          compareValue={password}
                          onValidationChange={setConfirmPasswordValid}
                          debounceMs={300}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember-signup"
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(!!checked)}
                          disabled={isLocked || isLoading}
                          className="touch-manipulation"
                        />
                        <Label 
                          htmlFor="remember-signup" 
                          className="text-sm font-normal cursor-pointer"
                        >
                          Keep me signed in
                        </Label>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 touch-manipulation"
                        disabled={
                          isLocked || 
                          isLoading || 
                          !emailValid || 
                          !passwordValid || 
                          !confirmPasswordValid ||
                          !name.trim()
                        }
                      >
                        {isLoading ? (
                          <>
                            <Clock className="mr-2 h-4 w-4 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Create Account
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              ) : (
                // Forgot Password Form
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">Reset Your Password</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                  </div>

                  {resetEmailSent ? (
                    <div className="text-center space-y-4">
                      <div className="mx-auto w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                        <Mail className="w-6 h-6 text-success" />
                      </div>
                      <div>
                        <p className="font-medium">Check your email</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          We've sent password reset instructions to {forgotPasswordEmail}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full h-12 touch-manipulation"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setResetEmailSent(false);
                          setForgotPasswordEmail('');
                        }}
                      >
                        Back to Sign In
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPassword} className="space-y-4" noValidate>
                      <div className="space-y-2">
                        <Label htmlFor="forgot-email" className="sr-only sm:not-sr-only">
                          Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="forgot-email"
                            name="email"
                            type="email"
                            placeholder="Enter your email address"
                            value={forgotPasswordEmail}
                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            className="pl-10 h-12 touch-manipulation"
                            disabled={isLocked || isLoading}
                            autoComplete="email"
                            autoCapitalize="none"
                            spellCheck={false}
                            required
                          />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 h-12 touch-manipulation"
                          onClick={() => setShowForgotPassword(false)}
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 h-12 touch-manipulation"
                          disabled={isLocked || isLoading || !forgotPasswordEmail}
                        >
                          {isLoading ? (
                            <>
                              <Clock className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Reset Link
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="pt-6 text-center space-y-4">
                <p className="text-xs text-muted-foreground">
                  By signing up, you agree to our{' '}
                  <a href="/policies" className="text-primary hover:underline focus:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/policies" className="text-primary hover:underline focus:underline">
                    Privacy Policy
                  </a>
                </p>
                
                <Button
                  variant="link"
                  className="text-sm h-auto p-0 touch-manipulation"
                  onClick={() => window.history.back()}
                >
                  ← Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;