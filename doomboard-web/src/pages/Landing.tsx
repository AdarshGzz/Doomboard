import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { 
  Terminal, 
  Chrome, 
  Smartphone, 
  Zap, 
  Shield, 
  LayoutDashboard,
  ArrowRight
} from "lucide-react";

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white selection:bg-primary/30">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Terminal className="w-5 h-5 text-zinc-950" />
          </div>
          <span className="font-display font-black tracking-tighter text-xl">DOOMBOARD</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/auth?mode=login">
            <Button variant="ghost" className="text-zinc-400 hover:text-white">Log in</Button>
          </Link>
          <Link to="/auth?mode=signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-20%] w-[70%] h-[70%] bg-primary/20 blur-[120px] rounded-full opacity-50" />
          <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] bg-purple-500/10 blur-[120px] rounded-full opacity-30" />
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-400">
            <Zap className="w-3 h-3 text-primary" />
            <span>AI-Powered Career Management</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-display font-black tracking-tight leading-[0.9] text-white">
            Level up your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-purple-500">
              Job Hunt Game.
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-zinc-400 leading-relaxed">
            Doomboard is the ultimate multi-platform ecosystem to track, scrape, and manage your applications. Powered by Gemini AI for intelligent data extraction.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="h-14 px-8 text-lg font-bold">
                Start Tracking for Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="h-14 px-8 text-lg border-white/10 bg-white/5 hover:bg-white/10">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 border-t border-white/5 bg-zinc-900/20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Chrome className="w-6 h-6" />}
            title="Browser Extension"
            description="Collect job listings instantly from LinkedIn, Indeed, and more with our Chrome extension."
          />
          <FeatureCard 
            icon={<LayoutDashboard className="w-6 h-6" />}
            title="Intelligent Dashboard"
            description="A sleek Kanban-style board to visualize your progress and never miss a deadline."
          />
          <FeatureCard 
            icon={<Terminal className="w-6 h-6" />}
            title="AI Extraction"
            description="No more manual entry. Our AI automatically parses job descriptions and requirements."
          />
          <FeatureCard 
            icon={<Smartphone className="w-6 h-6" />}
            title="Mobile Ready"
            description="Track your applications on the go with our cross-platform mobile application."
          />
          <FeatureCard 
            icon={<Shield className="w-6 h-6" />}
            title="Privacy First"
            description="Your data is yours. Secure authentication and isolated database environments."
          />
          <FeatureCard 
            icon={<Zap className="w-6 h-6" />}
            title="Real-time Sync"
            description="Instant synchronization across all your devices using Supabase Realtime."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 px-6 border-t border-white/5 text-center text-zinc-500 text-sm">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4" />
            <span className="font-display font-bold tracking-tighter text-white">DOOMBOARD</span>
          </div>
          <p>© 2026 Doomboard Engine. Built for the modern job seeker.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all group">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-zinc-500 leading-relaxed">{description}</p>
    </div>
  );
}
