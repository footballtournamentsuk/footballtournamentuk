import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">Football Tournaments UK</h3>
            <p className="text-primary-foreground/80 mb-4">
              Find and join football tournaments across the UK. Free listings for organizers – no fees, no contracts.
              From grassroots to elite level competitions.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground" asChild>
                <Link to="/about">About Us</Link>
              </Button>
              <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground" asChild>
                <Link to="/support">Support Us</Link>
              </Button>
              <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground" asChild>
                <Link to="/faq">FAQ</Link>
              </Button>
              <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground" asChild>
                <Link to="/policies">Policies</Link>
              </Button>
              <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground" asChild>
                <Link to="/cookie-policy">Cookie Policy</Link>
              </Button>
              <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground" asChild>
                <a href="mailto:info@footballtournamentsuk.co.uk">Contact</a>
              </Button>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Major Cities</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link to="/tournaments/london" className="hover:text-primary-foreground">London Tournaments</Link></li>
              <li><Link to="/tournaments/manchester" className="hover:text-primary-foreground">Manchester Tournaments</Link></li>
              <li><Link to="/tournaments/birmingham" className="hover:text-primary-foreground">Birmingham Tournaments</Link></li>
              <li><Link to="/tournaments/liverpool" className="hover:text-primary-foreground">Liverpool Tournaments</Link></li>
              <li><Link to="/tournaments/leeds" className="hover:text-primary-foreground">Leeds Tournaments</Link></li>
              <li><Link to="/tournaments/glasgow" className="hover:text-primary-foreground">Glasgow Tournaments</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">More Cities</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link to="/tournaments/newcastle-upon-tyne" className="hover:text-primary-foreground">Newcastle Tournaments</Link></li>
              <li><Link to="/tournaments/sheffield" className="hover:text-primary-foreground">Sheffield Tournaments</Link></li>
              <li><Link to="/tournaments/bristol" className="hover:text-primary-foreground">Bristol Tournaments</Link></li>
              <li><Link to="/tournaments/nottingham" className="hover:text-primary-foreground">Nottingham Tournaments</Link></li>
              <li><Link to="/tournaments/leicester" className="hover:text-primary-foreground">Leicester Tournaments</Link></li>
              <li><Link to="/tournaments/brighton" className="hover:text-primary-foreground">Brighton Tournaments</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
          <p>© 2024 Football Tournaments UK. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};