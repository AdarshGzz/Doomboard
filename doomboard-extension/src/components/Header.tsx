import React from 'react';
import { AppWindow } from 'lucide-react';

interface HeaderProps {
    title?: string;
    icon?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title = "Job Tracker", icon }) => {
    return (
        <header className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-white/10">
                {icon || <AppWindow className="h-5 w-5 text-primary" />}
            </div>
            <div>
                <h1 className="text-base font-black text-white uppercase tracking-wider leading-tight">{title}</h1>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Doomboard Assistant</p>
            </div>
        </header>
    );
};
