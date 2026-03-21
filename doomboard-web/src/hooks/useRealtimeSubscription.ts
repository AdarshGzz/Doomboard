import { useEffect, useRef } from 'react';
import { supabase } from '@/services/supabase';
import type { Job } from '@/types';

type EventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeOptions {
    table: string;
    filter?: string;
    onInsert?: (payload: Job) => void;
    onUpdate?: (payload: Job) => void;
    onDelete?: (payload: Job) => void;
}

export function useRealtimeSubscription({ table, filter, onInsert, onUpdate, onDelete }: UseRealtimeOptions) {
    // Use refs to hold the latest callbacks to avoid re-subscribing when they change
    const onInsertRef = useRef(onInsert);
    const onUpdateRef = useRef(onUpdate);
    const onDeleteRef = useRef(onDelete);

    useEffect(() => {
        onInsertRef.current = onInsert;
        onUpdateRef.current = onUpdate;
        onDeleteRef.current = onDelete;
    }, [onInsert, onUpdate, onDelete]);

    useEffect(() => {
        const channel = supabase
            .channel(`public:${table}:${filter || 'all'}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table, filter },
                (payload) => {
                    if (onInsertRef.current) onInsertRef.current(payload.new as Job);
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table, filter },
                (payload) => {
                    if (onUpdateRef.current) onUpdateRef.current(payload.new as Job);
                }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table, filter },
                (payload) => {
                    if (onDeleteRef.current) onDeleteRef.current(payload.old as Job);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [table, filter]); // Only re-subscribe if table or filter changes
}
