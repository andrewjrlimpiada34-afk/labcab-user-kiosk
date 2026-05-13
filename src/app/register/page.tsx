
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, GraduationCap, UserCog, Mail, Lock, User, QrCode, CheckCircle2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KioskKeyboard } from '@/components/kiosk/KioskKeyboard';
import { QrScannerModal } from '@/components/kiosk/QrScannerModal';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const COURSES = [
  "BSCE", "BSCpE", "BSEE", "BSECE", "BSME", "BS Industrial Tech.",
  "BS Info. Tech.", "BS Info. System - Boac", "BPAd", "BSLEAd",
  "AB PolSci", "BS AIS", "BSBA", "BS Entrep.", "BS Accountancy",
  "BS Nursing", "Diploma in Midwifery", "BSES", "BTLEd", "BCAEd",
  "BSEd", "BEEd", "BSSW", "BACom", "BAELs", "BS Info. System - Sta. Cruz",
  "BSTM", "BS Agriculture", "DAT/BAT", "BS Fisheries",
  "IHS - Senior High School", "MAEd", "MPA", "EdD",
  "IHS - Junior High School", "MIT"
];

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();

  const [step, setStep] = useState<'type' | 'form' | 'success'>('type');
  const [role, setRole] = useState<'student' | 'teacher' | null>(null);
  const [formData, setFormData] = useState({
    firstName: '', mi: '', lastName: '', email: '', pin: '', 
    confirmPin: '', studentId: '', course: '', qrCode: ''
  });
  
  const [activeField, setActiveField] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleScan = (code: string) => {
    setFormData(prev => ({ ...prev, qrCode: code }));
    toast({ title: "QR Code Registered", description: `Linked: ${code}` });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;

    // Validation
    if (!formData.qrCode) {
      toast({ variant: "destructive", title: "QR Required", description: "Please register your QR code first." });
      return;
    }

    if (formData.pin.length !== 6 || !/^\d+$/.test(formData.pin)) {
      toast({ variant: "destructive", title: "Invalid PIN", description: "PIN must be exactly 6 digits." });
      return;
    }

    if (formData.pin !== formData.confirmPin) {
      toast({ variant: "destructive", title: "Mismatch", description: "PINs do not match." });
      return;
    }

    if (role === 'student') {
      if (formData.studentId.length !== 7) {
        toast({ variant: "destructive", title: "Invalid ID", description: "Student ID must be exactly 7 characters." });
        return;
      }
      if (formData.qrCode.toUpperCase() !== formData.studentId.toUpperCase()) {
        toast({ variant: "destructive", title: "ID Mismatch", description: "QR code must match Student ID." });
        return;
      }
    }

    try {
      // Firebase Auth still needs an email/password, we'll use the PIN as the password string
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.pin);
      const userRef = doc(db, 'users', userCredential.user.uid);
      
      await setDoc(userRef, {
        firstName: formData.firstName,
        mi: formData.mi,
        lastName: formData.lastName,
        email: formData.email,
        role: role,
        studentId: role === 'student' ? formData.studentId.toUpperCase() : null,
        course: role === 'student' ? formData.course : null,
        qrCode: formData.qrCode.toUpperCase(),
        createdAt: serverTimestamp()
      });

      setStep('success');
      setTimeout(() => router.push('/'), 5000);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message || "Registration failed." });
    }
  };

  const getKeyboardLayout = () => {
    if (activeField === 'pin' || activeField === 'confirmPin') return 'numeric';
    return 'default';
  };

  return (
    <div className="kiosk-container p-6 md:p-12 overflow-y-auto min-h-screen bg-slate-50">
      <header className="flex items-center justify-between mb-12">
        <Button variant="ghost" className="rounded-full w-14 h-14 md:w-20 md:h-20" onClick={() => step === 'form' ? setStep('type') : router.push('/')}>
          <ChevronLeft className="w-8 h-8 md:w-12 md:h-12" />
        </Button>
        <h1 className="text-3xl md:text-5xl font-black text-primary tracking-tight">Registration</h1>
        <div className="w-14 md:w-20" />
      </header>

      <AnimatePresence mode="wait">
        {step === 'type' && (
          <motion.div key="type" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col items-center justify-center gap-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-700">Select Account Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
              <Button variant="outline" className="h-64 md:h-96 rounded-[2.5rem] md:rounded-[3rem] flex flex-col gap-6 text-slate-700 border-4 hover:border-primary hover:bg-primary/5 shadow-xl transition-all active:scale-95" onClick={() => { setRole('teacher'); setStep('form'); }}>
                <UserCog className="w-24 h-24 md:w-32 md:h-32 text-primary" />
                <span className="text-3xl md:text-4xl font-black">TEACHER</span>
              </Button>
              <Button variant="outline" className="h-64 md:h-96 rounded-[2.5rem] md:rounded-[3rem] flex flex-col gap-6 text-slate-700 border-4 hover:border-secondary hover:bg-secondary/5 shadow-xl transition-all active:scale-95" onClick={() => { setRole('student'); setStep('form'); }}>
                <GraduationCap className="w-24 h-24 md:w-32 md:h-32 text-secondary" />
                <span className="text-3xl md:text-4xl font-black">STUDENT</span>
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'form' && (
          <motion.form key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSubmit} className="max-w-4xl mx-auto w-full space-y-8 pb-32">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              <div className="md:col-span-2 space-y-3">
                <Label className="text-xl font-bold">First Name</Label>
                <Input placeholder="Required" className="h-16 text-2xl rounded-2xl" value={formData.firstName} onFocus={() => setActiveField('firstName')} readOnly />
              </div>
              <div className="md:col-span-1 space-y-3">
                <Label className="text-xl font-bold">M.I.</Label>
                <Input placeholder="Opt" className="h-16 text-2xl rounded-2xl text-center" value={formData.mi} onFocus={() => setActiveField('mi')} readOnly />
              </div>
              <div className="md:col-span-3 space-y-3">
                <Label className="text-xl font-bold">Last Name</Label>
                <Input placeholder="Required" className="h-16 text-2xl rounded-2xl" value={formData.lastName} onFocus={() => setActiveField('lastName')} readOnly />
              </div>
            </div>

            {role === 'student' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-xl font-bold">Student ID (7-Characters)</Label>
                  <Input placeholder="e.g. 23B1234" className="h-16 text-2xl rounded-2xl" value={formData.studentId} onFocus={() => setActiveField('studentId')} readOnly />
                </div>
                <div className="space-y-3">
                  <Label className="text-xl font-bold">Course</Label>
                  <Select onValueChange={(v) => handleInputChange('course', v)}>
                    <SelectTrigger className="h-16 text-2xl rounded-2xl bg-white">
                      <SelectValue placeholder="Select Course" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {COURSES.map(c => <SelectItem key={c} value={c} className="text-xl">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-xl font-bold">Institutional Email</Label>
              <Input type="email" placeholder="university.edu.ph" className="h-16 text-2xl rounded-2xl" value={formData.email} onFocus={() => setActiveField('email')} readOnly />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-xl font-bold">6-Digit PIN</Label>
                <Input type="password" placeholder="••••••" className="h-16 text-2xl rounded-2xl" value={formData.pin} onFocus={() => setActiveField('pin')} readOnly />
              </div>
              <div className="space-y-3">
                <Label className="text-xl font-bold">Confirm PIN</Label>
                <Input type="password" placeholder="Repeat PIN" className="h-16 text-2xl rounded-2xl" value={formData.confirmPin} onFocus={() => setActiveField('confirmPin')} readOnly />
              </div>
            </div>

            <Button type="button" className={`w-full h-24 rounded-3xl text-2xl md:text-3xl font-black gap-4 shadow-xl ${formData.qrCode ? 'bg-green-600' : 'bg-slate-800'} text-white border-none`} onClick={() => setIsScannerOpen(true)}>
              <QrCode className="w-10 h-10" />
              {formData.qrCode ? 'QR REGISTERED' : 'REGISTER YOUR QR CODE'}
            </Button>

            <Button type="submit" className="w-full h-24 rounded-3xl text-2xl md:text-3xl font-black blue-gradient shadow-2xl text-white border-none">FINALIZE REGISTRATION</Button>
          </motion.form>
        )}

        {step === 'success' && (
          <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center space-y-12 py-20">
            <div className="w-48 h-48 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-inner">
              <CheckCircle2 className="w-32 h-32" />
            </div>
            <div className="space-y-4">
              <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight">Registration Successful</h2>
              <p className="text-2xl md:text-3xl text-slate-500 font-medium">You may now borrow apparatus.</p>
            </div>
            <p className="text-xl text-slate-400">Returning to Home Screen in 5 seconds...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <KioskKeyboard 
        visible={activeField !== null} 
        onInput={(val) => activeField && handleInputChange(activeField, val)} 
        onClose={() => setActiveField(null)} 
        initialValue={activeField ? (formData as any)[activeField] : ""} 
        layoutType={getKeyboardLayout()}
      />
      <QrScannerModal isOpen={isScannerOpen} onScan={handleScan} onClose={() => setIsScannerOpen(false)} title="Register your QR Code" />
    </div>
  );
}
