import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'info';
    isLoading?: boolean;
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = 'info',
    isLoading = false
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />
            
            {/* Modal Container */}
            <div className={cn(
                "relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/90 p-8 shadow-2xl backdrop-blur-xl",
                "animate-in zoom-in-95 fade-in duration-300 slide-in-from-bottom-4"
            )}>
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-2 text-zinc-500 hover:bg-white/5 hover:text-white transition-all"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className={cn(
                        "mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border bg-opacity-10",
                        type === 'danger' 
                            ? "border-destructive/20 bg-destructive text-destructive" 
                            : "border-primary/20 bg-primary text-primary"
                    )}>
                        {type === 'danger' ? (
                            <AlertCircle className="h-8 w-8" />
                        ) : (
                            <CheckCircle2 className="h-8 w-8" />
                        )}
                    </div>

                    {/* Content */}
                    <h3 className="mb-2 text-2xl font-black tracking-tight text-white">{title}</h3>
                    <p className="mb-8 text-sm font-medium text-zinc-500 leading-relaxed">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex w-full gap-3">
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            className="flex-1 rounded-2xl h-12 font-bold"
                            disabled={isLoading}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            variant={type === 'danger' ? 'destructive' : 'default'}
                            onClick={onConfirm}
                            className="flex-1 rounded-2xl h-12 font-bold shadow-lg"
                            isLoading={isLoading}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
