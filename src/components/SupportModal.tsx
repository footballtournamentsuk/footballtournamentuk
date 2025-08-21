import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubject?: string;
  defaultCategory?: string;
}

export const SupportModal = ({ isOpen, onClose, defaultSubject = "", defaultCategory = "" }: SupportModalProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: profile?.full_name || "",
    email: user?.email || "",
    subject: "",
    category: "",
    message: "",
    honeypot: "", // Hidden spam protection field
  });

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: profile?.full_name || "",
        email: user?.email || "",
        subject: defaultSubject,
        category: defaultCategory,
        message: "",
        honeypot: "",
      });
    }
  }, [isOpen, profile?.full_name, user?.email, defaultSubject, defaultCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim() || !formData.email?.trim() || !formData.subject?.trim() || !formData.category?.trim() || !formData.message?.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session) {
        toast({
          title: "Authentication required",
          description: "Please log in to submit a support request.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('support-request', {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          category: formData.category,
          message: formData.message.trim(),
          honeypot: formData.honeypot,
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Support request submitted",
        description: `Your request has been submitted successfully. Ticket ID: ${data?.ticketId?.split('-')[0] || 'N/A'}`,
      });
      onClose();
    } catch (error: any) {
      console.error('Support form error:', error);
      toast({
        title: "Failed to submit request",
        description: error.message || "Please try again or contact us directly at support@footballtournamentsuk.co.uk",
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
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden">
        <div className="flex flex-col max-h-full">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Contact Support</DialogTitle>
          </DialogHeader>
          
          <div className="overflow-y-auto overscroll-contain flex-1 pr-2">
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange("category", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Bug Report">Bug Report</SelectItem>
                    <SelectItem value="Feature Request">Feature Request</SelectItem>
                    <SelectItem value="Billing">Billing</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Hidden honeypot field for spam protection */}
              <input
                type="text"
                name="honeypot"
                value={formData.honeypot}
                onChange={(e) => handleInputChange("honeypot", e.target.value)}
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  width: '1px',
                  height: '1px',
                  opacity: 0,
                  pointerEvents: 'none',
                }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

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

              <div className="flex gap-2 justify-end pt-4 flex-shrink-0">
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
                  {isSubmitting ? "Submitting..." : "Send Message"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};