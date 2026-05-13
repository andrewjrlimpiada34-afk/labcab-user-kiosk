
"use client";

import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QrScannerModalProps {
  isOpen: boolean;
  onScan: (decodedText: string) => void;
  onClose: () => void;
  title?: string;
}

export function QrScannerModal({ isOpen, onScan, onClose, title = "Scan QR Code" }: QrScannerModalProps) {
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (isOpen) {
      // Use a slightly delay to ensure DOM is ready
      const timer = setTimeout(() => {
        scanner = new Html5QrcodeScanner(
          "qr-reader",
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            showTorchButtonIfSupported: true,
          },
          /* verbose= */ false
        );

        scanner.render(
          (decodedText) => {
            onScan(decodedText);
            scanner?.clear().catch(e => {});
            onClose();
          },
          (error) => {
            // Quietly handle scan errors
          }
        );
      }, 100);

      return () => {
        clearTimeout(timer);
        if (scanner) {
          scanner.clear().catch(e => {});
        }
      };
    }
  }, [isOpen, onScan, onClose]);

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
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 w-12 h-12 md:w-16 md:h-16 rounded-full" onClick={onClose}>
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
              
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div className="w-3/4 h-1 bg-secondary shadow-[0_0_20px_#2DB2B9] animate-bounce" />
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 md:gap-4 text-secondary">
              <Camera className="w-6 h-6 md:w-8 h-8" />
              <span className="text-sm md:text-lg font-medium">Camera active and ready</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
