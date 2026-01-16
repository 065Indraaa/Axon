import clsx from 'clsx';
import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    glass?: boolean;
    onClick?: () => void;
}

export function Card({ children, className, glass, onClick }: CardProps) {
    return (
        <div
            onClick={onClick}
            className={clsx(
                // Base Swiss Style: White, Thin Border, Minimal Shadow
                "bg-white border border-gray-200 rounded-swiss",
                // Interactive state if onClick is present
                onClick && "active:scale-[0.98] transition-transform",
                // Optional Glass override (keep subtle if used)
                glass && "bg-white/80 backdrop-blur-md border-white/40",
                className
            )}
        >
            {children}
        </div>
    );
}
