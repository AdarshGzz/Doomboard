export function CollectedPage() {
    return (
        <div className="space-y-6">
            <h1 className="font-display text-3xl font-bold">Collected Jobs</h1>
            <p className="text-muted-foreground">Jobs saved but not yet applied.</p>
        </div>
    );
}

export function DashboardPage() {
    return (
        <div className="space-y-6">
            <h1 className="font-display text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Kanban board for applied jobs.</p>
        </div>
    );
}

export function TrashPage() {
    return (
        <div className="space-y-6">
            <h1 className="font-display text-3xl font-bold">Trash</h1>
            <p className="text-muted-foreground">Deleted jobs.</p>
        </div>
    );
}

export function SettingsPage() {
    return (
        <div className="space-y-6">
            <h1 className="font-display text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage resumes and passcode.</p>
        </div>
    );
}
