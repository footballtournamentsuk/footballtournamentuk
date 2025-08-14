import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, UserPlus, ClipboardList, Zap } from 'lucide-react';

const OrganizerCTA = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-football-primary via-football-secondary to-football-accent relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-repeat" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }}></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Organize a Tournament?
              <span className="block text-football-accent-light">Add it here!</span>
            </h2>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Reach thousands of teams and players. Create your tournament page in minutes — it's free and easy!
            </p>
          </div>

          {/* CTA Button */}
          <div className="mb-12">
            <Button
              asChild
              size="lg"
              className="bg-white text-football-primary hover:bg-white/90 hover:scale-105 shadow-elegant hover:shadow-glow transition-all duration-300 text-lg px-8 py-6 rounded-xl font-semibold"
            >
              <Link to="/auth">
                <Plus className="w-6 h-6 mr-3" />
                Register & Add Tournament
              </Link>
            </Button>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {/* Step 1 */}
            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105 border border-white/20">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <UserPlus className="w-8 h-8 text-football-primary" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Step 1</h3>
                <p className="text-white/80 text-sm">Sign Up</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105 border border-white/20">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <ClipboardList className="w-8 h-8 text-football-primary" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Step 2</h3>
                <p className="text-white/80 text-sm">Fill in Details</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105 border border-white/20">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-8 h-8 text-football-primary" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Step 3</h3>
                <p className="text-white/80 text-sm">Go Live!</p>
              </div>
            </div>
          </div>

          {/* Additional Benefits */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">FREE</div>
              <div className="text-sm text-white/80">No hidden costs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-sm text-white/80">Always accessible</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">1000s</div>
              <div className="text-sm text-white/80">Teams to reach</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">5min</div>
              <div className="text-sm text-white/80">Setup time</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrganizerCTA;