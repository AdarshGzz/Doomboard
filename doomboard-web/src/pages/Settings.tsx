export function SettingsPage() {
    return (
        <div className="space-y-12 max-w-4xl mx-auto">
            <div className="space-y-6">
                <div>
                    <h1 className="font-display text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">Manage your account and preferences.</p>
                </div>

                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 text-center">
                    <p className="text-zinc-500 font-medium">Account settings and personalization options will appear here.</p>
                </div>
            </div>

            {/* Passcode Section */}
            <div className="space-y-4 opacity-50 pointer-events-none">
                <div className="border-b border-border pb-4">
                    <h2 className="text-xl font-semibold">Security</h2>
                </div>
                <p className="text-sm text-muted-foreground">Passcode management requires server-side implementation. Disabled for initial setup.</p>
            </div>
        </div>
    );
}
