import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import logo from '/bimi-logo.svg';

const CheckEmail = () => {
  const { resendVerificationEmail } = useAuth();
  const { toast } = useToast();
  const [resending, setResending] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [lastSentTime, setLastSentTime] = useState<number | null>(null);
  const [emailAddress, setEmailAddress] = useState<string>('');

  // Load stored email and check cooldown
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('signup-email');
    if (storedEmail) {
      setEmailAddress(storedEmail);
    }

    const lastSent = localStorage.getItem('last-verification-sent');
    if (lastSent) {
      const lastSentTimestamp = parseInt(lastSent);
      const now = Date.now();
      const timeElapsed = now - lastSentTimestamp;
      const cooldownDuration = 60 * 1000; // 60 seconds
      
      if (timeElapsed < cooldownDuration) {
        setLastSentTime(lastSentTimestamp);
        setCooldownTime(Math.ceil((cooldownDuration - timeElapsed) / 1000));
      }
    }
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldownTime <= 0) return;

    const timer = setInterval(() => {
      setCooldownTime(prev => {
        if (prev <= 1) {
          setLastSentTime(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownTime]);

  const handleResendEmail = async () => {
    if (cooldownTime > 0) return;

    setResending(true);
    try {
      const { error } = await resendVerificationEmail(emailAddress);
      
      if (error) {
        toast({
          title: "Failed to Resend",
          description: error.message,
          variant: "destructive",
        });
      } else {
        const now = Date.now();
        setLastSentTime(now);
        setCooldownTime(60); // 60 second cooldown
        localStorage.setItem('last-verification-sent', now.toString());
        
        toast({
          title: "Email Sent!",
          description: "We've sent another verification email to your inbox.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto">
            <img 
              src={logo} 
              alt="Football Tournaments UK" 
              className="w-14 h-14 sm:w-16 sm:h-16 mx-auto" 
            />
          </div>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription>
            We've sent a confirmation link to{' '}
            {emailAddress && (
              <span className="font-medium text-foreground">{emailAddress}</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Click the link in the email to activate your account. 
              If you don't see it, check your spam folder.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleResendEmail}
              disabled={resending || cooldownTime > 0}
              variant="outline" 
              className="w-full touch-manipulation min-h-[44px]"
              aria-label="Resend verification email"
            >
              {resending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : cooldownTime > 0 ? (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Resend in {cooldownTime}s
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Email
                </>
              )}
            </Button>
            
            <Button asChild variant="ghost" className="w-full touch-manipulation min-h-[44px]">
              <Link to="/auth" aria-label="Go back to sign in page">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Link>
            </Button>
          </div>
          
          {lastSentTime && (
            <div className="text-center p-3 bg-success/10 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-success">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Email sent successfully!</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Check your inbox and spam folder
              </p>
            </div>
          )}
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Still need help?{' '}
              <Link 
                to="/support" 
                className="text-primary hover:underline focus:underline focus:outline-none"
              >
                Contact support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckEmail;