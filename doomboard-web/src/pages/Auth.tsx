import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Lock, Mail, Key, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/services/supabase";

export function AuthPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState<"email" | "otp">("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const SCRAPER_URL = "http://localhost:3001"; // Port used by scraper-service

    useEffect(() => {
        // Redirct if already logged in
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                navigate("/collected");
            }
        });
    }, [navigate]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${SCRAPER_URL}/api/auth/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to send OTP");

            setStep("otp");
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${SCRAPER_URL}/api/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Invalid code");

            // Redirect to the Magic Link session URL returned by backend
            // This will handle the Supabase session and redirect back automatically
            if (data.session_url) {
                window.location.href = data.session_url;
            } else {
                throw new Error("Session creation failed");
            }
        } catch (err: any) {
            setError(err.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white p-6">
            <div className="w-full max-w-sm space-y-8 p-10 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-xl shadow-2xl relative">
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />

                <div className="flex flex-col items-center space-y-4 text-center relative z-10">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
                        <Lock className="h-6 w-6 text-zinc-950" />
                    </div>
                    <h1 className="font-display text-2xl font-black tracking-tighter uppercase">
                        {step === "email" ? "Get Started" : "Verify Code"}
                    </h1>
                    <p className="text-sm text-zinc-500 font-medium">
                        {step === "email" 
                            ? "Enter your email to receive a secure access code" 
                            : `We sent a 6-digit code to ${email}`}
                    </p>
                </div>

                <form onSubmit={step === "email" ? handleSendOtp : handleVerifyOtp} className="space-y-4 relative z-10">
                    <div className="space-y-4">
                        {step === "email" ? (
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <Input
                                    type="email"
                                    placeholder="Email address"
                                    className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 transition-colors"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        ) : (
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <Input
                                    type="text"
                                    placeholder="6-digit code"
                                    maxLength={6}
                                    className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 text-center tracking-[0.5em] font-mono text-lg"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    required
                                    disabled={loading}
                                    autoFocus
                                />
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="p-3 rounded-xl text-xs font-bold text-center border bg-red-500/10 border-red-500/20 text-red-400">
                            {error}
                        </div>
                    )}

                    <Button className="w-full h-12 font-bold rounded-xl" type="submit" disabled={loading}>
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                {step === "email" ? "Send Code" : "Verify & Enter"}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </>
                        )}
                    </Button>
                </form>

                {step === "otp" && (
                    <div className="text-center relative z-10">
                        <button 
                            onClick={() => setStep("email")}
                            className="text-xs text-zinc-500 hover:text-white transition-colors"
                            disabled={loading}
                        >
                            Change Email
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
