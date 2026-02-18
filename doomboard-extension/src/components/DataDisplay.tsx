import React from 'react';
import { Briefcase } from 'lucide-react';

interface InfoCardProps {
    title: string;
    company: string;
    source?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, company, source }) => {
    return (
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex gap-4 items-center">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5 shrink-0">
                <Briefcase className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="min-w-0">
                <h2 className="text-zinc-100 font-bold text-sm leading-tight truncate" title={title}>{title}</h2>
                <p className="text-zinc-500 text-xs font-medium truncate mt-0.5">{company}</p>
                {source && <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest mt-1.5">{source}</p>}
            </div>
        </div>
    );
};

export const Divider: React.FC = () => {
    return <hr className="border-t border-white/5 my-2" />;
};
