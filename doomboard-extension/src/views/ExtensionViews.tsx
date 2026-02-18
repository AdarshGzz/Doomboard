import React from 'react';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { InfoCard } from '../components/DataDisplay';
import { StatusMessage } from '../components/StatusMessage';
import { Activity, Rocket, AlertCircle, XCircle, MousePointer2 } from 'lucide-react';

// --- Unified Collector View ---
export const CollectorView: React.FC<{ onPush: () => void; isSaving: boolean }> = ({ onPush, isSaving }) => (
    <Layout>
        <Header />
        <div className="flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-zinc-900/40 rounded-3xl border border-white/5 border-dashed group transition-all hover:bg-zinc-900/60 hover:border-white/10">
                <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                    {isSaving ? (
                        <Activity className="h-8 w-8 text-primary animate-pulse" />
                    ) : (
                        <MousePointer2 className="h-8 w-8 text-zinc-500 group-hover:text-primary transition-colors" />
                    )}
                </div>
                <div className="text-center">
                    <h3 className="text-zinc-100 font-bold text-sm">Ready to track</h3>
                    <p className="text-zinc-500 text-xs font-medium mt-1">Found a potential job link</p>
                </div>
            </div>

            <PrimaryButton
                onClick={onPush}
                disabled={isSaving}
                className="h-14"
            >
                {isSaving ? (
                    <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-zinc-950 border-t-transparent"></div>
                        Pushing...
                    </div>
                ) : "Track Job Lead"}
            </PrimaryButton>
        </div>
    </Layout>
);

export const SavedView: React.FC<{ onOpenCollected: () => void }> = ({ onOpenCollected }) => (
    <Layout>
        <Header title="Job Saved" icon={<Rocket className="h-5 w-5 text-green-500" />} />
        <div className="flex-1 flex flex-col gap-4">
            <StatusMessage type="success">
                The link has been sent to your tracker. Scraping will finish in the background.
            </StatusMessage>
            <div className="mt-auto">
                <PrimaryButton onClick={onOpenCollected}>Open Dashboard</PrimaryButton>
            </div>
        </div>
    </Layout>
);

export const DuplicateView: React.FC<{ job: { title: string; company: string; status: string }; onOpenJob: () => void }> = ({ job, onOpenJob }) => (
    <Layout>
        <Header title="Duplicate" icon={<AlertCircle className="h-5 w-5 text-yellow-500" />} />
        <div className="flex-1 flex flex-col gap-4">
            <InfoCard title={job.title} company={job.company} />
            <StatusMessage type="warning">
                This job is already in your board with status: <span className="font-black uppercase tracking-widest text-yellow-500 ml-1">{job.status}</span>
            </StatusMessage>
            <div className="mt-auto">
                <SecondaryButton onClick={onOpenJob}>Open Dashboard</SecondaryButton>
            </div>
        </div>
    </Layout>
);

export const ErrorView: React.FC<{ message?: string; onRetry: () => void; onOpenWebApp: () => void }> = ({ message = "Something went wrong.", onRetry, onOpenWebApp }) => (
    <Layout>
        <Header title="Error" icon={<XCircle className="h-5 w-5 text-red-500" />} />
        <div className="flex-1 flex flex-col gap-4">
            <StatusMessage type="error">
                {message}
            </StatusMessage>
            <div className="flex gap-3 mt-auto">
                <SecondaryButton className="flex-1" onClick={onRetry}>Retry</SecondaryButton>
                <SecondaryButton className="flex-1" onClick={onOpenWebApp}>Support</SecondaryButton>
            </div>
        </div>
    </Layout>
);
