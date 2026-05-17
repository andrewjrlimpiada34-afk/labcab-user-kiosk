"use client";

import React, { useEffect, useRef, useState } from 'react';
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
    setLayoutName(layoutType === 'numeric' ? 'numbers' : 'default');
  }, [layoutType]);

  const onKeyPress = (button: string) => {
    if (button === "{shift}" || button === "{lock}") {
      setLayoutName((current) => current === "default" ? "shift" : "default");
      return;
    }

    if (button === "{numbers}") {
      setLayoutName("numbers");
      return;
    }

    if (button === "{abc}") {
      setLayoutName("default");
      return;
    }

    if (button === "{enter}" && onEnter) {
      onEnter();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/20"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 z-[101] px-2 pb-2 sm:px-3 sm:pb-3 md:px-4 md:pb-4"
          >
            <div className="mx-auto w-full max-w-[980px] overflow-hidden rounded-[1.75rem] border border-slate-300/80 bg-slate-200/95 p-2 shadow-[0_-16px_40px_rgba(15,23,42,0.24)] backdrop-blur-sm md:rounded-[2rem] md:p-3">
              <div className="mx-auto mb-2 h-1.5 w-20 rounded-full bg-slate-400/70 md:mb-3" />
              <Keyboard
                keyboardRef={(r) => (keyboard.current = r)}
                layoutName={layoutName}
                onChange={onInput}
                onKeyPress={onKeyPress}
                theme={"hg-theme-default hg-layout-default kiosk-hg"}
                physicalKeyboardHighlight
                syncInstanceInputs
                preventMouseDownDefault
                disableCaretPositioning
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
                  "{shift}": "SHIFT",
                  "{backspace}": "BKSP",
                  "{enter}": "ENTER",
                  "{numbers}": "123",
                  "{abc}": "ABC",
                  "{space}": "SPACE"
                }}
                buttonTheme={[
                  {
                    class: "hg-key-wide",
                    buttons: "{shift} {backspace} {numbers} {abc} {enter}"
                  },
                  {
                    class: "hg-key-space",
                    buttons: "{space}"
                  }
                ]}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
