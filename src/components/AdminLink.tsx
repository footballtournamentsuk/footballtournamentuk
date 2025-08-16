import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const AdminLink = () => {
  const { user } = useAuth();
  
  // Simple admin check - in production, you'd check roles from a profiles table
  const isAdmin = user?.email?.includes("admin") || user?.email?.includes("owner");
  
  if (!user || !isAdmin) {
    return null;
  }

  return (
    <Link to="/admin">
      <Button variant="outline" size="sm" className="gap-2">
        <Shield className="h-4 w-4" />
        Admin Panel
      </Button>
    </Link>
  );
};