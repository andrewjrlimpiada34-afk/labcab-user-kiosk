
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Delete, DeleteIcon, DeleteRightIcon } from 'lucide-react';

interface VirtualKeyboardProps {
  onInput: (char: string) => void;
  onDelete: () => void;
  onClear: () => void;
}

export function VirtualKeyboard({ onInput, onDelete, onClear }: VirtualKeyboardProps) {
  const keys = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ];

  return (
    <div className="bg-slate-100 p-4 rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="max-w-4xl mx-auto space-y-2">
        {keys.map((row, i) => (
          <div key={i} className="flex justify-center gap-2">
            {row.map((key) => (
              <Button
                key={key}
                variant="outline"
                className="w-14 h-16 sm:w-16 sm:h-20 text-xl font-bold rounded-xl border-2 bg-white active:bg-slate-200 transition-colors"
                onClick={() => onInput(key)}
              >
                {key}
              </Button>
            ))}
          </div>
        ))}
        <div className="flex justify-center gap-2">
          <Button
            variant="destructive"
            className="h-16 px-8 text-lg font-bold rounded-xl"
            onClick={onClear}
          >
            CLEAR
          </Button>
          <Button
            variant="outline"
            className="w-32 h-16 text-lg font-bold rounded-xl border-2 bg-white"
            onClick={() => onInput(' ')}
          >
            SPACE
          </Button>
          <Button
            variant="secondary"
            className="h-16 px-8 text-lg font-bold rounded-xl flex items-center gap-2"
            onClick={onDelete}
          >
            <DeleteIcon className="w-6 h-6" />
            BACK
          </Button>
        </div>
      </div>
    </div>
  );
}
