
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Microscope, UserPlus, ShoppingBag, RotateCcw, Clock, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const menuButtons = [
    { 
      label: 'Register', 
      icon: UserPlus, 
      color: 'orange-gradient', 
      path: '/register',
      desc: 'Create new account'
    },
    { 
      label: 'Borrow', 
      icon: ShoppingBag, 
      color: 'blue-gradient', 
      path: '/borrow',
      desc: 'Take equipment out'
    },
    { 
      label: 'Return', 
      icon: RotateCcw, 
      color: 'teal-gradient', 
      path: '/return',
      desc: 'Check in apparatus'
    }
  ];

  return (
    <div className="kiosk-container">
      {/* Top Navbar */}
      <nav className="h-20 md:h-24 bg-white border-b px-6 md:px-12 flex items-center justify-between shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-14 h-14 bg-primary rounded-xl md:rounded-2xl flex items-center justify-center text-white">
            <Microscope className="w-6 h-6 md:w-10 h-10" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-black text-primary tracking-tighter leading-none">LabCab</h1>
            <p className="text-slate-400 font-medium text-[10px] md:text-sm uppercase tracking-widest">Smart Laboratory Cabinet</p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end gap-2 text-lg md:text-2xl font-bold text-slate-700">
            <Clock className="w-4 h-4 md:w-6 h-6 text-primary" />
            <span>{format(time, 'hh:mm:ss a')}</span>
          </div>
          <p className="text-slate-400 font-semibold text-xs md:text-base">{format(time, 'EEEE, MMMM do yyyy')}</p>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center space-y-8 md:space-y-16 overflow-y-auto">
        <div className="space-y-2 md:space-y-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-7xl font-black text-slate-900 tracking-tight"
          >
            Welcome to LabCab
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-2xl text-slate-500 max-w-3xl mx-auto px-4"
          >
            Smart Laboratory Cabinet for Borrowing and Returning Laboratory Apparatus
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 w-full max-w-6xl pb-8 md:pb-0">
          {menuButtons.map((btn, i) => (
            <motion.div
              key={btn.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + (i * 0.1) }}
            >
              <Button
                className={`w-full h-40 md:h-80 rounded-[1.5rem] md:rounded-[2.5rem] flex flex-row md:flex-col gap-4 md:gap-6 text-white shadow-xl md:shadow-2xl transition-all active:scale-95 ripple border-none ${btn.color} hover:brightness-110`}
                onClick={() => router.push(btn.path)}
              >
                <btn.icon className="w-12 h-12 md:w-24 md:h-24 shrink-0" />
                <div className="text-left md:text-center space-y-0 md:space-y-1">
                  <span className="text-2xl md:text-4xl font-black tracking-tight block">{btn.label.toUpperCase()}</span>
                  <p className="text-white/70 text-sm md:text-lg font-medium">{btn.desc}</p>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Bottom Status Bar */}
      <footer className="h-12 md:h-16 bg-slate-900 text-white/60 px-6 md:px-12 flex items-center justify-between text-xs md:text-lg font-medium shrink-0">
        <div className="flex gap-4 md:gap-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 md:w-3 h-3 bg-green-500 rounded-full" />
            <span>Active Borrows: 12</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-2 h-2 md:w-3 h-3 bg-orange-500 rounded-full" />
            <span>Overdue Items: 2</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-8">
          <span className="hidden sm:inline">v1.0.4-production</span>
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 md:w-5 h-5" />
            <span>Raspberry Pi Kiosk</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
