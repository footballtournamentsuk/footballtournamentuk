import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";

const AlertVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already_verified'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [alertInfo, setAlertInfo] = useState<any>(null);

  useEffect(() => {
    const verifyAlert = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setErrorMessage('Invalid verification link. The token is missing.');
        return;
      }

      try {
        // Call the alerts-verify edge function
        const { data, error } = await supabase.functions.invoke('alerts-verify', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (error) {
          console.error('Verification error:', error);
          setStatus('error');
          setErrorMessage(error.message || 'Verification failed. Please try again.');
        } else if (data?.status === 'success') {
          setStatus('success');
          setAlertInfo(data.alert);
          toast({
            title: "Alert activated!",
            description: "Your tournament alerts are now active.",
            variant: "default",
          });
        } else if (data?.status === 'already_verified') {
          setStatus('already_verified');
          setAlertInfo(data.alert);
        } else {
          setStatus('error');
          setErrorMessage(data?.message || 'Verification failed.');
        }
      } catch (error: any) {
        console.error('Unexpected error:', error);
        setStatus('error');
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    };

    verifyAlert();
  }, [searchParams, toast]);

  const getStatusContent = () => {
    switch (status) {
      case 'loading':
        return {
          icon: <Loader2 className="h-16 w-16 animate-spin text-primary" />,
          title: "Verifying your alert",
          description: "Please wait while we activate your tournament alerts...",
          showButtons: false,
        };

      case 'success':
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-500" />,
          title: "Tournament Alerts Activated!",
          description: `Your tournament alerts are now active. You'll receive ${alertInfo?.frequency || 'regular'} emails when new tournaments match your criteria.`,
          showButtons: true,
          managementToken: alertInfo?.management_token,
        };

      case 'already_verified':
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-500" />,
          title: "Already Verified",
          description: "Your tournament alerts are already active and working!",
          showButtons: true,
          managementToken: alertInfo?.management_token,
        };

      case 'error':
        return {
          icon: <XCircle className="h-16 w-16 text-red-500" />,
          title: "Verification Failed",
          description: errorMessage || "The verification link is invalid or has expired. Please create a new alert.",
          showButtons: true,
          showError: true,
        };

      default:
        return null;
    }
  };

  const content = getStatusContent();
  if (!content) return null;

  return (
    <>
      <SEO
        title="Alert Verification | Football Tournaments UK"
        description="Verify your tournament alert subscription"
      />
      
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-auto p-8">
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 flex items-center justify-center">
              {content.icon}
            </div>
            
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {content.title}
              </h1>
              <p className="text-muted-foreground mb-6">
                {content.description}
              </p>
              
              {status === 'success' && (
                <div className="bg-muted/50 rounded-lg p-4 mb-6 text-sm text-left">
                  <div className="font-medium mb-2">What's next?</div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• We'll send you {alertInfo?.frequency || 'regular'} digests with matching tournaments</li>
                    <li>• Daily alerts arrive at 8:00 AM UK time</li>
                    <li>• Weekly alerts arrive on Sundays at 6:00 PM UK time</li>
                    <li>• You can manage or unsubscribe anytime</li>
                  </ul>
                </div>
              )}
            </div>

            {content.showButtons && (
              <div className="space-y-3">
                {content.managementToken && (
                  <Button 
                    onClick={() => navigate(`/alerts/manage/${content.managementToken}`)}
                    className="w-full"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Manage Your Alerts
                  </Button>
                )}
                
                <Button 
                  onClick={() => navigate('/')}
                  variant={content.showError ? "default" : "outline"}
                  className="w-full"
                >
                  Browse Tournaments
                </Button>
                
                {content.showError && (
                  <Button 
                    onClick={() => navigate('/')}
                    variant="outline"
                    className="w-full"
                  >
                    Create New Alert
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AlertVerify;