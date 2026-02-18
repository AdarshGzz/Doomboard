import { type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Briefcase, LayoutDashboard, Trash2, Settings, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShellProps {
    children: ReactNode;
}

export function Shell({ children }: ShellProps) {
    const location = useLocation();

    const navItems = [
        { href: "/collected", label: "Collected", icon: Briefcase },
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/trash", label: "Trash", icon: Trash2 },
        { href: "/settings", label: "Settings", icon: Settings },
    ];

    const handleLogout = () => {
        // Clear session and reload to force Auth check
        // In real app, call logout API
        localStorage.removeItem("doomboard_session");
        window.location.href = "/";
    };

    return (
        <div className="flex min-h-screen w-full bg-background text-foreground">
            {/* Sidebar */}
            <aside className="hidden w-64 flex-col border-r border-border bg-card md:flex">
                <div className="flex h-14 items-center border-b border-border px-6">
                    <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
                        <div className="h-6 w-6 rounded bg-primary"></div>
                        DOOMBOARD
                    </Link>
                </div>
                <nav className="flex-1 space-y-1 p-4">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="border-t border-border p-4">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                        <Lock className="h-4 w-4" />
                        Lock Workspace
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen">
                {/* Mobile Header (TODO) */}
                <div className="flex-1 p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
