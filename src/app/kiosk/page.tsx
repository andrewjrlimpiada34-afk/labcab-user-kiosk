
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MOCK_INVENTORY, MOCK_USER } from '@/lib/mock-data';
import { InventoryCard } from '@/components/kiosk/InventoryCard';
import { ShoppingBag, CheckCircle2, Clock, LogOut, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function KioskPage() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minute auto-logout
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  const updateCart = (id: string, delta: number) => {
    setCart(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  const handleCheckout = () => {
    if (totalItems === 0) return;
    
    toast({
      title: "Transaction Confirmed",
      description: `Cabinet doors are unlocked. Return items by 5:00 PM.`,
    });
    router.push('/');
  };

  const filteredInventory = MOCK_INVENTORY.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Kiosk Header */}
      <header className="bg-white border-b p-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-2xl">L</div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{MOCK_USER.name}</h1>
            <Badge variant="outline" className="text-xs uppercase tracking-wider">{MOCK_USER.role}</Badge>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
             <div className="flex items-center gap-2 text-orange-600 font-bold">
               <Clock className="w-4 h-4" />
               <span>Session: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
             </div>
             <p className="text-xs text-slate-400">Auto-logout for security</p>
          </div>
          <Button variant="ghost" size="lg" className="rounded-xl h-14" onClick={() => router.push('/')}>
            <LogOut className="mr-2 h-5 w-5" />
            EXIT
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-6 space-y-6 max-w-screen-2xl mx-auto w-full">
        {/* Search & Categories */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
            <input 
              type="text" 
              placeholder="Search equipment..." 
              className="w-full h-16 pl-14 pr-6 rounded-2xl border-2 border-slate-200 text-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {['All', 'Glassware', 'Heating', 'Tools'].map(cat => (
              <Button key={cat} variant={cat === 'All' ? 'default' : 'outline'} className="h-16 px-8 rounded-2xl text-lg font-bold">
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredInventory.map(item => (
            <InventoryCard 
              key={item.id} 
              item={item} 
              quantity={cart[item.id] || 0} 
              onUpdate={updateCart} 
            />
          ))}
        </div>
      </main>

      {/* Floating Checkout Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-6 animate-in slide-in-from-bottom duration-500">
          <div className="max-w-4xl mx-auto bg-primary text-white p-4 rounded-3xl shadow-2xl flex items-center justify-between gap-6">
            <div className="flex items-center gap-4 pl-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <span className="text-2xl font-black">{totalItems} Items Selected</span>
                <p className="text-white/60 text-sm">Estimated return: End of day (5 PM)</p>
              </div>
            </div>
            <Button 
              variant="secondary" 
              className="h-16 px-12 text-2xl font-black rounded-2xl shadow-xl flex items-center gap-2"
              onClick={handleCheckout}
            >
              CONFIRM BORROW
              <CheckCircle2 className="w-8 h-8" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
