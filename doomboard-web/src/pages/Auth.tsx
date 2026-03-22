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
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-dark text-white p-6 relative overflow-hidden">
            {/* Background Gradients to match landing */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-20 pointer-events-none" style={{ background: "hsl(38, 90%, 55%)" }} />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-10 pointer-events-none" style={{ background: "hsl(160, 50%, 45%)" }} />

            <div className="w-full max-w-sm space-y-8 p-10 glass-card rounded-3xl relative z-10 glow-border">
                <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary btn-glow shadow-[0_0_20px_hsla(38,90%,55%,0.3)]">
                        <Lock className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h1 className="font-display text-2xl font-black tracking-tighter uppercase text-gradient-hero">
                        {step === "email" ? "Get Started" : "Verify Code"}
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium">
                        {step === "email" 
                            ? "Enter your email to receive a secure access code" 
                            : `We sent a 6-digit code to ${email}`}
                    </p>
                </div>

                <form onSubmit={step === "email" ? handleSendOtp : handleVerifyOtp} className="space-y-4">
                    <div className="space-y-4">
                        {step === "email" ? (
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="email"
                                    placeholder="Email address"
                                    className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 transition-colors rounded-xl"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        ) : (
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="6-digit code"
                                    maxLength={6}
                                    className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 text-center tracking-[0.5em] font-mono text-lg rounded-xl"
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
                        <div className="p-3 rounded-xl text-xs font-bold text-center border bg-red-500/10 border-red-500/20 text-red-400 animate-pulse">
                            {error}
                        </div>
                    )}

                    <Button className="w-full h-12 font-bold rounded-xl btn-glow bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-[0.98]" type="submit" disabled={loading}>
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
                    <div className="text-center">
                        <button 
                            onClick={() => setStep("email")}
                            className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium underline underline-offset-4"
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
