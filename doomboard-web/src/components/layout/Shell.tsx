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
        <div className="flex min-h-screen w-full bg-background text-white selection:bg-primary/30 relative overflow-hidden">
            {/* Ambient Background Gradients */}
            <div className="fixed top-0 left-0 w-full h-full bg-gradient-dark -z-10" />
            <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none -z-10" />

            {/* Sidebar */}
            <aside className="hidden w-64 flex-col border-r border-white/5 glass backdrop-blur-2xl md:flex relative z-10">
                <div className="flex h-16 items-center px-6">
                    <Link to="/" className="flex items-center gap-2 font-display text-xl font-black tracking-tighter">
                        <div className="h-8 w-8 rounded-lg bg-primary btn-glow-sm flex items-center justify-center shadow-[0_0_15px_hsla(38,90%,55%,0.3)]">
                            <Terminal className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="text-gradient-hero">DOOMBOARD</span>
                    </Link>
                </div>
                <nav className="flex-1 space-y-2 p-4 pt-6">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 relative group",
                                    isActive
                                        ? "text-primary shadow-[0_0_20px_hsla(38,90%,55%,0.1)]"
                                        : "text-muted-foreground hover:bg-white/5 hover:text-white"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20 pointer-events-none" />
                                )}
                                <item.icon className={cn("h-4.5 w-4.5 transition-colors", isActive ? "text-primary " : "text-inherit")} />
                                {item.label}
                                {isActive && (
                                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_hsla(38,90%,55%,0.5)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group"
                    >
                        <LogOut className="h-4.5 w-4.5 group-hover:-translate-x-1 transition-transform" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen relative z-[20]">
                <div className="flex-1 p-8 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
