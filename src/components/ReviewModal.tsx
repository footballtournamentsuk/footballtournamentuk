import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewModal = ({ isOpen, onClose }: ReviewModalProps) => {
  const [formData, setFormData] = useState({
    author_name: "",
    author_email: "",
    rating: 0,
    text: "",
    consent: false,
    honeypot: "", // Anti-spam honeypot field
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleStarClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Anti-spam: check honeypot
    if (formData.honeypot) {
      return; // Silently reject spam
    }

    if (!formData.author_name || !formData.text || formData.rating === 0) {
      toast({
        title: "Missing required fields",
        description: "Please fill in your name, rating, and review text.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.consent) {
      toast({
        title: "Consent required",
        description: "Please agree to the Terms & Privacy Policy.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("testimonials")
        .insert({
          author_name: formData.author_name,
          author_email: formData.author_email || null,
          rating: formData.rating,
          text: formData.text,
        });

      if (error) throw error;

      toast({
        title: "Thank you!",
        description: "Your review will appear after moderation.",
      });

      // Reset form and close modal
      setFormData({
        author_name: "",
        author_email: "",
        rating: 0,
        text: "",
        consent: false,
        honeypot: "",
      });
      onClose();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot field - hidden from users */}
          <input
            type="text"
            name="website"
            value={formData.honeypot}
            onChange={(e) => setFormData(prev => ({ ...prev, honeypot: e.target.value }))}
            style={{ display: "none" }}
            tabIndex={-1}
            autoComplete="off"
          />

          <div>
            <label className="text-sm font-medium">Name *</label>
            <Input
              value={formData.author_name}
              onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
              placeholder="Your name"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email (optional)</label>
            <Input
              type="email"
              value={formData.author_email}
              onChange={(e) => setFormData(prev => ({ ...prev, author_email: e.target.value }))}
              placeholder="your@email.com"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Not shown publicly, used only for follow-up if needed
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Rating *</label>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
                  aria-label={`Rate ${star} out of 5 stars`}
                >
                  <Star
                    className={cn(
                      "h-6 w-6 transition-colors",
                      star <= formData.rating
                        ? "fill-accent text-accent"
                        : "text-muted-foreground hover:text-accent"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Review *</label>
            <Textarea
              value={formData.text}
              onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
              placeholder="Share your experience..."
              required
              maxLength={600}
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.text.length}/600 characters
            </p>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="consent"
              checked={formData.consent}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, consent: checked as boolean }))
              }
            />
            <label 
              htmlFor="consent" 
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the{" "}
              <a href="/policies" className="text-primary hover:underline">
                Terms & Privacy Policy
              </a>
            </label>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.consent}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};