
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import { motion, AnimatePresence } from 'framer-motion';

interface KioskKeyboardProps {
  visible: boolean;
  onInput: (input: string) => void;
  onEnter?: () => void;
  onClose: () => void;
  initialValue?: string;
  layoutType?: 'default' | 'numeric' | 'email';
}

export function KioskKeyboard({ 
  visible, 
  onInput, 
  onEnter, 
  onClose,
  initialValue = "",
  layoutType = 'default'
}: KioskKeyboardProps) {
  const [layoutName, setLayoutName] = useState("default");
  const keyboard = useRef<any>(null);

  useEffect(() => {
    if (visible && keyboard.current) {
      keyboard.current.setInput(initialValue);
    }
  }, [visible, initialValue]);

  useEffect(() => {
    if (layoutType === 'numeric') {
      setLayoutName('numbers');
    } else {
      setLayoutName('default');
    }
  }, [layoutType]);

  const onKeyPress = (button: string) => {
    if (button === "{shift}" || button === "{lock}") {
      setLayoutName(layoutName === "default" ? "shift" : "default");
    } else if (button === "{numbers}") {
      setLayoutName("numbers");
    } else if (button === "{abc}") {
      setLayoutName("default");
    } else if (button === "{enter}") {
      if (onEnter) onEnter();
      onClose();
    }
  };

  const onChange = (input: string) => {
    onInput(input);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/10 z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[101]"
          >
            <div className="bg-slate-200 p-2 shadow-2xl border-t border-slate-300">
               <Keyboard
                keyboardRef={(r) => (keyboard.current = r)}
                layoutName={layoutName}
                onChange={onChange}
                onKeyPress={onKeyPress}
                theme={"hg-theme-default hg-layout-default"}
                layout={{
                  default: [
                    "q w e r t y u i o p",
                    "a s d f g h j k l",
                    "{shift} z x c v b n m {backspace}",
                    "{numbers} {space} {enter}"
                  ],
                  shift: [
                    "Q W E R T Y U I O P",
                    "A S D F G H J K L",
                    "{shift} Z X C V B N M {backspace}",
                    "{numbers} {space} {enter}"
                  ],
                  numbers: layoutType === 'numeric' ? [
                    "1 2 3",
                    "4 5 6",
                    "7 8 9",
                    "{backspace} 0 {enter}"
                  ] : [
                    "1 2 3 4 5 6 7 8 9 0",
                    "- / : ; ( ) $ & @ \"",
                    "{abc} . , ? ! ' {backspace}",
                    "{space} {enter}"
                  ]
                }}
                display={{
                  "{shift}": "⇧",
                  "{backspace}": "⌫",
                  "{enter}": "ENTER",
                  "{numbers}": "123",
                  "{abc}": "ABC",
                  "{space}": "SPACE"
                }}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
