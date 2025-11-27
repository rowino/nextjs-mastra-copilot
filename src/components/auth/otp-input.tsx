"use client";

import { useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  length?: number;
}

export function OTPInput({
  value,
  onChange,
  disabled = false,
  length = 6,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const focusInput = (index: number) => {
    if (index >= 0 && index < length) {
      inputRefs.current[index]?.focus();
    }
  };

  const handleChange = (index: number, inputValue: string) => {
    if (!/^\d*$/.test(inputValue)) return;

    const digit = inputValue.slice(-1);
    const newValue = value.split("");
    newValue[index] = digit;
    const result = newValue.join("").slice(0, length);
    onChange(result);

    if (digit && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newValue = value.split("");

      if (newValue[index]) {
        newValue[index] = "";
        onChange(newValue.join(""));
      } else if (index > 0) {
        newValue[index - 1] = "";
        onChange(newValue.join(""));
        focusInput(index - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      focusInput(Math.min(pastedData.length, length - 1));
    }
  };

  const handleFocus = (index: number) => {
    inputRefs.current[index]?.select();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={cn(
            "w-12 h-12 text-center text-xl rounded-md",
            "bg-white/5 border border-white/10 text-white",
            "focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all"
          )}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
