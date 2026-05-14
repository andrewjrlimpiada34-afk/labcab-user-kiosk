"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {Microscope, UserPlus, ShoppingBag, RotateCcw, Clock,} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import {Carousel, CarouselContent, CarouselItem,} from '@/components/ui/carousel';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Home() {
  const router = useRouter();
  const db = useFirestore();

  const [time, setTime] = useState<Date | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Active Borrows Count
  const transactionsRef = db ? collection(db, 'transactions') : null;

  const activeQuery = transactionsRef
    ? query(transactionsRef, where('status', '==', 'active'))
    : null;

  const { data: activeTransactions } = useCollection(activeQuery);

  // Live Clock
  useEffect(() => {
    setTime(new Date());

    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Menu Buttons
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

  // Hero Images
  const heroImages = useMemo(() => {
    const ids = new Set([
      'highlights',
      'tagline',
      'title',
    ]);

    return PlaceHolderImages.filter((img) =>
      ids.has(img.id)
    );
  }, []);

  // Landscape Banner
  const landscapeImage = useMemo(() => {
    return (
      heroImages[3]?.imageUrl ??
      PlaceHolderImages[0]?.imageUrl ??
      ''
    );
  }, [heroImages]);

  // Carousel API
  const carouselApiRef = useRef<any>(null);

  // Auto Rotate Carousel
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!carouselApiRef.current) return;

      const nextIndex =
        focusedIndex === heroImages.length - 1
          ? 0
          : focusedIndex + 1;

      carouselApiRef.current.scrollTo?.(nextIndex);

      setFocusedIndex(nextIndex);
    }, 5000);

    return () => {
      window.clearInterval(id);
    };
  }, [focusedIndex, heroImages.length]);

  return (
    <div className="kiosk-container flex flex-col h-screen overflow-hidden bg-white">

      {/* Navbar */}
      <nav className="h-24 bg-white border-b px-12 flex items-center justify-between shadow-sm z-10">

        {/* Logo */}
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

        {/* Clock */}
        <div className="text-right">
          <div className="flex items-center justify-end gap-2 text-2xl font-bold text-slate-700">
            <Clock className="w-6 h-6 text-primary" />

            <span suppressHydrationWarning>
              {time
                ? format(time, 'hh:mm:ss a')
                : '--:--:--'}
            </span>
          </div>

          <p
            className="text-slate-400 font-semibold text-base"
            suppressHydrationWarning
          >
            {time
              ? format(time, 'EEEE, MMMM do yyyy')
              : 'Loading...'}
          </p>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">

        <ScrollArea className="h-[calc(100vh-4rem)] w-full">

          <div className="w-full space-y-12 pb-0">

            {/* 3D Carousel */}
            <div className="w-full flex justify-center overflow-hidden pt-10 pb-2">

              <Carousel
                opts={{
                  loop: true,
                  align: 'center',
                  skipSnaps: false,
                }}
                className="w-full"
                setApi={(api) => {
                  carouselApiRef.current = api as any;
                }}
              >
                <CarouselContent className="ml-0 overflow-visible py-10">

                  {heroImages.length > 0 ? (
                    heroImages.map((img, index) => {
                      const isFocused =
                        focusedIndex === index;

                      const offset =
                        index - focusedIndex;

                      return (
                        <CarouselItem
                          key={img.id}
                          className="
                            basis-[82%]
                            md:basis-[44%]
                            lg:basis-[30%]
                            pl-0
                            flex
                            justify-center
                          "
                        >
                          <motion.div
                            onClick={() => {
                              setFocusedIndex(index);

                              carouselApiRef.current?.scrollTo?.(
                                index
                              );
                            }}
                            animate={{
                              scale: isFocused
                                ? 1
                                : 0.78,

                              rotateY:
                                offset < 0
                                  ? 28
                                  : offset > 0
                                  ? -28
                                  : 0,

                              rotateX:
                                isFocused
                                  ? 0
                                  : 3,

                              y:
                                isFocused
                                  ? 0
                                  : 30,

                              opacity:
                                isFocused
                                  ? 1
                                  : 0.45,
                            }}
                            transition={{
                              duration: 0.75,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            style={{
                              transformStyle:
                                'preserve-3d',

                              perspective: 2500,

                              zIndex:
                                isFocused
                                  ? 100
                                  : 1,
                            }}
                            whileHover={{
                              scale:
                                isFocused
                                  ? 1.02
                                  : 0.82,
                            }}
                            className="
                              relative
                              cursor-pointer
                              select-none
                            "
                          >

                            {/* Card */}
                            <div
                              className="
                                relative
                                h-[280px]
                                md:h-[380px]
                                lg:h-[450px]
                                w-full
                                overflow-hidden
                                rounded-[2.8rem]
                                bg-transparent
                                backdrop-blur-md
                                border
                                border-white/20
                                shadow-[0_35px_80px_rgba(0,0,0,0.20)]
                              "
                            >
                              {/* Image */}
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={img.imageUrl}
                                alt="carousel-image"
                                loading="eager"
                                draggable={false}
                                className="
                                  w-full
                                  h-full
                                  object-contain
                                  transition-transform
                                  duration-700
                                "
                              />

                              {/* Elegant Glass Reflection */}
                              <div
                                className="
                                  absolute
                                  inset-0
                                  bg-[linear-gradient(120deg,rgba(255,255,255,0.20),transparent_35%)]
                                "
                              />

                              {/* Soft Dark Fade */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />

                              {/* Glow */}
                              {isFocused && (
                                <div
                                  className="
                                    absolute
                                    inset-0
                                    rounded-[2.8rem]
                                    ring-2
                                    ring-white/20
                                    shadow-[0_0_100px_rgba(255,255,255,0.18)]
                                  "
                                />
                              )}
                            </div>

                            {/* Soft Shadow */}
                            <div
                              className="
                                absolute
                                left-[12%]
                                right-[12%]
                                -bottom-8
                                h-10
                                rounded-full
                                bg-black/20
                                blur-2xl
                              "
                            />
                          </motion.div>
                        </CarouselItem>
                      );
                    })
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
                Smart Laboratory Cabinet for Borrowing and Returning Laboratory Apparatus
              </motion.p>
            </div>

            {/* Buttons */}
            <div className="w-full px-4 md:px-8 pb-0">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {menuButtons.map((btn, i) => (
                  <motion.div
                    key={btn.label}
                    initial={{
                      opacity: 0,
                      scale: 0.9,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{
                      delay: 0.2 + i * 0.1,
                    }}
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
                      onClick={() =>
                        router.push(btn.path)
                      }
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

              {/* Landscape Banner */}
              <div className="mt-10 w-full relative">

                <div
                  className="
                    w-full
                    h-[240px]
                    md:h-[340px]
                    overflow-hidden
                    rounded-[2rem]
                    bg-slate-100
                  "
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {landscapeImage ? (
                    <img
                      src={landscapeImage}
                      alt="landscape-image"
                      className="
                        w-full
                        h-full
                        object-contain
                      "
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </main>

      {/* Footer */}
      <footer className="h-16 bg-slate-900 text-white/60 px-12 flex items-center justify-between text-lg font-medium">

        <div className="flex gap-8">

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />

            <span>
              Active Borrows:{' '}
              {activeTransactions?.length || 0}
            </span>
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