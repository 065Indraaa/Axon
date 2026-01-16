import clsx from 'clsx';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    fullWidth?: boolean;
}

export function Button({
    children,
    variant = 'primary',
    fullWidth,
    className,
    ...props
}: ButtonProps) {
    return (
        <button
            className={clsx(
                // Base: Bold, Swiss Rounded, Transition
                "h-12 px-6 font-bold tracking-wide transition-all active:scale-95 rounded-swiss disabled:opacity-50 disabled:cursor-not-allowed",
                // Typography: Swiss style often uses Uppercase for actions
                "uppercase text-sm",

                // Variants
                variant === 'primary' && "bg-primary text-white hover:bg-primary-700 shadow-sm",
                variant === 'secondary' && "bg-axon-paper text-axon-obsidian hover:bg-gray-200",
                variant === 'outline' && "bg-transparent border border-gray-200 text-axon-obsidian hover:border-gray-900",
                variant === 'ghost' && "bg-transparent text-axon-obsidian hover:bg-gray-100",

                fullWidth && "w-full",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
