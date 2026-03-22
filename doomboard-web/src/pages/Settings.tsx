export function SettingsPage() {
    return (
        <div className="space-y-12 max-w-4xl mx-auto pt-4">
            <div className="space-y-6">
                <div>
                    <h1 className="font-display text-4xl font-black tracking-tight text-gradient-hero">Settings</h1>
                    <p className="text-muted-foreground font-medium">Manage your account and preferences.</p>
                </div>

                <div className="p-12 rounded-3xl glass border border-white/5 text-center shadow-2xl">
                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs opacity-50">
                        Account settings and personalization options will appear here.
                    </p>
                </div>
            </div>

            {/* Security Section */}
            <div className="space-y-4 opacity-30 pointer-events-none group">
                <div className="border-b border-white/5 pb-4 flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase tracking-widest text-foreground">Security</h2>
                    <div className="px-2 py-1 rounded-lg glass text-[9px] font-black text-primary border border-primary/20">LOCKED</div>
                </div>
                <p className="text-sm text-muted-foreground font-medium max-w-md">
                    Passcode management and advanced security features require server-side implementation.
                </p>
            </div>
        </div>
    );
}
