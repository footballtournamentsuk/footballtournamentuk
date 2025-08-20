import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PartnersCarousel from '@/components/PartnersCarousel';

export const Footer = () => {
  return (
    <footer className="py-12 border-t text-white/90 pb-[env(safe-area-inset-bottom)]" style={{ backgroundColor: '#08261E', borderTopColor: 'rgba(255, 255, 255, 0.1)' }}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">Football Tournaments UK</h3>
            <p className="text-white/80 mb-4">
              Find and join football tournaments across the UK. Free listings for organizers – no fees, no contracts.
              From grassroots to elite level competitions.
            </p>
            
            {/* Contact Info for Trust & SEO */}
            <div className="mb-4">
              <p className="text-white/90 font-medium">
                📧 info@footballtournamentsuk.co.uk
              </p>
            </div>

            {/* Quick Links - Conversion Priority */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-white">Quick Links</h4>
              <div className="flex flex-wrap gap-4">
                <Button variant="ghost" size="sm" className="text-emerald-200 hover:text-emerald-100 border border-white/30 hover:border-emerald-300 focus-visible:ring-emerald-400/50" asChild>
                  <Link to="/">🏠 Home</Link>
                </Button>
                <Button variant="ghost" size="sm" className="text-emerald-200 hover:text-emerald-100 border border-white/30 hover:border-emerald-300 bg-white/10 focus-visible:ring-emerald-400/50" asChild>
                  <Link to="/auth">⚽ List Your Tournament</Link>
                </Button>
                <Button variant="ghost" size="sm" className="text-emerald-200 hover:text-emerald-100 border border-white/30 hover:border-emerald-300 focus-visible:ring-emerald-400/50" asChild>
                  <a href="mailto:info@footballtournamentsuk.co.uk">📧 Contact</a>
                </Button>
              </div>
            </div>

            {/* Other Links */}
            <div>
              <h4 className="font-semibold mb-3 text-white">More Info</h4>
              <div className="flex flex-wrap gap-4">
                <Button variant="ghost" size="sm" className="text-emerald-200 hover:text-emerald-100 focus-visible:ring-emerald-400/50" asChild>
                  <Link to="/about">About Us</Link>
                </Button>
                <Button variant="ghost" size="sm" className="text-emerald-200 hover:text-emerald-100 focus-visible:ring-emerald-400/50" asChild>
                  <Link to="/support">Support Us</Link>
                </Button>
                <Button variant="ghost" size="sm" className="text-emerald-200 hover:text-emerald-100 focus-visible:ring-emerald-400/50" asChild>
                  <Link to="/faq">FAQ</Link>
                </Button>
                <Button variant="ghost" size="sm" className="text-emerald-200 hover:text-emerald-100 focus-visible:ring-emerald-400/50" asChild>
                  <Link to="/policies">Policies</Link>
                </Button>
                <Button variant="ghost" size="sm" className="text-emerald-200 hover:text-emerald-100 focus-visible:ring-emerald-400/50" asChild>
                  <Link to="/cookie-policy">Cookie Policy</Link>
                </Button>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 text-white">Major Cities</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link to="/tournaments/london" className="text-emerald-200 hover:text-emerald-100 focus-visible:ring-1 focus-visible:ring-emerald-400/50">London Tournaments</Link></li>
              <li><Link to="/tournaments/manchester" className="text-emerald-200 hover:text-emerald-100 focus-visible:ring-1 focus-visible:ring-emerald-400/50">Manchester Tournaments</Link></li>
              <li><Link to="/tournaments/birmingham" className="text-emerald-200 hover:text-emerald-100 focus-visible:ring-1 focus-visible:ring-emerald-400/50">Birmingham Tournaments</Link></li>
              <li><Link to="/tournaments/liverpool" className="text-emerald-200 hover:text-emerald-100 focus-visible:ring-1 focus-visible:ring-emerald-400/50">Liverpool Tournaments</Link></li>
              <li><Link to="/tournaments/leeds" className="text-emerald-200 hover:text-emerald-100 focus-visible:ring-1 focus-visible:ring-emerald-400/50">Leeds Tournaments</Link></li>
              <li><Link to="/tournaments/glasgow" className="text-emerald-200 hover:text-emerald-100 focus-visible:ring-1 focus-visible:ring-emerald-400/50">Glasgow Tournaments</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 text-white">More Cities</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link to="/tournaments/newcastle-upon-tyne" className="text-emerald-200 hover:text-emerald-100 focus-visible:ring-1 focus-visible:ring-emerald-400/50">Newcastle Tournaments</Link></li>
              <li><Link to="/tournaments/sheffield" className="text-emerald-200 hover:text-emerald-100 focus-visible:ring-1 focus-visible:ring-emerald-400/50">Sheffield Tournaments</Link></li>
              <li><Link to="/tournaments/bristol" className="text-emerald-200 hover:text-emerald-100 focus-visible:ring-1 focus-visible:ring-emerald-400/50">Bristol Tournaments</Link></li>
              <li><Link to="/tournaments/nottingham" className="text-emerald-200 hover:text-emerald-100 focus-visible:ring-1 focus-visible:ring-emerald-400/50">Nottingham Tournaments</Link></li>
              <li><Link to="/tournaments/leicester" className="text-emerald-200 hover:text-emerald-100 focus-visible:ring-1 focus-visible:ring-emerald-400/50">Leicester Tournaments</Link></li>
              <li><Link to="/tournaments/brighton" className="text-emerald-200 hover:text-emerald-100 focus-visible:ring-1 focus-visible:ring-emerald-400/50">Brighton Tournaments</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Partners Section */}
        <div className="border-t border-white/20 mt-8 pt-8">
          <PartnersCarousel showTitle={true} showButton={false} compact={true} />
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/60">
          <p>© 2025 Football Tournaments UK. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};