
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Camera, QrCode, Scan } from 'lucide-react';

export default function QrScanPage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    // Simulate successful scan after 3 seconds
    const timer = setTimeout(() => {
      setScanning(false);
      setTimeout(() => router.push('/kiosk'), 1000);
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white">
      <div className="absolute top-8 left-8">
        <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => router.back()}>
          <ChevronLeft className="w-8 h-8" />
        </Button>
      </div>

      <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
        {/* Scanner Corners */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-8 border-l-8 border-secondary rounded-tl-3xl" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-8 border-r-8 border-secondary rounded-tr-3xl" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-8 border-l-8 border-secondary rounded-bl-3xl" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-8 border-r-8 border-secondary rounded-br-3xl" />

        {/* Scanning Line */}
        {scanning && (
          <div className="absolute top-0 left-4 right-4 h-1 bg-secondary shadow-[0_0_20px_#2DB2B9] animate-[bounce_3s_infinite] z-20" />
        )}

        <div className="text-center space-y-6">
          <div className={`p-12 bg-white/5 rounded-3xl backdrop-blur-sm transition-all duration-500 ${!scanning ? 'scale-110 bg-green-500/20' : ''}`}>
             <QrCode className={`w-32 h-32 ${!scanning ? 'text-green-400' : 'text-white/20'}`} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{scanning ? 'Scanning for QR Code...' : 'Code Verified!'}</h2>
            <p className="text-white/40">{scanning ? 'Hold your ID card or phone up to the camera' : 'Welcome back, Alex.'}</p>
          </div>
        </div>
      </div>

      <div className="mt-12 flex items-center gap-4 px-8 py-4 bg-white/5 rounded-2xl border border-white/10">
        <Camera className="w-6 h-6 text-secondary" />
        <span className="text-sm font-medium">Front-facing laboratory scanner active</span>
      </div>
    </div>
  );
}
