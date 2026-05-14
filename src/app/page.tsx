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
import { ScrollArea } from '@/components/ui/scroll-area';


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
    // IDs you keep in placeholder-images.json
    // (title, highlights, tagline, team)
    const ids = new Set(['team', 'highlights', 'tagline', 'title']);
    return PlaceHolderImages.filter((img) => ids.has(img.id));
  }, []);

  const landscapeImage = useMemo(() => {
    // Landscape image will be the first hero image ("title")
    return heroImages[3]?.imageUrl ?? PlaceHolderImages[0]?.imageUrl ?? '';
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

<main className="flex-1 overflow-hidden">
  {/* Fullscreen Scroll Area */}
  <ScrollArea className="h-[calc(100vh-4rem)] w-full">
    <div className="w-full space-y-12 pb-0">
      
      {/* 3D Coverflow Carousel */}
      <div className="w-full flex justify-center overflow-hidden pt-6">
        <Carousel
          opts={{
            loop: true,
            align: "center",
          }}
          className="w-full"
          setApi={(api) => {
            carouselApiRef.current = api as any;
          }}
        >
          <CarouselContent className="ml-0 flex items-center">
            {heroImages.length > 0 ? (
              heroImages.map((img, index) => (
                <CarouselItem
                  key={img.id}
                  className="
                    basis-[75%]
                    md:basis-[38%]
                    lg:basis-[28%]
                    pl-0
                    flex
                    justify-center
                  "
                >
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                    className="
                      relative
                      h-[280px]
                      md:h-[360px]
                      w-full
                      overflow-hidden
                      rounded-[2rem]
                      shadow-2xl
                    "
                    style={{
                      transform:
                        index % 2 === 0
                          ? "perspective(1000px) rotateY(-12deg)"
                          : "perspective(1000px) rotateY(12deg)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.imageUrl}
                      alt={img.description}
                      className="w-full h-full object-cover"
                      loading="eager"
                    />

                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black/30" />

                    {/* Text */}
                    <div className="absolute bottom-0 left-0 p-6 text-left">
                      <h2 className="text-3xl font-black text-white">
                        {img.description}
                      </h2>
                      <p className="text-white/70 text-lg">
                        LabCab Showcase
                      </p>
                    </div>
                  </motion.div>
                </CarouselItem>
              ))
            ) : (
              <CarouselItem className="basis-full pl-0">
                <div className="h-[320px] w-full bg-slate-200 rounded-[2rem]" />
              </CarouselItem>
            )}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Hero Text */}
      <div className="space-y-4 px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="
            text-5xl
            md:text-7xl
            font-black
            text-slate-900
            tracking-tight
            text-center
          "
        >
          Welcome to LabCab
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="
            text-lg
            md:text-2xl
            text-slate-500
            max-w-3xl
            mx-auto
            text-center
          "
        >
          Smart Laboratory Cabinet for Borrowing and Returning Laboratory
          Apparatus
        </motion.p>
      </div>

      {/* Buttons */}
      <div className="w-full px-4 md:px-8 pb-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {menuButtons.map((btn, i) => (
            <motion.div
              key={btn.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <Button
                className={`
                  w-full
                  h-80
                  rounded-[2.5rem]
                  flex
                  flex-col
                  gap-6
                  text-white
                  shadow-2xl
                  transition-all
                  active:scale-95
                  border-none
                  ${btn.color}
                  hover:brightness-110
                `}
                onClick={() => router.push(btn.path)}
              >
                <btn.icon className="w-24 h-24" />

                <div className="space-y-1 text-center">
                  <span className="text-4xl font-black tracking-tight">
                    {btn.label.toUpperCase()}
                  </span>

                  <p className="text-white/70 text-lg font-medium">
                    {btn.desc}
                  </p>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Bottom Landscape */}
        <div className="mt-10 w-full">
          <div
            className="
              w-full
              h-[220px]
              md:h-[280px]
              overflow-hidden
              rounded-none
            "
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {landscapeImage ? (
              <img
                src={landscapeImage}
                alt="LabCab landscape"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-100" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  </ScrollArea>
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

