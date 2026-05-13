
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { QrCode, LogIn, Microscope, UserPlus } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-primary flex flex-col items-center justify-center z-50 overflow-hidden">
        <div className="relative animate-pulse-slow">
           <div className="w-32 h-32 bg-secondary rounded-3xl flex items-center justify-center mb-6 shadow-2xl rotate-12">
             <Microscope className="w-20 h-20 text-white" />
           </div>
        </div>
        <h1 className="text-6xl font-bold text-white tracking-tight animate-fade-in">
          Lab<span className="text-secondary">Cab</span>
        </h1>
        <p className="text-white/60 mt-4 text-xl font-light animate-fade-in delay-200">
          Smart Laboratory Cabinet System
        </p>
        <div className="absolute bottom-12 w-1 bg-white/10 h-24 rounded-full overflow-hidden">
          <div className="w-full bg-secondary h-full animate-bounce duration-1000 origin-bottom" />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 space-y-12 max-w-7xl mx-auto">
      <header className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-2">
           <div className="p-2 bg-primary rounded-xl">
             <Microscope className="w-8 h-8 text-white" />
           </div>
           <h1 className="text-4xl font-bold text-primary">LabCab</h1>
        </div>
        <h2 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight">
          Welcome to the Lab.
        </h2>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
          Securely borrow and manage laboratory equipment with instant QR access or credentials.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
        <Card className="group p-8 flex flex-col items-center justify-center text-center space-y-6 hover:border-secondary transition-all cursor-pointer shadow-xl h-80" onClick={() => router.push('/auth/qr')}>
          <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center group-hover:scale-110 transition-transform">
            <QrCode className="w-12 h-12 text-secondary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Scan QR Code</h3>
            <p className="text-slate-500 mt-2">Instant cabinet unlock</p>
          </div>
          <Button variant="secondary" className="w-full h-14 text-lg font-bold rounded-xl shadow-lg">SCAN NOW</Button>
        </Card>

        <Card className="group p-8 flex flex-col items-center justify-center text-center space-y-6 hover:border-primary transition-all cursor-pointer shadow-xl h-80" onClick={() => router.push('/auth/login')}>
          <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <LogIn className="w-12 h-12 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Manual Login</h3>
            <p className="text-slate-500 mt-2">Access using ID & PIN</p>
          </div>
          <Button variant="default" className="w-full h-14 text-lg font-bold rounded-xl shadow-lg">LOGIN</Button>
        </Card>

        <Card className="group p-8 flex flex-col items-center justify-center text-center space-y-6 hover:border-orange-400 transition-all cursor-pointer shadow-xl h-80 md:col-span-2 lg:col-span-1" onClick={() => router.push('/enroll')}>
          <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <UserPlus className="w-12 h-12 text-orange-500" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">New Enrollment</h3>
            <p className="text-slate-500 mt-2">Register student or faculty</p>
          </div>
          <Button variant="outline" className="w-full h-14 text-lg font-bold rounded-xl border-2 hover:bg-orange-50">ENROLL</Button>
        </Card>
      </div>

      <footer className="mt-12 text-slate-400 text-sm flex items-center gap-4">
        <span>© 2024 LabCab Smart Systems</span>
        <span className="w-1 h-1 bg-slate-400 rounded-full" />
        <button onClick={() => router.push('/admin')} className="hover:text-primary transition-colors">Admin Dashboard</button>
      </footer>
    </main>
  );
}
