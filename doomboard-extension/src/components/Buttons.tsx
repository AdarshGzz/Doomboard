import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    fullWidth?: boolean;
}

export const PrimaryButton: React.FC<ButtonProps> = ({ children, fullWidth = true, className = '', ...props }) => {
    return (
        <button
            className={`
        bg-white text-zinc-950 font-black py-3 px-4 rounded-xl hover:bg-zinc-200 transition-all active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </button>
    );
};

export const SecondaryButton: React.FC<ButtonProps> = ({ children, fullWidth = true, className = '', ...props }) => {
    return (
        <button
            className={`
        bg-zinc-900 text-zinc-300 font-bold py-3 px-4 rounded-xl border border-white/5 hover:bg-zinc-800 hover:text-white hover:border-white/10 transition-all active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-xs
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </button>
    );
};
