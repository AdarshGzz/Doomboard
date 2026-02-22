import { useState } from 'react';
import {
  CollectorView,
  SavedView,
  DuplicateView,
  ErrorView
} from './views/ExtensionViews';
import { collectJob, type JobResponse } from './services/jobService';

// Define possible states
type ExtensionState =
  | 'idle'
  | 'saving'
  | 'saved'
  | 'duplicate'
  | 'error';

function App() {
  const [viewState, setViewState] = useState<ExtensionState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const [duplicateData, setDuplicateData] = useState<{ title: string; company: string; status: string } | null>(null);

  // --- Handlers ---

  const handlePushLink = async () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url) {
        setErrorMsg("Could not detect page URL");
        setViewState('error');
        return;
      }

      setViewState('saving');
      try {
        const result: JobResponse = await collectJob({
          url: tab.url,
          title: tab.title || "Manual Push",
          company: "Direct Collection",
          source: "Extension"
        });

        if (result.success) {
          setViewState('saved');
        } else if (result.duplicate && result.job) {
          setDuplicateData(result.job);
          setViewState('duplicate');
        } else {
          throw new Error(result.error || "Unknown error pushing link.");
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to push link.");
        setViewState('error');
      }
    }
  };

  const handleOpenWebApp = () => {
    window.open(import.meta.env.VITE_WEB_APP_URL || 'http://localhost:5173', '_blank');
  };

  const handleOpenCollected = () => {
    const baseUrl = import.meta.env.VITE_WEB_APP_URL || 'http://localhost:5173';
    window.open(`${baseUrl}/collected`, '_blank');
  };

  const handleRetry = () => {
    setViewState('idle');
    setErrorMsg(undefined);
  };

  // --- Render Logic ---

  switch (viewState) {
    case 'idle':
    case 'saving':
      return <CollectorView onPush={handlePushLink} isSaving={viewState === 'saving'} />;
    case 'saved':
      return <SavedView onOpenCollected={handleOpenCollected} />;
    case 'duplicate':
      return duplicateData ? <DuplicateView job={{ ...duplicateData }} onOpenJob={handleOpenWebApp} /> : null;
    case 'error':
      return <ErrorView message={errorMsg} onRetry={handleRetry} onOpenWebApp={handleOpenWebApp} />;
    default:
      return <div className="p-4 bg-red-900 text-white">Unknown State: {viewState}</div>;
  }
}

export default App;
