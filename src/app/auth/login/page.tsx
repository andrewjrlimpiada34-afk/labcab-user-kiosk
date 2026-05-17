
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { VirtualKeyboard } from '@/components/kiosk/VirtualKeyboard';
import { ChevronLeft, Lock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [studentId, setStudentId] = useState('');
  const [pin, setPin] = useState('');
  const [activeField, setActiveField] = useState<'id' | 'pin'>('id');
  const router = useRouter();
  const { toast } = useToast();

  const handleInput = (char: string) => {
    if (activeField === 'id') {
      if (studentId.length < 15) setStudentId(prev => prev + char);
    } else {
      if (pin.length < 6) setPin(prev => prev + char);
    }
  };

  const handleDelete = () => {
    if (activeField === 'id') {
      setStudentId(prev => prev.slice(0, -1));
    } else {
      setPin(prev => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (activeField === 'id') setStudentId('');
    else setPin('');
  };

  const handleLogin = () => {
    if (studentId && pin) {
      toast({
        title: "Access Granted",
        description: `Welcome back, Alex Johnson.`,
      });
      router.push('/kiosk');
    } else {
      toast({
        variant: "destructive",
        title: "Missing Credentials",
        description: "Please enter both ID and PIN.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="p-8 flex items-center">
        <Button variant="ghost" className="rounded-full w-12 h-12 p-0 bg-primary text-white shadow-lg hover:bg-primary/90" onClick={() => router.back()}>
          <ChevronLeft className="w-8 h-8" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 max-w-2xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">Manual Access</h1>
          <p className="text-slate-500">Enter your credentials to unlock the cabinet</p>
        </div>

        <div className="w-full space-y-6">
          <div className="space-y-4">
            <Label className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Student / Faculty ID
            </Label>
            <div 
              className={`p-4 h-16 text-2xl font-bold bg-white border-2 rounded-2xl flex items-center cursor-pointer transition-all ${activeField === 'id' ? 'border-primary ring-4 ring-primary/10' : 'border-slate-200'}`}
              onClick={() => setActiveField('id')}
            >
              {studentId || <span className="text-slate-300">Enter ID...</span>}
              {activeField === 'id' && <span className="w-1 h-8 bg-primary animate-pulse ml-1" />}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-lg font-semibold flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Security PIN
            </Label>
            <div 
              className={`p-4 h-16 text-2xl font-bold bg-white border-2 rounded-2xl flex items-center cursor-pointer transition-all ${activeField === 'pin' ? 'border-primary ring-4 ring-primary/10' : 'border-slate-200'}`}
              onClick={() => setActiveField('pin')}
            >
              {'•'.repeat(pin.length) || <span className="text-slate-300">Enter PIN...</span>}
              {activeField === 'pin' && <span className="w-1 h-8 bg-primary animate-pulse ml-1" />}
            </div>
          </div>

          <Button 
            className="w-full h-20 text-2xl font-bold rounded-2xl shadow-xl mt-4" 
            onClick={handleLogin}
          >
            UNLOCK CABINET
          </Button>
        </div>
      </div>

      <div className="mt-auto">
        <VirtualKeyboard onInput={handleInput} onDelete={handleDelete} onClear={handleClear} />
      </div>
    </div>
  );
}
