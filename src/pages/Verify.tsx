import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      const redirectTo = searchParams.get('redirect_to');

      if (!token || !type) {
        setStatus('error');
        toast({
          title: "Invalid verification link",
          description: "The verification link is missing required parameters.",
          variant: "destructive",
        });
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: type as any,
        });

        if (error) {
          console.error('Verification error:', error);
          setStatus('error');
          toast({
            title: "Verification failed",
            description: error.message || "Invalid or expired verification link.",
            variant: "destructive",
          });
        } else {
          setStatus('success');
          toast({
            title: "Email verified successfully!",
            description: "Your email has been confirmed. You can now sign in.",
            variant: "default",
          });

          // Redirect after a short delay
          setTimeout(() => {
            navigate(redirectTo || '/auth');
          }, 2000);
        }
      } catch (error: any) {
        console.error('Unexpected error:', error);
        setStatus('error');
        toast({
          title: "Verification failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    };

    verifyToken();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="text-center space-y-6">
          {status === 'loading' && (
            <>
              <div className="mx-auto w-16 h-16 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">Verifying your email</h1>
                <p className="text-muted-foreground">
                  Please wait while we confirm your email address...
                </p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto w-16 h-16 flex items-center justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2 text-green-600">
                  Email verified successfully!
                </h1>
                <p className="text-muted-foreground mb-4">
                  Your email has been confirmed. You will be redirected to sign in shortly.
                </p>
                <p className="text-sm text-muted-foreground">
                  Redirecting in a moment...
                </p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto w-16 h-16 flex items-center justify-center">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2 text-red-600">
                  Verification failed
                </h1>
                <p className="text-muted-foreground mb-6">
                  The verification link is invalid or has expired. Please try signing up again or contact support if the problem persists.
                </p>
                <div className="space-y-3">
                  <Button 
                    onClick={() => navigate('/auth')}
                    className="w-full"
                  >
                    Go to Sign In
                  </Button>
                  <Button 
                    onClick={() => navigate('/')}
                    variant="outline"
                    className="w-full"
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Verify;