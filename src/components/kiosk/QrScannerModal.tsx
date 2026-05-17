"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ScanLine, Keyboard, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QrScannerModalProps {
  isOpen: boolean;
  onScan: (decodedText: string) => void;
  onClose: () => void;
  title?: string;
}

const SCAN_RESET_MS = 250;

export function QrScannerModal({ isOpen, onScan, onClose, title = "Scan QR Code" }: QrScannerModalProps) {
  const [capturedValue, setCapturedValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'receiving'>('idle');
  const bufferRef = useRef('');
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      bufferRef.current = '';
      setCapturedValue('');
      setStatus('idle');
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }
      return;
    }

    const resetBuffer = () => {
      bufferRef.current = '';
      setCapturedValue('');
      setStatus('idle');
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }
    };

    const armReset = () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }

      resetTimerRef.current = window.setTimeout(() => {
        resetBuffer();
      }, SCAN_RESET_MS);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        resetBuffer();
        onClose();
        return;
      }

      if (event.key === 'Enter') {
        const scannedCode = bufferRef.current.trim();
        if (!scannedCode) return;

        event.preventDefault();
        onScan(scannedCode);
        resetBuffer();
        onClose();
        return;
      }

      if (event.key === 'Backspace') {
        event.preventDefault();
        bufferRef.current = bufferRef.current.slice(0, -1);
        setCapturedValue(bufferRef.current);
        setStatus(bufferRef.current ? 'receiving' : 'idle');
        armReset();
        return;
      }

      if (event.key.length !== 1 || event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }

      event.preventDefault();
      bufferRef.current += event.key;
      setCapturedValue(bufferRef.current);
      setStatus('receiving');
      armReset();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      resetBuffer();
    };
  }, [isOpen, onClose, onScan]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-slate-950/95 flex flex-col items-center justify-center p-4 md:p-6 text-white"
        >
          <div className="absolute top-4 right-4 md:top-8 md:right-8 z-[201]">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 w-12 h-12 md:w-16 md:h-16 rounded-full"
              onClick={onClose}
            >
              <X className="w-8 h-8 md:w-10 md:h-10" />
            </Button>
          </div>

          <div className="w-full max-w-3xl space-y-6 md:space-y-8 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight">{title}</h2>
              <p className="text-slate-400 text-base md:text-xl">
                Scan using the connected kiosk QR scanner. The code will submit automatically after the scanner sends `Enter`.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 md:p-12 shadow-2xl">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/15 text-primary md:h-28 md:w-28">
                {status === 'receiving' ? (
                  <ScanLine className="h-12 w-12 animate-pulse md:h-14 md:w-14" />
                ) : (
                  <Keyboard className="h-12 w-12 md:h-14 md:w-14" />
                )}
              </div>

              <div className="space-y-3">
                <p className="text-lg font-semibold text-white md:text-2xl">
                  {status === 'receiving' ? 'Reading scanner input...' : 'Waiting for scanner input'}
                </p>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Live buffer</p>
                <div className="min-h-20 rounded-3xl border border-white/10 bg-black/30 px-6 py-5 text-lg font-black tracking-[0.25em] text-secondary md:text-2xl">
                  {capturedValue || 'READY'}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-3 text-slate-300 md:flex-row md:gap-6">
              <div className="flex items-center gap-2">
                <Keyboard className="h-5 w-5 text-secondary" />
                <span className="text-sm md:text-base">Scanner should act like a USB keyboard</span>
              </div>
              <Button
                variant="outline"
                className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                onClick={() => {
                  bufferRef.current = '';
                  setCapturedValue('');
                  setStatus('idle');
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Clear Buffer
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
