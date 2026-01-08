"use client";
import * as React from "react";
import { cn } from "@/client/utils";

/**
 * PasscodeInput Component - 6-digit passcode input
 * Matching mobile app design
 */

interface PasscodeInputProps {
    value: string;
    onChange: (value: string) => void;
    error?: boolean;
    disabled?: boolean;
    length?: number;
}

export const PasscodeInput: React.FC<PasscodeInputProps> = ({
    value,
    onChange,
    error = false,
    disabled = false,
    length = 6,
}) => {
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

    // Split value into array of digits
    const digits = value.split('').concat(Array(length - value.length).fill(''));

    const handleChange = (index: number, digit: string) => {
        if (disabled) return;

        // Only allow digits
        if (digit && !/^\d$/.test(digit)) return;

        const newDigits = [...digits];
        newDigits[index] = digit;
        const newValue = newDigits.join('').slice(0, length);
        onChange(newValue);

        // Auto-focus next input
        if (digit && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (disabled) return;

        if (e.key === 'Backspace') {
            e.preventDefault();
            if (digits[index]) {
                // Clear current digit
                const newDigits = [...digits];
                newDigits[index] = '';
                onChange(newDigits.join(''));
            } else if (index > 0) {
                // Move to previous and clear
                const newDigits = [...digits];
                newDigits[index - 1] = '';
                onChange(newDigits.join(''));
                inputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        if (disabled) return;

        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        onChange(pastedData);

        // Focus the next empty input or last input
        const focusIndex = Math.min(pastedData.length, length - 1);
        inputRefs.current[focusIndex]?.focus();
    };

    const handleFocus = (index: number) => {
        // Select the input content on focus
        inputRefs.current[index]?.select();
    };

    return (
        <div className="flex gap-2 justify-center">
            {Array.from({ length }).map((_, index) => (
                <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={1}
                    value={digits[index]}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    onFocus={() => handleFocus(index)}
                    disabled={disabled}
                    className={cn(
                        "w-12 h-14 text-center text-xl font-semibold rounded-xl border-2",
                        "bg-white dark:bg-neutral-900",
                        "text-neutral-900 dark:text-white",
                        "transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                        error
                            ? "border-rose-500 focus:ring-rose-500/30"
                            : "border-neutral-200 dark:border-neutral-700",
                        disabled && "opacity-50 cursor-not-allowed",
                        // Filled state
                        digits[index] && !error && "border-primary-500 dark:border-primary-400"
                    )}
                    aria-label={`Digit ${index + 1}`}
                />
            ))}
        </div>
    );
};

PasscodeInput.displayName = "PasscodeInput";
