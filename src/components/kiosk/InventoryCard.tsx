
"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Beaker, FlaskConical, Pipette, Flame, Microscope, Box, Scissors, Thermometer } from 'lucide-react';
import { InventoryItem } from '@/lib/types';

interface InventoryCardProps {
  item: InventoryItem;
  quantity: number;
  onUpdate: (id: string, delta: number) => void;
}

const ICON_MAP: Record<string, any> = {
  Beaker, FlaskConical, Pipette, Flame, Microscope, Box, Scissors, Thermometer
};

function isProbablyUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

export function InventoryCard({ item, quantity, onUpdate }: InventoryCardProps) {
  const canShowImage = Boolean(item.icon && isProbablyUrl(item.icon));
  const IconComponent = ICON_MAP[item.icon] || Box;

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 border-2 ${quantity > 0 ? 'border-secondary bg-secondary/5 ring-4 ring-secondary/10' : 'border-slate-100'}`}>
      <div className="p-6 flex flex-col items-center space-y-4">
        <div
          className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-colors overflow-hidden ${quantity > 0 ? 'bg-secondary text-white' : 'bg-slate-50 text-slate-400'}`}
        >
          {canShowImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.icon}
              alt={item.name}
              className="w-20 h-20 object-cover"
              loading="lazy"
            />
          ) : (
            <IconComponent className="w-12 h-12" />
          )}
        </div>

        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{item.name}</h3>
          <p className="text-sm text-slate-500">{item.stock} units available</p>
        </div>

        <div className="flex items-center gap-6 mt-2">
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full border-2"
            disabled={quantity <= 0}
            onClick={() => onUpdate(item.id, -1)}
          >
            <Minus className="w-6 h-6" />
          </Button>

          <span className="text-3xl font-black w-8 text-center">{quantity}</span>

          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full border-2 bg-white hover:bg-slate-50"
            disabled={quantity >= item.stock}
            onClick={() => onUpdate(item.id, 1)}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {item.stock < 10 && (
        <div className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          LOW STOCK
        </div>
      )}
    </Card>
  );
}

