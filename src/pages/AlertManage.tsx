import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AlertInfo {
  id: string;
  email: string;
  frequency: string;
  filters: any;
  is_active: boolean;
  verified_at: string | null;
  created_at: string;
}

const AlertManage = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [alertInfo, setAlertInfo] = useState<AlertInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('No management token provided');
      setLoading(false);
      return;
    }

    fetchAlertInfo();
  }, [token]);

  const fetchAlertInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('tournament_alerts')
        .select('*')
        .eq('management_token', token)
        .single();

      if (error) {
        setError('Invalid management token');
        return;
      }

      setAlertInfo(data);
    } catch (err) {
      setError('Failed to load alert information');
      console.error('Error fetching alert info:', err);
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!alertInfo) return;

    setResendingVerification(true);
    try {
      const response = await supabase.functions.invoke('alerts-verify', {
        body: { 
          action: 'resend',
          email: alertInfo.email,
          alertId: alertInfo.id
        }
      });

      if (response.error) {
        throw response.error;
      }

      toast({
        title: "Verification email sent",
        description: "Please check your email inbox for the verification link.",
      });
    } catch (err) {
      console.error('Failed to resend verification:', err);
      toast({
        title: "Failed to resend verification",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setResendingVerification(false);
    }
  };

  const deleteAlert = async () => {
    if (!alertInfo || !confirm('Are you sure you want to delete this alert?')) return;

    try {
      const { error } = await supabase
        .from('tournament_alerts')
        .delete()
        .eq('management_token', token);

      if (error) throw error;

      toast({
        title: "Alert deleted",
        description: "Your tournament alert has been successfully deleted.",
      });
      
      setAlertInfo(null);
    } catch (err) {
      console.error('Failed to delete alert:', err);
      toast({
        title: "Failed to delete alert",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !alertInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Error
            </CardTitle>
            <CardDescription>
              {error || 'Alert not found'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Manage Tournament Alert - Football Tournaments UK</title>
        <meta name="description" content="Manage your tournament alert subscription" />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="cache-control" content="no-store, no-cache, must-revalidate" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Manage Your Tournament Alert
                </CardTitle>
                <CardDescription>
                  View and manage your tournament alert subscription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Alert Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> {alertInfo.email}</p>
                    <p><strong>Frequency:</strong> {alertInfo.frequency}</p>
                    <p><strong>Created:</strong> {new Date(alertInfo.created_at).toLocaleDateString()}</p>
                    <div className="flex items-center gap-2">
                      <strong>Status:</strong>
                      {alertInfo.is_active ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Pending Verification</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {alertInfo.filters && Object.keys(alertInfo.filters).length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Alert Filters</h3>
                    <div className="bg-muted p-3 rounded-lg text-sm">
                      <pre>{JSON.stringify(alertInfo.filters, null, 2)}</pre>
                    </div>
                  </div>
                )}

                {!alertInfo.is_active && !alertInfo.verified_at && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm mb-3">
                      Your alert is not yet verified. Please check your email for the verification link.
                    </p>
                    <Button 
                      onClick={resendVerification}
                      disabled={resendingVerification}
                      size="sm"
                    >
                      {resendingVerification && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Resend Verification Email
                    </Button>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Button 
                    onClick={deleteAlert}
                    variant="destructive"
                    size="sm"
                  >
                    Delete Alert
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default AlertManage;