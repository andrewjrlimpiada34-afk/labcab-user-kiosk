
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ChevronLeft, QrCode, CheckCircle2, RotateCcw, Mail, Lock, UserCircle } from 'lucide-react';
import { KioskKeyboard } from '@/components/kiosk/KioskKeyboard';
import { QrScannerModal } from '@/components/kiosk/QrScannerModal';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useAuth } from '@/firebase';
import { collection, updateDoc, doc, query, where, getDocs, limit, serverTimestamp, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function ReturnPage() {
  const router = useRouter();
  const { toast } = useToast();
  const db = useFirestore();
  const auth = useAuth();
  
  const [step, setStep] = useState<'auth' | 'active' | 'confirm' | 'success'>('auth');
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [activeField, setActiveField] = useState<'email' | 'pin' | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleAuth = async () => {
    if (!auth || !db || isAuthenticating) return;
    setIsAuthenticating(true);
    
    try {
      if (!email.toLowerCase().endsWith('@marsu.edu.ph')) {
        toast({ variant: "destructive", title: "Invalid Email", description: "Use institutional email (@marsu.edu.ph)." });
        setIsAuthenticating(false);
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, pin);
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userSnap = await getDoc(userDocRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUser({ id: userSnap.id, ...userData });
        fetchActiveTransactions(userSnap.id);
      } else {
        toast({ variant: "destructive", title: "Error", description: "User profile not found." });
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Auth Failed", description: "Invalid credentials." });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleQrScan = async (code: string) => {
    if (!db || isAuthenticating) return;
    setIsAuthenticating(true);
    
    try {
      const cleanCode = code.trim().toUpperCase();
      const userQuery = query(collection(db, 'users'), where('qrCode', '==', cleanCode), limit(1));
      const userSnap = await getDocs(userQuery);
      
      if (!userSnap.empty) {
        const userData = userSnap.docs[0].data();
        setUser({ id: userSnap.docs[0].id, ...userData });
        fetchActiveTransactions(userSnap.docs[0].id);
        toast({ title: "Authenticated", description: `Welcome back, ${userData.firstName}` });
      } else {
        toast({ variant: "destructive", title: "Not Found", description: "Account not recognized." });
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Scan Failed", description: "Could not verify QR code." });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const fetchActiveTransactions = async (userId: string) => {
    if (!db) return;
    try {
      const q = query(collection(db, 'transactions'), where('userId', '==', userId), where('status', '==', 'active'));
      const snap = await getDocs(q);
      const txs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTransactions(txs);
      
      if (txs.length === 0) {
        toast({ title: "No Borrows", description: "You have no active borrowings to return." });
        setTimeout(() => router.push('/'), 2000);
      } else {
        setStep('active');
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch transactions." });
    }
  };

  const finalizeReturn = async () => {
    if (!db || !selectedTransaction) return;
    
    try {
      await updateDoc(doc(db, 'transactions', selectedTransaction.id), {
        status: 'returned',
        returnTime: serverTimestamp()
      });

      for (const item of selectedTransaction.items) {
        const itemRef = doc(db, 'apparatus', item.itemId);
        const apparatusSnap = await getDoc(itemRef);
        if (apparatusSnap.exists()) {
          const currentStock = apparatusSnap.data().stock || 0;
          await updateDoc(itemRef, { stock: currentStock + item.quantity });
        }
      }

      setStep('success');
      setTimeout(() => router.push('/'), 5000);
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Return failed." });
    }
  };

  return (
    <div className="kiosk-container p-6 md:p-12 overflow-y-auto min-h-screen bg-slate-50">
      <header className="flex items-center justify-between mb-8 md:mb-12">
        <Button variant="ghost" className="rounded-full w-14 h-14 md:w-20 md:h-20" onClick={() => router.push('/')}>
          <ChevronLeft className="w-8 h-8 md:w-12 md:h-12" />
        </Button>
        <h1 className="text-3xl md:text-5xl font-black text-primary tracking-tight">Return Apparatus</h1>
        <div className="w-14 md:w-20" />
      </header>

      <AnimatePresence mode="wait">
        {step === 'auth' && (
          <motion.div key="auth" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-5xl mx-auto w-full space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-slate-800">Identify Yourself</h2>
              <p className="text-slate-500 text-xl">Scan your ID or use your PIN to return items</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6 h-full">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center gap-8 h-full">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-primary" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold">QR Fast Scan</h3>
                    <p className="text-slate-500 text-lg">Instant check-in via QR</p>
                  </div>
                  <Button 
                    className="w-full h-24 text-2xl font-black rounded-3xl blue-gradient text-white border-none mt-auto shadow-lg" 
                    onClick={() => setIsScannerOpen(true)}
                    disabled={isAuthenticating}
                  >
                    {isAuthenticating ? 'VERIFYING...' : 'START SCANNING'}
                  </Button>
                </div>
              </div>

              <div className="space-y-6 h-full">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6 h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center">
                      <UserCircle className="w-10 h-10 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Manual Entry</h3>
                      <p className="text-slate-500">Log in with Email & PIN</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 flex-1">
                    <div className="space-y-2">
                      <Label className="text-lg font-bold">Institutional Email</Label>
                      <div 
                        className={`h-16 text-xl rounded-2xl bg-slate-50 border-2 flex items-center px-4 cursor-pointer transition-all ${activeField === 'email' ? 'border-primary ring-2 ring-primary/10' : 'border-transparent'}`}
                        onClick={() => setActiveField('email')}
                      >
                        {email || <span className="text-slate-400">user@marsu.edu.ph</span>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-lg font-bold">6-Digit PIN</Label>
                      <div 
                        className={`h-16 text-3xl rounded-2xl bg-slate-50 border-2 flex items-center justify-center cursor-pointer transition-all tracking-widest font-black ${activeField === 'pin' ? 'border-primary ring-2 ring-primary/10' : 'border-transparent'}`}
                        onClick={() => setActiveField('pin')}
                      >
                        {'•'.repeat(pin.length) || <span className="text-slate-400 text-xl tracking-normal">••••••</span>}
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="w-full h-24 text-2xl font-black rounded-3xl teal-gradient text-white border-none shadow-lg mt-4" 
                    onClick={handleAuth}
                    disabled={isAuthenticating || !email || pin.length < 6}
                  >
                    {isAuthenticating ? 'VERIFYING...' : 'IDENTIFY MANUAL'}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'active' && (
          <motion.div key="active" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl font-black text-center">Select Items to Return</h2>
            <div className="grid grid-cols-1 gap-6">
              {transactions.map(tx => (
                <Card key={tx.id} className="p-8 rounded-3xl hover:border-primary cursor-pointer transition-all border-2 bg-white group" onClick={() => { setSelectedTransaction(tx); setStep('confirm'); }}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-4">
                      <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">TX ID: {tx.id.slice(-6).toUpperCase()}</p>
                      <div className="flex flex-wrap gap-3">
                        {tx.items.map((it: any, i: number) => (
                          <span key={i} className="px-4 py-2 bg-primary/10 text-primary font-bold rounded-xl text-lg">{it.name} x{it.quantity}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm text-slate-400 font-bold uppercase">Deadline</p>
                      <p className="text-2xl font-black text-orange-600">
                        {tx.deadline ? new Date(tx.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl mx-auto space-y-8">
            <Card className="p-8 md:p-12 rounded-[2.5rem] shadow-2xl space-y-8 border-4 border-teal-500/10 bg-white">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mx-auto">
                  <RotateCcw className="w-12 h-12 text-teal-500" />
                </div>
                <h2 className="text-4xl font-black">Confirm Return</h2>
                <p className="text-xl text-slate-500">Returning these items to their designated compartments:</p>
              </div>
              <div className="space-y-4 bg-slate-50 p-8 rounded-3xl">
                {selectedTransaction.items.map((it: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-2xl font-bold">
                    <span className="text-slate-700">{it.name}</span>
                    <span className="text-teal-600">x{it.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1 h-20 text-xl font-bold rounded-2xl" onClick={() => setStep('active')}>BACK</Button>
                <Button className="flex-1 h-24 text-2xl font-black rounded-3xl teal-gradient text-white border-none shadow-xl" onClick={finalizeReturn}>FINALIZE RETURN</Button>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center text-center space-y-12 py-20">
            <div className="w-48 h-48 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 shadow-inner">
              <CheckCircle2 className="w-32 h-32" />
            </div>
            <div className="space-y-4">
              <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight">Return Successful</h2>
              <p className="text-2xl md:text-3xl text-slate-500 font-medium">The apparatus has been logged back into inventory.</p>
            </div>
            <p className="text-xl text-slate-400">Returning to Home in 5 seconds...</p>
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
      <QrScannerModal isOpen={isScannerOpen} onScan={handleQrScan} onClose={() => setIsScannerOpen(false)} title="Authenticate via QR" />
    </div>
  );
}
