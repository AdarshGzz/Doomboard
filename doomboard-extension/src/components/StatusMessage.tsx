import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export type StatusType = 'success' | 'warning' | 'error' | 'info';

interface StatusMessageProps {
    type: StatusType;
    children: React.ReactNode;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ type, children }) => {
    const icons = {
        success: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
        error: <AlertCircle className="h-4 w-4 text-red-500" />,
        info: <Info className="h-4 w-4 text-zinc-400" />,
    };

    const bgStyles = {
        success: 'bg-green-500/5 border-green-500/10',
        warning: 'bg-yellow-500/5 border-yellow-500/10',
        error: 'bg-red-500/5 border-red-500/10',
        info: 'bg-zinc-500/5 border-zinc-500/10',
    };

    return (
        <div className={`p-3 rounded-xl border ${bgStyles[type]} flex gap-3 items-start`}>
            <div className="mt-0.5">{icons[type]}</div>
            <div className={`text-xs font-medium leading-relaxed ${type === 'info' ? 'text-zinc-400' : 'text-zinc-200'}`}>
                {children}
            </div>
        </div>
    );
};
