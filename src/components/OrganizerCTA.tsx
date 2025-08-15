import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, UserPlus, ClipboardList, Zap } from 'lucide-react';

const OrganizerCTA = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-primary via-secondary to-accent relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0 bg-repeat" 
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            backgroundSize: '60px 60px'
          }}
        />
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Heading */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Organize a Tournament?
              <span className="block text-white/80 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 mt-4 inline-block italic border border-white/30 font-normal text-xl md:text-2xl">
                ↓ Add it here! ↓
              </span>
            </h2>
            <p className="text-lg md:text-xl text-white/95 max-w-3xl mx-auto leading-relaxed">
              Reach thousands of teams and players. Create your tournament page in minutes — it's free and easy!
            </p>
          </div>

          {/* CTA Button */}
          <div className="mb-12 w-full max-w-md mx-auto">
            <Button
              asChild
              size="lg"
              className="w-full bg-accent text-accent-foreground hover:bg-accent-hover hover:scale-105 shadow-2xl hover:shadow-3xl transition-all duration-300 text-lg px-8 py-6 h-auto rounded-xl font-bold border-4 border-accent/30 relative overflow-hidden group ring-4 ring-accent/20 animate-[pulse_15s_ease-in-out_infinite] hover:animate-none"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--accent-hover, var(--accent))) 100%)',
                boxShadow: '0 0 30px hsl(var(--accent) / 0.3), 0 20px 40px rgba(0,0,0,0.15)'
              }}
            >
              <Link to="/auth" className="relative z-10 flex items-center justify-center w-full">
                <Plus className="w-6 h-6 mr-3" />
                Register & Add Tournament
                {/* Enhanced glow effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out rounded-xl" />
                {/* Very subtle pulsing ring effect */}
                <div className="absolute inset-0 rounded-xl border-2 border-white/20 animate-ping opacity-50" style={{ animationDuration: '15s' }} />
              </Link>
            </Button>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            {/* Step 1 */}
            <div className="group">
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-white/30">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                  <UserPlus className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Step 1</h3>
                <p className="text-white/90 font-medium">Sign Up</p>
                <p className="text-white/75 text-sm mt-2">Create your free account in seconds</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group">
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-white/30">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                  <ClipboardList className="w-10 h-10 text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Step 2</h3>
                <p className="text-white/90 font-medium">Fill in Details</p>
                <p className="text-white/75 text-sm mt-2">Add tournament info and venue</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group">
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-white/30">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                  <Zap className="w-10 h-10 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Step 3</h3>
                <p className="text-white/90 font-medium">Go Live!</p>
                <p className="text-white/75 text-sm mt-2">Start receiving registrations</p>
              </div>
            </div>
          </div>

          {/* Additional Benefits */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="text-center p-4 bg-white/10 rounded-xl border border-white/20">
              <div className="text-2xl md:text-3xl font-bold text-white">FREE</div>
              <div className="text-sm text-white/80 mt-1">No hidden costs</div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-xl border border-white/20">
              <div className="text-2xl md:text-3xl font-bold text-white">24/7</div>
              <div className="text-sm text-white/80 mt-1">Always accessible</div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-xl border border-white/20">
              <div className="text-2xl md:text-3xl font-bold text-white">1000s</div>
              <div className="text-sm text-white/80 mt-1">Teams to reach</div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-xl border border-white/20">
              <div className="text-2xl md:text-3xl font-bold text-white">5min</div>
              <div className="text-sm text-white/80 mt-1">Setup time</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrganizerCTA;