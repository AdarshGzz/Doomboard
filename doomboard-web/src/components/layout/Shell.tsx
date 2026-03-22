import { type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Briefcase, LayoutDashboard, Trash2, Settings, LogOut, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/services/supabase";

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

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    return (
        <div className="flex min-h-screen w-full bg-zinc-950 text-white selection:bg-primary/30">
            {/* Sidebar */}
            <aside className="hidden w-64 flex-col border-r border-white/5 bg-zinc-900/50 backdrop-blur-xl md:flex">
                <div className="flex h-16 items-center px-6">
                    <Link to="/" className="flex items-center gap-2 font-display text-xl font-black tracking-tighter">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <Terminal className="w-5 h-5 text-zinc-950" />
                        </div>
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
                                    "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200",
                                    isActive
                                        ? "bg-primary text-zinc-950 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]"
                                        : "text-zinc-500 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <item.icon className={cn("h-4 w-4", isActive ? "text-zinc-950" : "text-inherit")} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen bg-zinc-950">
                <div className="flex-1 p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
