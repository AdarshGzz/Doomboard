import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const Navbar = () => (
  <motion.nav
    className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
  >
    <div className="container px-6 h-16 flex items-center justify-between mx-auto">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-xs font-black text-primary-foreground">D</span>
        </div>
        <span className="font-bold text-foreground tracking-tight">Doomboard</span>
      </div>

      <Link to="/auth">
        <button className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-lg transition-all duration-200 active:scale-[0.97] flex items-center gap-1.5">
          Get Started
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </Link>
    </div>
  </motion.nav>
);
