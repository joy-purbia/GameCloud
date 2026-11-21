import React from 'react';
import { Gamepad2, Heart, Cpu, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#05070b] py-12 px-4 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Branding */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2.5">
            <Gamepad2 className="w-5 h-5 text-cyan-400" />
            <span className="font-heading font-bold text-lg text-white">GAMECLOUD</span>
          </div>
          <p className="text-xs text-slate-400 max-w-sm text-center md:text-left">
            Modern browser cloud gaming platform built from scratch with Three.js, WebGL, React, and MySQL. Zero install required.
          </p>
        </div>

        {/* Center System Specs / Localhost Status */}
        <div className="flex items-center gap-6 text-xs text-slate-400 font-tech">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>WebGL 3D Engine</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>JWT Secure Auth</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="text-cyan-300 font-semibold">Localhost 5173</span>
          </div>
        </div>

        {/* Right Info */}
        <div className="text-xs text-slate-500 text-center md:text-right">
          &copy; {new Date().getFullYear()} GameCloud Platform. Built for Academic & Engineering Demonstration.
        </div>

      </div>
    </footer>
  );
}
