// frontend/src/components/Footer.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function Footer() {
  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/workout-selection', label: 'Workout' },
    { to: '/analytics', label: 'Analytics' },
    { to: '/photos', label: 'Progress' },
    { to: '/chat', label: 'AI Assistant' },
  ];

  return (
    <footer className="w-full bg-[#0A0A0A] border-t border-white/10 text-[#6F7075] mt-auto select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10">

        {/* Main 3-Column Tactical Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6 items-start pb-8 border-b border-white/10">

          {/* LEFT: BRAND & SUBTITLE (Col 1-5) */}
          <div className="md:col-span-5 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[5px] bg-[#B7F52A]/10 border border-[#B7F52A]/30 flex items-center justify-center text-[#B7F52A] shadow-[0_0_10px_rgba(183,245,42,0.2)]">
                <Activity className="w-3.5 h-3.5 text-[#B7F52A]" />
              </div>
              <span className="font-display font-black tracking-tight text-white text-base block leading-none">
                AI GYM TRAINER
              </span>
            </div>
            <p className="text-xs text-[#6F7075] max-w-sm font-sans leading-relaxed">
              AI-Based Real-Time Body Posture Correction &amp; Injury Risk Detection
            </p>
          </div>

          {/* CENTER: QUICK LINKS (Col 6-9) */}
          <div className="md:col-span-4 space-y-2.5">
            <span className="text-[10px] font-display font-black tracking-widest uppercase text-white block">
              Quick Links
            </span>
            <nav className="flex flex-wrap gap-x-4 gap-y-2 text-xs" aria-label="Footer Navigation">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `transition-colors font-medium hover:text-[#B7F52A] py-1 ${
                      isActive ? 'text-[#B7F52A] font-bold' : 'text-[#6F7075]'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* RIGHT: TECHNOLOGY STACK (Col 10-12) */}
          <div className="md:col-span-3 space-y-2.5 md:text-right">
            <span className="text-[10px] font-display font-black tracking-widest uppercase text-white block">
              Powered By
            </span>
            <p className="text-xs text-[#6F7075] font-mono leading-relaxed">
              MediaPipe • FastAPI • React • OpenCV
            </p>
          </div>

        </div>

        {/* BOTTOM BAR: COPYRIGHT & MOTTO */}
        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] font-sans">
          <p className="text-[#6F7075]">
            &copy; 2026 AI Gym Trainer • Real-Time Intelligent Fitness Analysis
          </p>
          <p className="text-[#6F7075] text-[10px] sm:text-[11px] font-mono tracking-tight">
            Built for safer, smarter training.
          </p>
        </div>

      </div>
    </footer>
  );
}
