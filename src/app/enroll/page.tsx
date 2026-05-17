
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronLeft, Camera, UserCircle2, Mail, ShieldCheck, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EnrollPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
    toast({
      title: "Enrollment Success",
      description: "Generating your access QR code now.",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <header className="max-w-4xl mx-auto flex items-center justify-between mb-12">
        <Button variant="ghost" className="rounded-full h-12 w-12 bg-primary text-white shadow-lg hover:bg-primary/90" onClick={() => router.push('/')}>
          <ChevronLeft className="w-8 h-8" />
        </Button>
        <h1 className="text-2xl font-bold text-primary">LabCab Enrollment</h1>
        <div className="w-12 h-12" /> {/* Spacer */}
      </header>

      <main className="max-w-2xl mx-auto">
        {step === 1 ? (
          <Card className="shadow-2xl border-2">
            <CardHeader className="text-center space-y-2 pb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <UserCircle2 className="w-12 h-12 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold">New User Registration</CardTitle>
              <p className="text-slate-500">Secure your digital keys for laboratory access</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleComplete} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-base">First Name</Label>
                    <Input id="firstName" placeholder="John" className="h-14 text-lg rounded-xl" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-base">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" className="h-14 text-lg rounded-xl" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base">Institutional Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input id="email" type="email" placeholder="j.doe@university.edu" className="h-14 pl-12 text-lg rounded-xl" required />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-bold">Registration Role</Label>
                  <RadioGroup defaultValue="student" className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 border-2 p-4 rounded-xl hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="student" id="student" />
                      <Label htmlFor="student" className="flex-1 cursor-pointer font-bold">Student Borrower</Label>
                    </div>
                    <div className="flex items-center space-x-2 border-2 p-4 rounded-xl hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="teacher" id="teacher" />
                      <Label htmlFor="teacher" className="flex-1 cursor-pointer font-bold">Faculty Admin</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label className="text-base">Create Security PIN (6-digits)</Label>
                  <Input type="password" maxLength={6} placeholder="••••••" className="h-14 text-center text-3xl font-black rounded-xl tracking-[1em]" required />
                </div>

                <Button type="submit" className="w-full h-16 text-xl font-bold rounded-2xl shadow-xl mt-4">
                  PROCEED TO VERIFICATION
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-2xl border-2 animate-in zoom-in-95 duration-500">
            <CardHeader className="text-center space-y-4 pb-8">
               <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                 <ShieldCheck className="w-14 h-14 text-green-600" />
               </div>
               <CardTitle className="text-3xl font-bold">Identity Verified</CardTitle>
               <p className="text-slate-500">Your LabCab credentials have been successfully linked</p>
            </CardHeader>
            <CardContent className="space-y-8 flex flex-col items-center">
              <div className="p-4 bg-white border-4 border-slate-900 rounded-3xl shadow-xl">
                 <div className="w-64 h-64 bg-slate-100 flex items-center justify-center relative overflow-hidden group">
                   <QrCode className="w-48 h-48 text-slate-900" />
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="secondary" className="gap-2">
                        <Download className="w-4 h-4" />
                        Save to Phone
                      </Button>
                   </div>
                 </div>
              </div>
              <div className="text-center">
                <p className="font-bold text-xl">STUDENT_JD_8422</p>
                <p className="text-slate-400">Scan this code at any kiosk to unlock cabinets</p>
              </div>
              <Button onClick={() => router.push('/')} variant="default" className="w-full h-16 text-xl font-bold rounded-2xl">
                RETURN TO HOME
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="mt-12 text-center text-slate-400 text-sm">
        <p>LabCab enrollment uses end-to-end encrypted identity linking.</p>
      </footer>
    </div>
  );
}
