import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal = ({ isOpen, onClose }: SupportModalProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: profile?.full_name || "",
    email: user?.email || "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: profile?.full_name || "",
        email: user?.email || "",
        subject: "",
        message: "",
      });
    }
  }, [isOpen, profile?.full_name, user?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim() || !formData.email?.trim() || !formData.subject?.trim() || !formData.message?.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-support-email', {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          pageUrl: window.location.href
        }
      });

      if (error) throw error;

      toast({
        title: "Message sent!",
        description: "Your message has been sent. We'll contact you via info@footballtournamentsuk.co.uk.",
      });

      // Reset form and close modal
      setFormData({
        name: profile?.full_name || "",
        email: user?.email || "",
        subject: "",
        message: "",
      });
      onClose();
    } catch (error: any) {
      console.error("Error sending support message:", error);
      toast({
        title: "Error",
        description: error?.message?.includes('Too many requests') 
          ? "Too many requests. Please try again later."
          : "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contact Support</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Your name"
                required
                maxLength={100}
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              placeholder="Brief description of your issue"
              required
              maxLength={200}
            />
          </div>

          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              placeholder="Please describe your issue or question in detail..."
              required
              maxLength={1000}
              rows={5}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.message.length}/1000 characters
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};