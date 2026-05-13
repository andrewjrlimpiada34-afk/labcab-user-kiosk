
"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ChevronLeft, QrCode, CheckCircle2, ShoppingBag, Plus, Minus, Beaker, FlaskConical, Box, Scissors, Thermometer, Clock, Pipette, Flame, Mail, Lock, UserCircle } from 'lucide-react';
import { KioskKeyboard } from '@/components/kiosk/KioskKeyboard';
import { QrScannerModal } from '@/components/kiosk/QrScannerModal';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useAuth } from '@/firebase';
import { collection, addDoc, updateDoc, doc, query, where, getDocs, limit, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const APPARATUS_ICONS: Record<string, any> = {
  'Beaker 250ml': Beaker,
  'Erlenmeyer Flask': FlaskConical,
  'Graduated Cylinder': Pipette,
  'Bunsen Burner': Flame,
  'Microscope': Box,
  'Test Tube Rack': Box,
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
  const [pin, setPin] = useState('');
  const [activeField, setActiveField] = useState<'email' | 'pin' | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const apparatusRef = useMemo(() => db ? collection(db, 'apparatus') : null, [db]);
  const { data: apparatusList } = useCollection(apparatusRef);

  const handleAuth = async () => {
    if (!auth || !db) return;
    try {
      if (!email.toLowerCase().endsWith('@marsu.edu.ph')) {
        toast({ variant: "destructive", title: "Invalid Email", description: "Use institutional email (@marsu.edu.ph)." });
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, pin);
      const userQuery = query(collection(db, 'users'), where('email', '==', email), limit(1));
      const userSnap = await getDocs(userQuery);
      
      if (!userSnap.empty) {
        setUser({ id: userCredential.user.uid, ...userSnap.docs[0].data() });
        setStep('select');
        toast({ title: "Authenticated", description: `Welcome back, ${userSnap.docs[0].data().firstName}` });
      } else {
        toast({ variant: "destructive", title: "Error", description: "User profile not found." });
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Auth Failed", description: "Invalid credentials." });
    }
  };

  const handleQrScan = async (code: string) => {
    if (!db) return;
    const cleanCode = code.trim().toUpperCase();
    const userQuery = query(collection(db, 'users'), where('qrCode', '==', cleanCode), limit(1));
    const userSnap = await getDocs(userQuery);
    
    if (!userSnap.empty) {
      const userData = userSnap.docs[0].data();
      setUser({ id: userSnap.docs[0].id, ...userData });
      setStep('select');
      toast({ title: "Identity Verified", description: `Welcome, ${userData.firstName} ${userData.lastName}` });
    } else {
      toast({ variant: "destructive", title: "Access Denied", description: "QR code not recognized." });
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

    const transactionData = {
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      items,
      status: 'active',
      borrowTime: serverTimestamp(),
      deadline: deadline.toISOString()
    };

    const transactionsCollection = collection(db, 'transactions');
    addDoc(transactionsCollection, transactionData)
      .then(async () => {
        for (const item of items) {
          const itemRef = doc(db, 'apparatus', item.itemId);
          const original = apparatusList?.find(a => a.id === item.itemId);
          const newStock = (original?.stock || 0) - item.quantity;
          
          updateDoc(itemRef, { stock: newStock })
            .catch(async () => {
              errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: itemRef.path,
                operation: 'update',
                requestResourceData: { stock: newStock }
              } satisfies SecurityRuleContext));
            });
        }

        setStep('success');
        setTimeout(() => router.push('/'), 5000);
      })
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: transactionsCollection.path,
          operation: 'create',
          requestResourceData: transactionData
        } satisfies SecurityRuleContext));
      });
  };

  return (
    <div className="kiosk-container p-6 md:p-12 overflow-y-auto min-h-screen bg-slate-50">
      <header className="flex items-center justify-between mb-8 md:mb-12">
        <Button variant="ghost" className="rounded-full w-14 h-14 md:w-20 md:h-20" onClick={() => router.push('/')}>
          <ChevronLeft className="w-8 h-8 md:w-12 md:h-12" />
        </Button>
        <h1 className="text-3xl md:text-5xl font-black text-primary tracking-tight">Borrow Apparatus</h1>
        <div className="w-14 md:w-20" />
      </header>

      <AnimatePresence mode="wait">
        {step === 'auth' && (
          <motion.div key="auth" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-5xl mx-auto w-full space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-slate-800">Identify Yourself</h2>
              <p className="text-slate-500 text-xl">Choose your preferred login method</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center gap-8 h-full">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-primary" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold">QR Scan</h3>
                    <p className="text-slate-500">Fast access using your ID card</p>
                  </div>
                  <Button 
                    className="w-full h-24 text-2xl font-black rounded-3xl blue-gradient text-white border-none mt-auto shadow-lg" 
                    onClick={() => setIsScannerOpen(true)}
                  >
                    OPEN SCANNER
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6 h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center">
                      <UserCircle className="w-10 h-10 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Manual Login</h3>
                      <p className="text-slate-500">Email & PIN</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 flex-1">
                    <div className="space-y-2">
                      <Label className="text-lg font-bold">Institutional Email</Label>
                      <Input 
                        placeholder="user@marsu.edu.ph" 
                        className="h-16 text-xl rounded-2xl bg-slate-50" 
                        value={email} 
                        onFocus={() => setActiveField('email')} 
                        readOnly 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-lg font-bold">6-Digit PIN</Label>
                      <Input 
                        type="password" 
                        placeholder="••••••" 
                        className="h-16 text-3xl rounded-2xl bg-slate-50 text-center tracking-widest font-black" 
                        value={pin} 
                        onFocus={() => setActiveField('pin')} 
                        readOnly 
                      />
                    </div>
                  </div>
                  <Button 
                    className="w-full h-24 text-2xl font-black rounded-3xl teal-gradient text-white border-none shadow-lg mt-4" 
                    onClick={handleAuth}
                  >
                    LOGIN MANUAL
                  </Button>
                </div>
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
                  <Card key={item.id} className={`p-6 border-2 transition-all shadow-sm ${qty > 0 ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-slate-100'}`}>
                    <div className="flex flex-col items-center gap-4">
                      <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center ${qty > 0 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <Icon className="w-10 h-10 md:w-12 md:h-12" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-lg md:text-xl font-bold line-clamp-1">{item.name}</h3>
                        <p className="text-slate-500 text-sm">{item.stock} available</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <Button variant="outline" size="icon" className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2" onClick={() => updateCart(item.id, -1, item.stock)}><Minus /></Button>
                        <span className="text-2xl md:text-3xl font-black w-8 text-center">{qty}</span>
                        <Button variant="outline" size="icon" className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2" onClick={() => updateCart(item.id, 1, item.stock)} disabled={qty >= item.stock}><Plus /></Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
            {totalItems > 0 && (
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6">
                <Button className="w-full h-20 md:h-24 text-2xl md:text-3xl font-black rounded-3xl shadow-2xl gap-4 orange-gradient text-white border-none" onClick={() => setStep('review')}>
                  CONTINUE ({totalItems} ITEMS)
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {step === 'review' && (
          <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl mx-auto space-y-8">
            <Card className="rounded-[2.5rem] shadow-xl p-8 md:p-12 space-y-8 bg-white border-none">
              <h2 className="text-3xl font-black text-center text-slate-800">Review Selection</h2>
              <div className="space-y-4">
                {Object.entries(cart).map(([id, qty]) => {
                  const item = apparatusList?.find(a => a.id === id);
                  return (
                    <div key={id} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
                      <span className="text-xl font-bold text-slate-700">{item?.name}</span>
                      <span className="text-2xl font-black text-primary">x{qty}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1 h-16 md:h-20 text-xl font-bold rounded-2xl" onClick={() => setStep('select')}>EDIT</Button>
                <Button className="flex-1 h-16 md:h-20 text-xl font-bold rounded-2xl blue-gradient text-white border-none" onClick={() => setStep('time')}>CONFIRM</Button>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 'time' && (
          <motion.div key="time" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-black text-center text-slate-800">Set Return Time</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {['1 Hour', '2 Hours', '3 Hours', 'End of Day'].map(t => (
                <Button key={t} variant={returnTime === t ? 'default' : 'outline'} className={`h-32 rounded-[2rem] text-xl md:text-2xl font-black flex flex-col gap-2 transition-all ${returnTime === t ? 'scale-105 shadow-xl ring-4 ring-primary/10' : ''}`} onClick={() => setReturnTime(t)}>
                  <Clock className="w-8 h-8" />
                  {t}
                </Button>
              ))}
            </div>
            <Button className="w-full h-20 text-2xl font-black rounded-2xl mt-8 blue-gradient text-white border-none" onClick={() => setStep('confirm')}>PROCEED</Button>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl mx-auto space-y-8">
            <Card className="rounded-[2.5rem] shadow-2xl p-8 md:p-12 space-y-8 border-4 border-primary/10 bg-white">
              <div className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-slate-400 text-xs md:text-sm uppercase font-bold tracking-widest">Borrower</Label>
                  <p className="text-2xl md:text-3xl font-black text-slate-800">{user.firstName} {user.lastName}</p>
                </div>
                <div className="space-y-3">
                  <Label className="text-slate-400 text-xs md:text-sm uppercase font-bold tracking-widest">Selected Items</Label>
                  <div className="space-y-3">
                    {Object.entries(cart).map(([id, qty]) => {
                      const item = apparatusList?.find(a => a.id === id);
                      return <p key={id} className="text-xl font-bold text-slate-700">• {item?.name} (x{qty})</p>;
                    })}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-slate-400 text-xs md:text-sm uppercase font-bold tracking-widest">Return Deadline</Label>
                  <p className="text-2xl md:text-3xl font-black text-primary">{returnTime}</p>
                </div>
              </div>
              <Button className="w-full h-24 text-2xl md:text-3xl font-black rounded-3xl shadow-xl blue-gradient text-white border-none" onClick={finalizeBorrowing}>CONFIRM BORROWING</Button>
            </Card>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center text-center space-y-12 py-20">
            <div className="w-48 h-48 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-inner">
              <CheckCircle2 className="w-32 h-32" />
            </div>
            <div className="space-y-4">
              <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight">Success!</h2>
              <p className="text-2xl md:text-3xl text-slate-500 font-medium">Cabinet doors unlocked. Please take your items.</p>
            </div>
            <p className="text-xl text-slate-400">Returning Home in 5s...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <KioskKeyboard 
        visible={activeField !== null} 
        onInput={(val) => {
          if (activeField === 'email') setEmail(val);
          if (activeField === 'pin') setPin(val);
        }} 
        onClose={() => setActiveField(null)} 
        initialValue={activeField === 'email' ? email : pin} 
        layoutType={activeField === 'pin' ? 'numeric' : 'default'}
      />
      <QrScannerModal 
        isOpen={isScannerOpen} 
        onScan={handleQrScan} 
        onClose={() => setIsScannerOpen(false)} 
        title="Identity Verification" 
      />
    </div>
  );
}
