"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ChevronLeft, QrCode, CheckCircle2, RotateCcw, Mail, Lock } from 'lucide-react';
import { KioskKeyboard } from '@/components/kiosk/KioskKeyboard';
import { QrScannerModal } from '@/components/kiosk/QrScannerModal';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useAuth } from '@/firebase';
import { collection, updateDoc, doc, query, where, getDocs, limit, serverTimestamp } from 'firebase/firestore';
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

  const handleAuth = async () => {
    if (!auth || !db) return;
    try {
      // Validate Institutional Email
      if (!email.toLowerCase().endsWith('@marsu.edu.ph')) {
        toast({ variant: "destructive", title: "Invalid Email", description: "Use institutional email (@marsu.edu.ph)." });
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, pin);
      const userQuery = query(collection(db, 'users'), where('email', '==', email), limit(1));
      const userSnap = await getDocs(userQuery);
      
      if (!userSnap.empty) {
        setUser({ id: userCredential.user.uid, ...userSnap.docs[0].data() });
        fetchActiveTransactions(userCredential.user.uid);
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
      fetchActiveTransactions(userSnap.docs[0].id);
      toast({ title: "Authenticated", description: `Welcome back, ${userData.firstName}` });
    } else {
      toast({ variant: "destructive", title: "Not Found", description: "Account not recognized." });
    }
  };

  const fetchActiveTransactions = async (userId: string) => {
    if (!db) return;
    const q = query(collection(db, 'transactions'), where('userId', '==', userId), where('status', '==', 'active'));
    const snap = await getDocs(q);
    const txs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setTransactions(txs);
    if (txs.length === 0) {
      toast({ title: "No Borrows", description: "You have no active borrowings to return." });
      router.push('/');
    } else {
      setStep('active');
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
        const apparatusSnap = await getDocs(query(collection(db, 'apparatus'), where('__name__', '==', item.itemId)));
        if (!apparatusSnap.empty) {
          const currentStock = apparatusSnap.docs[0].data().stock;
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
          <motion.div key="auth" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-5xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8 flex flex-col justify-center">
                <div className="space-y-2 text-center lg:text-left">
                  <h2 className="text-3xl font-black text-slate-800">Quick Scan</h2>
                  <p className="text-slate-500 text-lg">Scan your ID QR code to check in</p>
                </div>
                <Button 
                  variant="outline" 
                  className="h-80 rounded-[2.5rem] flex flex-col gap-6 border-4 border-dashed border-primary/20 hover:border-primary hover:bg-primary/5 transition-all shadow-xl group" 
                  onClick={() => setIsScannerOpen(true)}
                >
                  <QrCode className="w-32 h-32 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-2xl font-black uppercase tracking-widest">Identify Yourself</span>
                </Button>
              </div>
              
              <div className="space-y-8 flex flex-col justify-center">
                <div className="space-y-2 text-center lg:text-left">
                  <h2 className="text-3xl font-black text-slate-800">Manual Check-in</h2>
                  <p className="text-slate-500 text-lg">Enter email and PIN to proceed</p>
                </div>
                <div className="space-y-6 bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <div className="space-y-3">
                    <Label className="text-xl font-bold flex items-center gap-2">
                      <Mail className="w-5 h-5 text-primary" />
                      Email Address
                    </Label>
                    <Input 
                      placeholder="username@marsu.edu.ph" 
                      className="h-16 text-xl rounded-2xl bg-slate-50" 
                      value={email} 
                      onFocus={() => setActiveField('email')} 
                      readOnly 
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xl font-bold flex items-center gap-2">
                      <Lock className="w-5 h-5 text-primary" />
                      6-Digit PIN
                    </Label>
                    <Input 
                      type="password" 
                      placeholder="••••••" 
                      className="h-16 text-2xl rounded-2xl bg-slate-50 text-center tracking-[0.5em]" 
                      value={pin} 
                      onFocus={() => setActiveField('pin')} 
                      readOnly 
                    />
                  </div>
                  <Button 
                    className="w-full h-20 text-2xl font-black rounded-2xl shadow-lg blue-gradient text-white border-none mt-4" 
                    onClick={handleAuth}
                  >
                    IDENTIFY & PROCEED
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'active' && (
          <motion.div key="active" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl font-black text-center">Active Borrowings</h2>
            <div className="grid grid-cols-1 gap-6">
              {transactions.map(tx => (
                <Card key={tx.id} className="p-6 rounded-3xl hover:border-primary cursor-pointer transition-all border-2 bg-white" onClick={() => { setSelectedTransaction(tx); setStep('confirm'); }}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Transaction ID: {tx.id.slice(-6).toUpperCase()}</p>
                      <div className="flex flex-wrap gap-2">
                        {tx.items.map((it: any, i: number) => (
                          <span key={i} className="px-3 py-1 bg-primary/10 text-primary font-bold rounded-lg text-sm">{it.name} x{it.quantity}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400 font-bold uppercase">Deadline</p>
                      <p className="text-lg font-black text-orange-600">
                        {tx.deadline ? new Date(tx.deadline).toLocaleTimeString() : 'N/A'}
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
            <Card className="p-8 rounded-[2.5rem] shadow-2xl space-y-8 border-4 border-teal-500/10 bg-white">
              <div className="text-center space-y-4">
                <RotateCcw className="w-20 h-20 text-teal-500 mx-auto" />
                <h2 className="text-4xl font-black">Confirm Return</h2>
                <p className="text-xl text-slate-500">The following compartment/s for the apparatus will be unlocked.</p>
              </div>
              <div className="space-y-4 bg-slate-50 p-6 rounded-3xl">
                {selectedTransaction.items.map((it: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-xl font-bold">
                    <span>{it.name}</span>
                    <span className="text-teal-600">x{it.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1 h-20 text-xl font-bold rounded-2xl" onClick={() => setStep('active')}>BACK</Button>
                <Button className="flex-1 h-20 text-xl font-bold rounded-2xl teal-gradient text-white border-none" onClick={finalizeReturn}>CONFIRM RETURN</Button>
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
              <p className="text-2xl md:text-3xl text-slate-500 font-medium">Thank you for returning the items properly.</p>
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
