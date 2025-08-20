import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Trophy, Users, Map, Mail, CheckCircle } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingModal = ({ isOpen, onClose }: OnboardingModalProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: Trophy,
      title: "Welcome to Football Tournaments UK!",
      subtitle: "The leading platform for youth and grassroots tournaments",
      content: "Join thousands of organizers who trust us to connect their tournaments with players across England, Scotland, Wales, and Northern Ireland.",
      buttonText: "Get Started"
    },
    {
      icon: Users,
      title: "How It Works",
      subtitle: "Create tournaments that reach thousands of players",
      content: "Simply create your tournament with all the details - location, dates, age groups, and formats. We'll handle the rest and make sure players can easily find and join your event.",
      buttonText: "Continue"
    },
    {
      icon: Map,
      title: "Publish & Manage",
      subtitle: "Your tournaments, fully under your control",
      content: "Once published, your tournament appears on our homepage and interactive map. Players can discover, share, and get all the information they need to participate.",
      buttonText: "Next"
    },
    {
      icon: Mail,
      title: "Need Help?",
      subtitle: "We're here to support your success",
      content: "Our team is ready to help you make the most of the platform. For any questions or assistance, reach out to us at info@footballtournamentsuk.co.uk",
      buttonText: "Start Creating"
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose();
    }
  };

  const skipOnboarding = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden bg-gradient-to-br from-background via-background to-secondary/5">
        <div className="flex flex-col max-h-full">
          <div className="relative flex-shrink-0">
            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-6">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-football-primary rounded-full flex items-center justify-center mb-4">
                    {React.createElement(slides[currentSlide].icon, {
                      className: "w-8 h-8 text-white"
                    })}
                  </div>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center mb-2">
                      {slides[currentSlide].title}
                    </DialogTitle>
                    <p className="text-lg text-muted-foreground font-medium">
                      {slides[currentSlide].subtitle}
                    </p>
                  </DialogHeader>
                </div>

                <div className="mb-8">
                  <p className="text-foreground leading-relaxed text-base">
                    {slides[currentSlide].content}
                  </p>
                </div>

                <div className="flex gap-3 justify-center">
                  {currentSlide > 0 && (
                    <Button
                      variant="outline"
                      onClick={skipOnboarding}
                      className="px-6"
                    >
                      Skip Tour
                    </Button>
                  )}
                  <Button
                    onClick={nextSlide}
                    className="px-6 bg-primary hover:bg-primary-hover text-primary-foreground font-medium shadow-lg"
                  >
                    {slides[currentSlide].buttonText}
                    {currentSlide < slides.length - 1 && (
                      <ChevronRight className="w-4 h-4 ml-1" />
                    )}
                    {currentSlide === slides.length - 1 && (
                      <CheckCircle className="w-4 h-4 ml-1" />
                    )}
                  </Button>
                </div>

                {/* Create Tournament CTA on last slide */}
                {currentSlide === slides.length - 1 && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-football-primary/10 rounded-lg border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-2">
                      Ready to get started?
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        onClose();
                        // Navigate to tournaments tab
                        window.location.href = '/profile?tab=tournaments';
                      }}
                      className="text-primary border-primary hover:bg-primary hover:text-primary-foreground font-medium"
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      Create Your First Tournament
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;