import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const CheckEmail: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      
      <Card className="w-full max-w-md relative z-10 border-border/20 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Check Your Email</h1>
            <p className="text-muted-foreground text-sm">
              We've sent you a confirmation link
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-3">
            <p className="text-foreground">
              A confirmation email has been sent to your inbox.
            </p>
            <p className="text-sm text-muted-foreground">
              Please click the confirmation link in the email to activate your account and complete the signup process.
            </p>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg border border-border/20">
            <h3 className="font-medium text-foreground mb-2">Next Steps:</h3>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Check your email inbox (and spam folder)</li>
              <li>Click the confirmation link in the email</li>
              <li>You'll be redirected back to sign in</li>
            </ol>
          </div>
          
          <div className="pt-4">
            <Button 
              variant="outline" 
              className="w-full" 
              asChild
            >
              <Link to="/auth" className="flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Didn't receive an email? Check your spam folder or try signing up again.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckEmail;