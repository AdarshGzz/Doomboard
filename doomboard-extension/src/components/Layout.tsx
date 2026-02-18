import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
    className?: string; // Allow custom classes like background color overrides
}

export const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
    return (
        <div className={`flex flex-col h-full min-h-[200px] bg-zinc-950 text-white p-4 gap-4 ${className}`}>
            {children}
        </div>
    );
};
