
"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ChevronLeft, QrCode, Mail, Lock, CheckCircle2, ShoppingBag, Plus, Minus, Beaker, FlaskConical, Box, Scissors, Thermometer, Clock } from 'lucide-react';
import { KioskKeyboard } from '@/components/kiosk/KioskKeyboard';
import { QrScannerModal } from '@/components/kiosk/QrScannerModal';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useAuth } from '@/firebase';
import { collection, addDoc, updateDoc, doc, query, where, getDocs, limit, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';

const APPARATUS_ICONS: Record<string, any> = {
  'Beaker': Beaker,
  'Erlenmeyer Flask': FlaskConical,
  'Test Tube': Box,
  'Stirring Rod': Scissors,
  'Thermometer': Thermometer,
};

export default function BorrowPage() {
  const router = useRouter();
  const { toast } = useToast();
  const db = useFirestore();
  const auth = useAuth();
  
  const [step, setStep] = useState<'auth' | 'select' | 'review' | 'time' | 'confirm' | 'success'>('auth');
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [returnTime, setReturnTime] = useState<string>('End of Day');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeField, setActiveField] = useState<'email' | 'password' | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const apparatusRef = useMemo(() => db ? collection(db, 'apparatus') : null, [db]);
  const { data: apparatusList } = useCollection(apparatusRef);

  const handleAuth = async () => {
    if (!auth || !db) return;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userQuery = query(collection(db, 'users'), where('email', '==', email), limit(1));
      const userSnap = await getDocs(userQuery);
      
      if (!userSnap.empty) {
        setUser({ id: userCredential.user.uid, ...userSnap.docs[0].data() });
        setStep('select');
      } else {
        toast({ variant: "destructive", title: "Error", description: "User profile not found." });
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Auth Failed", description: "Invalid credentials." });
    }
  };

  const handleQrScan = async (code: string) => {
    if (!db) return;
    const userQuery = query(collection(db, 'users'), where('qrCode', '==', code), limit(1));
    const userSnap = await getDocs(userQuery);
    
    if (!userSnap.empty) {
      setUser({ id: userSnap.docs[0].id, ...userSnap.docs[0].data() });
      setStep('select');
      toast({ title: "Authenticated", description: `Welcome back, ${userSnap.docs[0].data().firstName}` });
    } else {
      toast({ variant: "destructive", title: "Not Found", description: "Account not found. Please register." });
      router.push('/register');
    }
  };

  const updateCart = (id: string, delta: number, stock: number) => {
    setCart(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, Math.min(stock, current + delta));
      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  const finalizeBorrowing = async () => {
    if (!db || !user) return;
    
    const items = Object.entries(cart).map(([id, qty]) => {
      const item = apparatusList?.find(a => a.id === id);
      return { itemId: id, name: item?.name, quantity: qty };
    });

    const deadline = new Date();
    if (returnTime === '1 Hour') deadline.setHours(deadline.getHours() + 1);
    else if (returnTime === '2 Hours') deadline.setHours(deadline.getHours() + 2);
    else if (returnTime === '3 Hours') deadline.setHours(deadline.getHours() + 3);
    else deadline.setHours(17, 0, 0); 

    try {
      await addDoc(collection(db, 'transactions'), {
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        items,
        status: 'active',
        borrowTime: serverTimestamp(),
        deadline: deadline.toISOString()
      });

      for (const item of items) {
        const itemRef = doc(db, 'apparatus', item.itemId);
        const original = apparatusList?.find(a => a.id === item.itemId);
        await updateDoc(itemRef, { stock: (original?.stock || 0) - item.quantity });
      }

      setStep('success');
      setTimeout(() => router.push('/'), 5000);
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Transaction failed." });
    }
  };

  return (
    <div className="kiosk-container p-12 overflow-y-auto">
      <header className="flex items-center justify-between mb-12">
        <Button variant="ghost" className="rounded-full w-20 h-20" onClick={() => router.push('/')}>
          <ChevronLeft className="w-12 h-12" />
        </Button>
        <h1 className="text-5xl font-black text-primary tracking-tight">Borrow Apparatus</h1>
        <div className="w-20" />
      </header>

      <AnimatePresence mode="wait">
        {step === 'auth' && (
          <motion.div key="auth" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-4xl mx-auto w-full space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Button variant="outline" className="h-80 rounded-3xl flex flex-col gap-6 border-4 border-dashed border-primary/20 hover:border-primary hover:bg-primary/5 transition-all" onClick={() => setIsScannerOpen(true)}>
                <QrCode className="w-32 h-32 text-primary" />
                <span className="text-3xl font-black">SCAN QR CODE</span>
              </Button>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-xl font-bold">Email Access</Label>
                  <Input placeholder="university.edu.ph" className="h-16 text-xl rounded-2xl" value={email} onFocus={() => setActiveField('email')} readOnly />
                </div>
                <div className="space-y-4">
                  <Label className="text-xl font-bold">Security Password</Label>
                  <Input type="password" placeholder="••••••••" className="h-16 text-xl rounded-2xl" value={password} onFocus={() => setActiveField('password')} readOnly />
                </div>
                <Button className="w-full h-20 text-2xl font-black rounded-2xl shadow-lg" onClick={handleAuth}>LOGIN & PROCEED</Button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'select' && (
          <motion.div key="select" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 pb-32">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {apparatusList?.map((item: any) => {
                const Icon = APPARATUS_ICONS[item.name] || Box;
                const qty = cart[item.id] || 0;
                return (
                  <Card key={item.id} className={`p-6 border-2 transition-all ${qty > 0 ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-slate-100'}`}>
                    <div className="flex flex-col items-center gap-4">
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${qty > 0 ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400'}`}>
                        <Icon className="w-12 h-12" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-xl font-bold">{item.name}</h3>
                        <p className="text-slate-500">{item.stock} available</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <Button variant="outline" size="icon" className="w-12 h-12 rounded-full border-2" onClick={() => updateCart(item.id, -1, item.stock)}><Minus /></Button>
                        <span className="text-3xl font-black">{qty}</span>
                        <Button variant="outline" size="icon" className="w-12 h-12 rounded-full border-2" onClick={() => updateCart(item.id, 1, item.stock)}><Plus /></Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
            {totalItems > 0 && (
              <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6">
                <Button className="w-full h-24 text-3xl font-black rounded-3xl shadow-2xl gap-4" onClick={() => setStep('review')}>
                  CONTINUE ({totalItems} ITEMS)
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {step === 'review' && (
          <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl mx-auto space-y-8">
            <Card className="rounded-3xl shadow-xl p-8 space-y-6">
              <h2 className="text-3xl font-black text-center">Review Selection</h2>
              <div className="space-y-4">
                {Object.entries(cart).map(([id, qty]) => {
                  const item = apparatusList?.find(a => a.id === id);
                  return (
                    <div key={id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <span className="text-xl font-bold">{item?.name}</span>
                      <span className="text-xl font-black text-primary">x {qty}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1 h-16 text-xl font-bold rounded-2xl" onClick={() => setStep('select')}>EDIT</Button>
                <Button className="flex-1 h-16 text-xl font-bold rounded-2xl" onClick={() => setStep('time')}>CONFIRM</Button>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 'time' && (
          <motion.div key="time" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl font-black text-center">Set Return Time</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {['1 Hour', '2 Hours', '3 Hours', 'End of Day'].map(t => (
                <Button key={t} variant={returnTime === t ? 'default' : 'outline'} className="h-32 rounded-3xl text-2xl font-black flex flex-col gap-2" onClick={() => setReturnTime(t)}>
                  <Clock className="w-8 h-8" />
                  {t}
                </Button>
              ))}
            </div>
            <Button className="w-full h-20 text-2xl font-black rounded-2xl mt-12" onClick={() => setStep('confirm')}>CONTINUE</Button>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl mx-auto space-y-8">
            <Card className="rounded-3xl shadow-2xl p-8 space-y-8 border-4 border-primary/10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-slate-400 text-sm uppercase font-bold tracking-widest">Borrower Info</Label>
                  <p className="text-2xl font-black">{user.firstName} {user.lastName}</p>
                  <p className="text-slate-500">{user.email}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400 text-sm uppercase font-bold tracking-widest">Apparatus List</Label>
                  <div className="space-y-2">
                    {Object.entries(cart).map(([id, qty]) => {
                      const item = apparatusList?.find(a => a.id === id);
                      return <p key={id} className="text-xl font-bold">• {item?.name} (x{qty})</p>;
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400 text-sm uppercase font-bold tracking-widest">Return Deadline</Label>
                  <p className="text-2xl font-black text-primary">{returnTime}</p>
                </div>
              </div>
              <Button className="w-full h-24 text-3xl font-black rounded-3xl shadow-xl" onClick={finalizeBorrowing}>CONFIRM BORROWING</Button>
            </Card>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center text-center space-y-12">
            <div className="w-48 h-48 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle2 className="w-32 h-32" />
            </div>
            <div className="space-y-4">
              <h2 className="text-7xl font-black text-slate-900">Borrowing Confirmed</h2>
              <p className="text-3xl text-slate-500 font-medium">Cabinet doors are unlocked. Please take your items.</p>
            </div>
            <p className="text-xl text-slate-400">Returning to Home in 5 seconds...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <KioskKeyboard visible={activeField !== null} onInput={(val) => {
        if (activeField === 'email') setEmail(val);
        if (activeField === 'password') setPassword(val);
      }} onClose={() => setActiveField(null)} initialValue={activeField === 'email' ? email : password} />
      <QrScannerModal isOpen={isScannerOpen} onScan={handleQrScan} onClose={() => setIsScannerOpen(false)} title="Login via QR Code" />
    </div>
  );
}
