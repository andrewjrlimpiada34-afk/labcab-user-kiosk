
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QrScannerModalProps {
  isOpen: boolean;
  onScan: (decodedText: string) => void;
  onClose: () => void;
  title?: string;
}

export function QrScannerModal({ isOpen, onScan, onClose, title = "Scan QR Code" }: QrScannerModalProps) {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (isOpen) {
      const startScanner = async () => {
        try {
          const html5QrCode = new Html5Qrcode("qr-reader");
          scannerRef.current = html5QrCode;

          const config = { 
            fps: 10, 
            qrbox: { width: 250, height: 250 } 
          };

          await html5QrCode.start(
            { facingMode: "environment" }, 
            config, 
            (decodedText) => {
              onScan(decodedText);
              stopScanner();
              onClose();
            },
            () => {} // Silent ignore scan errors
          );
        } catch (err: any) {
          console.error("Failed to start QR scanner:", err);
          setError("Could not access camera. Please check permissions.");
        }
      };

      const timer = setTimeout(startScanner, 300);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    }
  }, [isOpen]);

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        console.error("Error stopping scanner:", e);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-slate-900 flex flex-col items-center justify-center p-4 md:p-6 text-white"
        >
          <div className="absolute top-4 right-4 md:top-8 md:right-8 z-[201]">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/10 w-12 h-12 md:w-16 md:h-16 rounded-full" 
              onClick={() => {
                stopScanner();
                onClose();
              }}
            >
              <X className="w-8 h-8 md:w-10 h-10" />
            </Button>
          </div>

          <div className="w-full max-w-lg space-y-4 md:space-y-8 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight">{title}</h2>
              <p className="text-slate-400 text-base md:text-xl">Position your QR code within the frame</p>
            </div>

            <div className="relative aspect-square w-full bg-black/40 rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl">
              <div id="qr-reader" className="w-full h-full" />
              
              {/* Overlays */}
              <div className="absolute top-4 left-4 w-12 h-12 md:w-16 md:h-16 border-t-8 border-l-8 border-secondary rounded-tl-3xl z-10" />
              <div className="absolute top-4 right-4 w-12 h-12 md:w-16 md:h-16 border-t-8 border-r-8 border-secondary rounded-tr-3xl z-10" />
              <div className="absolute bottom-4 left-4 w-12 h-12 md:w-16 md:h-16 border-b-8 border-l-8 border-secondary rounded-bl-3xl z-10" />
              <div className="absolute bottom-4 right-4 w-12 h-12 md:w-16 md:h-16 border-b-8 border-r-8 border-secondary rounded-br-3xl z-10" />
              
              {/* Scanning Line Animation */}
              <div className="absolute inset-x-0 top-0 h-1 bg-secondary shadow-[0_0_20px_#2DB2B9] animate-scan z-20" />
            </div>

            {error ? (
              <div className="flex flex-col items-center gap-4 text-destructive">
                <p className="font-bold">{error}</p>
                <Button variant="outline" className="text-white border-white/20" onClick={() => window.location.reload()}>
                  <RefreshCw className="mr-2 w-4 h-4" />
                  Retry
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 md:gap-4 text-secondary">
                <Camera className="w-6 h-6 md:w-8 h-8 animate-pulse" />
                <span className="text-sm md:text-lg font-medium">Camera active and ready</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
