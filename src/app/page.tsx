"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Microscope,
  UserPlus,
  ShoppingBag,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Home() {
  const router = useRouter();
  const db = useFirestore();

  const [time, setTime] = useState<Date | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const transactionsRef = db ? collection(db, 'transactions') : null;

  const activeQuery = transactionsRef
    ? query(transactionsRef, where('status', '==', 'active'))
    : null;

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
    const ids = new Set(['team', 'highlights', 'tagline', 'title']);
    return PlaceHolderImages.filter((img) => ids.has(img.id));
  }, []);

  const landscapeImage = useMemo(() => {
    return heroImages[3]?.imageUrl ?? PlaceHolderImages[0]?.imageUrl ?? '';
  }, [heroImages]);

  const carouselApiRef = useRef<any>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!carouselApiRef.current) return;

      const nextIndex =
        focusedIndex === heroImages.length - 1 ? 0 : focusedIndex + 1;

      carouselApiRef.current.scrollTo?.(nextIndex);
      setFocusedIndex(nextIndex);
    }, 5000);

    return () => clearInterval(id);
  }, [focusedIndex, heroImages.length]);

  return (
    <div className="kiosk-container flex flex-col h-screen overflow-hidden bg-white">

      {/* NAVBAR */}
      <nav className="h-24 bg-white border-b px-12 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white">
            <Microscope className="w-10 h-10" />
          </div>

          <div>
            <h1 className="text-3xl font-black text-primary tracking-tighter leading-none">
              LabCab
            </h1>
            <p className="text-slate-400 font-medium text-sm uppercase tracking-widest">
              Smart Laboratory Cabinet
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end gap-2 text-2xl font-bold text-slate-700">
            <Clock className="w-6 h-6 text-primary" />
            <span suppressHydrationWarning>
              {time ? format(time, 'hh:mm:ss a') : '--:--:--'}
            </span>
          </div>

          <p className="text-slate-400 font-semibold text-base" suppressHydrationWarning>
            {time ? format(time, 'EEEE, MMMM do yyyy') : 'Loading...'}
          </p>
        </div>
      </nav>

      {/* MAIN */}
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-4rem)] w-full">
          <div className="w-full pb-24">

            {/* CAROUSEL (unchanged) */}
            <div className="w-full flex justify-center overflow-hidden pt-10 pb-6">
              <Carousel
                opts={{ loop: true, align: 'center', skipSnaps: false }}
                className="w-full"
                setApi={(api) => (carouselApiRef.current = api as any)}
              >
                <CarouselContent className="ml-0 overflow-visible py-10">
                  {heroImages.map((img, index) => {
                    const isFocused = focusedIndex === index;
                    const offset = index - focusedIndex;

                    return (
                      <CarouselItem
                        key={img.id}
                        className="basis-[80%] md:basis-[42%] lg:basis-[28%] pl-0 flex justify-center"
                      >
                        <motion.div
                          onClick={() => {
                            setFocusedIndex(index);
                            carouselApiRef.current?.scrollTo?.(index);
                          }}
                          animate={{
                            scale: isFocused ? 1 : 0.78,
                            rotateY: offset < 0 ? 28 : offset > 0 ? -28 : 0,
                            y: isFocused ? 0 : 28,
                            opacity: isFocused ? 1 : 0.45,
                          }}
                          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                          style={{
                            transformStyle: 'preserve-3d',
                            perspective: 2500,
                            zIndex: isFocused ? 100 : 1,
                          }}
                          className="relative cursor-pointer select-none flex items-center justify-center"
                        >
                          <div className="relative flex items-center justify-center rounded-[2.5rem] bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_25px_70px_rgba(0,0,0,0.18)] p-5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.imageUrl}
                              alt="carousel-image"
                              loading="eager"
                              draggable={false}
                              className="max-h-[420px] max-w-full object-contain rounded-[2rem]"
                            />
                          </div>
                        </motion.div>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
              </Carousel>
            </div>

            {/* HERO TEXT */}
            <div className="space-y-4 px-4">
              <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight text-center">
                Welcome to LabCab
              </h2>

              <p className="text-lg md:text-2xl text-slate-500 max-w-3xl mx-auto text-center">
                Smart Laboratory Cabinet for Borrowing and Returning Laboratory Apparatus
              </p>
            </div>

            {/* BUTTONS (FIXED HERE) */}
            <div className="w-full px-4 md:px-8 mt-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 place-items-center">

                {menuButtons.map((btn, i) => (
                  <motion.div
                    key={btn.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex justify-center"
                  >
                    <Button
                      onClick={() => router.push(btn.path)}
                      className={`
                        w-[320px]
                        h-[320px]
                        flex-none
                        rounded-[3rem]
                        flex flex-col items-center justify-center gap-6
                        text-white shadow-2xl
                        transition-all active:scale-95
                        border-none
                        ${btn.color}
                        hover:brightness-110
                      `}
                    >
                      <btn.icon className="w-20 h-20" />

                      <div className="space-y-2 text-center">
                        <span className="text-3xl font-black tracking-tight block">
                          {btn.label.toUpperCase()}
                        </span>
                        <p className="text-white/70 text-base font-medium">
                          {btn.desc}
                        </p>
                      </div>
                    </Button>
                  </motion.div>
                ))}

              </div>
            </div>

            {/* LANDSCAPE (unchanged) */}
            <div className="mt-12 w-full pb-8 px-4">
              <div className="w-full min-h-[240px] md:min-h-[340px] rounded-[2.5rem] overflow-hidden bg-slate-100 flex items-center justify-center p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {landscapeImage ? (
                  <img
                    src={landscapeImage}
                    alt="landscape-image"
                    className="max-w-full max-h-[320px] object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100" />
                )}
              </div>
            </div>

          </div>
        </ScrollArea>
      </main>

      {/* FOOTER unchanged */}
      <footer className="h-16 bg-slate-900 text-white/60 px-12 flex items-center justify-between text-lg font-medium shrink-0">
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
          <span className="text-white/40 italic">
            A Cabinet that knows what&apos;s Inside!
          </span>
        </div>
      </footer>
    </div>
  );
}