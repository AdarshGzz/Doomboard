import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Lock } from "lucide-react";
import { supabase } from "@/services/supabase";

export function AuthPage() {
    const [passcode, setPasscode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Verify passcode against Supabase
            // Since we are "Mocking" the unlock flow (or using simple check against app_config)
            // The spec says: "Enter 6-digit passcode -> Supabase RPC / Edge Function -> Session token"
            // For now, we'll consult the app_config table directly if configured, or just hash locally if simple.
            // BUT RLS policies block read unless unlocked? No, we set "Allow all" for now.

            // Let's implement a simple check:
            // 1. Fetch `app_config` (row with id 1)
            // 2. Compare hash (Client side check is weak but acceptable for "Private Single User" V1 if RLS allows read)
            // Better: Use an Edge Function `unlock_workspace` which returns a JWT.
            // For this setup, we'll assume there is ONE passcode configured. 

            // TEMP: Hardcoded check to unblock UI dev if Supabase table is empty or not set up with passcode yet.
            // Real impl: 
            const { data, error: dbError } = await supabase
                .from('app_config')
                .select('passcode_hash')
                .single();

            if (dbError) {
                console.warn("DB Error or no config", dbError);
                // Fallback for demo if no config exists: Allow defaults or show setup needed
                if (passcode === "123456") { // Default dev passcode
                    // Success
                } else {
                    throw new Error("Invalid passcode");
                }
            } else if (data) {
                // Compare hash (simple string compare for now since we just store it)
                // In real app, use bcrypt verify on Edge Function.
                if (data.passcode_hash !== passcode) { // TODO: Hash comparison
                    throw new Error("Invalid passcode");
                }
            }

            // On success
            localStorage.setItem("doomboard_session", "true");
            navigate("/collected");

        } catch (err: any) {
            setError("Invalid passcode. Please try again.");
            // Shake animation logic would go here
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
            <div className="w-full max-w-sm space-y-8 p-8">
                <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Lock className="h-6 w-6" />
                    </div>
                    <h1 className="font-display text-2xl font-bold tracking-tight">
                        DOOMBOARD
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        This workspace is private.<br />Enter 6-digit passcode to unlock.
                    </p>
                </div>

                <form onSubmit={handleUnlock} className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            type="password"
                            placeholder="• • • • • •"
                            className="text-center text-lg tracking-[0.5em]"
                            maxLength={6}
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value)}
                            autoFocus
                        />
                    </div>
                    {error && <p className="text-center text-sm text-destructive font-medium">{error}</p>}
                    <Button className="w-full" type="submit" disabled={loading || passcode.length !== 6}>
                        {loading ? "Unlocking..." : "Unlock Workspace →"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
