import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, UserPlus, LogIn, User, PoundSterling, Clock, Shield } from 'lucide-react';

const AuthPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const { user, signUp, signIn, resetPassword } = useAuth();
  const { toast } = useToast();

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(email, password, name);
    
    if (error) {
      toast({
        title: "Sign Up Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Account created successfully! Please check your email to confirm your account.",
      });
    }
    setIsLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error", 
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Sign In Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in",
      });
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await resetPassword(forgotPasswordEmail);
    
    if (error) {
      toast({
        title: "Reset Password Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your email for password reset instructions.",
      });
      setShowForgotPassword(false);
      setForgotPasswordEmail('');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-football-primary/10 via-transparent to-football-secondary/10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-football-primary drop-shadow-lg">
              FOOTBALL TOURNAMENTS
            </h1>
          </div>
        </div>
        
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/20 backdrop-blur-sm border border-white/30">
            <TabsTrigger value="signin" className="flex items-center gap-2 data-[state=active]:bg-white/90 data-[state=active]:text-primary transition-all duration-300">
              <LogIn className="w-4 h-4" />
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex items-center gap-2 data-[state=active]:bg-white/90 data-[state=active]:text-primary transition-all duration-300">
              <UserPlus className="w-4 h-4" />
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card className="bg-white/90 backdrop-blur-md border border-white/20 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-football-primary">Welcome Back</CardTitle>
                <CardDescription>
                  Sign in to your organizer account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="organizer@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 bg-white/80 border-2 border-transparent focus:border-primary/50 focus:bg-white transition-all duration-300"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-12 bg-white/80 border-2 border-transparent focus:border-primary/50 focus:bg-white transition-all duration-300"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Forgot Password Link */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-muted-foreground hover:text-foreground underline"
                    >
                      Forgot your password?
                    </button>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-primary to-football-primary hover:from-primary/90 hover:to-football-primary/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-pulse hover:animate-none" 
                    style={{ animationDuration: '2s' }}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="bg-white/90 backdrop-blur-md border border-white/20 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-football-primary">Create Account</CardTitle>
                <CardDescription className="text-base font-medium text-muted-foreground">
                  Reach thousands of players and teams — free and easy.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 h-12 bg-white/80 border-2 border-transparent focus:border-primary/50 focus:bg-white transition-all duration-300"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="organizer@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 bg-white/80 border-2 border-transparent focus:border-primary/50 focus:bg-white transition-all duration-300"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-12 bg-white/80 border-2 border-transparent focus:border-primary/50 focus:bg-white transition-all duration-300"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 h-12 bg-white/80 border-2 border-transparent focus:border-primary/50 focus:bg-white transition-all duration-300"
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-primary to-football-primary hover:from-primary/90 hover:to-football-primary/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-pulse hover:animate-none" 
                    style={{ animationDuration: '2s' }}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
                
                {/* Benefits Section */}
                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                        <PoundSterling className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground">Free</div>
                        <div className="text-xs text-muted-foreground">No hidden costs</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground">5 min</div>
                        <div className="text-xs text-muted-foreground">Quick setup</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground">24/7</div>
                        <div className="text-xs text-muted-foreground">Always accessible</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md bg-white/95 backdrop-blur-md border border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle>Reset Password</CardTitle>
                <CardDescription>
                  Enter your email address and we'll send you a link to reset your password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="Enter your email"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        className="pl-10 h-12 bg-white/80 border-2 border-transparent focus:border-primary/50 focus:bg-white transition-all duration-300"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordEmail('');
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-gradient-to-r from-primary to-football-primary hover:from-primary/90 hover:to-football-primary/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Sending...' : 'Send Reset Email'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="text-center mt-6">
          <Button variant="outline" asChild className="bg-white/20 backdrop-blur-sm border-white/30 text-foreground hover:bg-white/30">
            <a href="/">
              ← Back to Homepage
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;