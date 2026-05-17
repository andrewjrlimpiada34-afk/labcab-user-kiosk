"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DeleteIcon } from 'lucide-react';

interface VirtualKeyboardProps {
  onInput: (char: string) => void;
  onDelete: () => void;
  onClear: () => void;
}

export function VirtualKeyboard({ onInput, onDelete, onClear }: VirtualKeyboardProps) {
  const [shifted, setShifted] = useState(false);

  const alphaRows = shifted
    ? [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
      ]
    : [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
      ];

  const numberRow = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <div className="px-2 pb-2 sm:px-3 sm:pb-3 md:px-4 md:pb-4">
      <div className="mx-auto w-full max-w-[980px] overflow-hidden rounded-[1.75rem] border border-slate-300/80 bg-slate-200/95 p-2 shadow-[0_-16px_40px_rgba(15,23,42,0.24)] backdrop-blur-sm md:rounded-[2rem] md:p-3">
        <div className="mx-auto mb-2 h-1.5 w-20 rounded-full bg-slate-400/70 md:mb-3" />
        <div className="space-y-2.5">
          <div className="grid grid-cols-10 gap-1.5 md:gap-2">
            {numberRow.map((key) => (
              <Button
                key={key}
                variant="outline"
                className="h-11 min-w-0 rounded-2xl border border-slate-300 bg-white px-0 text-base font-bold shadow-sm active:translate-y-[1px] sm:h-12 md:h-14 md:text-lg"
                onClick={() => onInput(key)}
              >
                {key}
              </Button>
            ))}
          </div>

          {alphaRows.map((row, index) => (
            <div
              key={index}
              className="grid gap-1.5 md:gap-2"
              style={{ gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))` }}
            >
              {row.map((key) => (
                <Button
                  key={key}
                  variant="outline"
                  className="h-11 min-w-0 rounded-2xl border border-slate-300 bg-white px-0 text-base font-bold shadow-sm active:translate-y-[1px] sm:h-12 md:h-14 md:text-lg"
                  onClick={() => onInput(key)}
                >
                  {key}
                </Button>
              ))}
            </div>
          ))}

          <div className="grid grid-cols-[1.3fr_1fr_2.4fr_1.3fr] gap-1.5 md:gap-2">
            <Button
              variant="outline"
              className="h-11 rounded-2xl border border-slate-300 bg-white px-2 text-sm font-black shadow-sm active:translate-y-[1px] sm:h-12 md:h-14 md:text-base"
              onClick={() => setShifted((current) => !current)}
            >
              {shifted ? 'SHIFT ON' : 'SHIFT'}
            </Button>
            <Button
              variant="destructive"
              className="h-11 rounded-2xl px-2 text-sm font-black shadow-sm active:translate-y-[1px] sm:h-12 md:h-14 md:text-base"
              onClick={onClear}
            >
              CLEAR
            </Button>
            <Button
              variant="outline"
              className="h-11 rounded-2xl border border-slate-300 bg-white px-2 text-sm font-black shadow-sm active:translate-y-[1px] sm:h-12 md:h-14 md:text-base"
              onClick={() => onInput(' ')}
            >
              SPACE
            </Button>
            <Button
              variant="secondary"
              className="h-11 rounded-2xl px-2 text-sm font-black shadow-sm active:translate-y-[1px] sm:h-12 md:h-14 md:text-base"
              onClick={onDelete}
            >
              <DeleteIcon className="mr-1.5 h-4 w-4 md:h-5 md:w-5" />
              BKSP
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
