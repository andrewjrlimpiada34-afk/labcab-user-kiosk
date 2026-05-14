"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Microscope, UserPlus, ShoppingBag, RotateCcw, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const router = useRouter();
  const db = useFirestore();
  const [time, setTime] = useState<Date | null>(null);

  // Active Borrows Count from Firestore
  const transactionsRef = db ? collection(db, 'transactions') : null;
  const activeQuery = transactionsRef ? query(transactionsRef, where('status', '==', 'active')) : null;
  const { data: activeTransactions } = useCollection(activeQuery);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const menuButtons = useMemo(
    () => [
      {
        label: 'Register',
        icon: UserPlus,
        color: 'orange-gradient',
        path: '/register',
        desc: 'Create new account',
      },
      {
        label: 'Borrow',
        icon: ShoppingBag,
        color: 'blue-gradient',
        path: '/borrow',
        desc: 'Take equipment out',
      },
      {
        label: 'Return',
        icon: RotateCcw,
        color: 'teal-gradient',
        path: '/return',
        desc: 'Check in apparatus',
      },
    ],
    []
  );

  const heroImages = useMemo(() => {
    // Prefer the “lab-like” assets from placeholder-images.json
    const ids = new Set(['lab-hero', 'beaker', 'flask', 'microscope']);
    return PlaceHolderImages.filter((img) => ids.has(img.id));
  }, []);

  const landscapeImage = useMemo(() => {
    // Pick a single wide/hero-ish URL. If not available, just use the first hero.
    return heroImages[0]?.imageUrl ?? PlaceHolderImages[0]?.imageUrl ?? '';
  }, [heroImages]);

  const carouselApiRef = useRef<{ scrollNext: () => void } | null>(null);

  useEffect(() => {
    // Auto-slide every 4s.
    // If carouselApiRef isn't ready yet, do nothing.
    const id = window.setInterval(() => {
      carouselApiRef.current?.scrollNext?.();
    }, 4000);

    return () => {
      window.clearInterval(id);
    };
  }, []);

  return (
    <div className="kiosk-container flex flex-col h-screen overflow-hidden">
      {/* Top Navbar */}
      <nav className="h-24 bg-white border-b px-12 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white">
            <Microscope className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-primary tracking-tighter leading-none">LabCab</h1>
            <p className="text-slate-400 font-medium text-sm uppercase tracking-widest">Smart Laboratory Cabinet</p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end gap-2 text-2xl font-bold text-slate-700">
            <Clock className="w-6 h-6 text-primary" />
            <span suppressHydrationWarning>{time ? format(time, 'hh:mm:ss a') : '--:--:--'}</span>
          </div>
          <p className="text-slate-400 font-semibold text-base" suppressHydrationWarning>
            {time ? format(time, 'EEEE, MMMM do yyyy') : 'Loading...'}
          </p>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-10 md:p-12 text-center space-y-10 overflow-hidden">
        {/* Header carousel */}
        <div className="w-full max-w-6xl">
          <Carousel
            opts={{ loop: true, align: 'start' }}
            className="w-full rounded-[2rem] overflow-hidden"
            setApi={(api) => {
              carouselApiRef.current = api as any;
            }}
          >
            <CarouselContent>
              {heroImages.length > 0 ? (
                heroImages.map((img) => (
                  <CarouselItem key={img.id} className="basis-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <div className="w-full h-[240px] md:h-[280px] relative bg-slate-100">
                      <img
                        src={img.imageUrl}
                        alt={img.description}
                        className="w-full h-full object-cover"
                        loading="eager"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                    </div>
                  </CarouselItem>
                ))
              ) : (
                <CarouselItem className="basis-full">
                  <div className="w-full h-[240px] md:h-[280px] bg-slate-100" />
                </CarouselItem>
              )}
            </CarouselContent>
          </Carousel>
        </div>

        <div className="space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl font-black text-slate-900 tracking-tight"
          >
            Welcome to LabCab
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl text-slate-500 max-w-3xl mx-auto"
          >
            Smart Laboratory Cabinet for Borrowing and Returning Laboratory Apparatus
          </motion.p>
        </div>

        {/* Buttons */}
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {menuButtons.map((btn, i) => (
              <motion.div
                key={btn.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <Button
                  className={`w-full h-80 rounded-[2.5rem] flex flex-col gap-6 text-white shadow-2xl transition-all active:scale-95 ripple border-none ${btn.color} hover:brightness-110`}
                  onClick={() => router.push(btn.path)}
                >
                  <btn.icon className="w-24 h-24" />
                  <div className="space-y-1">
                    <span className="text-4xl font-black tracking-tight">{btn.label.toUpperCase()}</span>
                    <p className="text-white/70 text-lg font-medium">{btn.desc}</p>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Landscape image below buttons */}
          <div className="mt-10">
            <div className="w-full h-[200px] md:h-[220px] rounded-[2rem] overflow-hidden bg-slate-100 shadow-sm border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {landscapeImage ? (
                <img src={landscapeImage} alt="LabCab landscape" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full" />
              )}
              <div className="-mt-[200px] md:-mt-[220px] h-[200px] md:h-[220px] bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Status Bar */}
      <footer className="h-16 bg-slate-900 text-white/60 px-12 flex items-center justify-between text-lg font-medium">
        <div className="flex gap-8">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>Active Borrows: {activeTransactions?.length || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <span>Overdue Items: 0</span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <span>v1.0.5-production</span>
          <span className="text-white/40 italic">A Cabinet that knows what&apos;s Inside!</span>
        </div>
      </footer>
    </div>
  );
}

