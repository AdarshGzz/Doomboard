import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardMockup } from "./DashboardMockup";

const GridBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute inset-0 grid-bg opacity-60" />
    <motion.div
      className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full"
      style={{ background: "radial-gradient(circle, hsla(38, 90%, 55%, 0.07) 0%, transparent 70%)" }}
      animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full"
      style={{ background: "radial-gradient(circle, hsla(160, 50%, 45%, 0.05) 0%, transparent 70%)" }}
      animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-dark">
      <GridBackground />
      <div className="container relative z-10 px-6 pt-32 pb-20 mx-auto">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 inline-flex"
          >
            <span className="glass rounded-full px-5 py-2 text-sm font-medium text-muted-foreground tracking-wide">
              <span className="inline-block w-2 h-2 rounded-full bg-accent mr-2 animate-pulse" />
              AI-Powered Career Intelligence
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.95] mb-6"
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-gradient-hero">Level up your</span>
            <br />
            <span className="text-gradient-primary">Job Hunt Game</span>
          </motion.h1>

          <motion.p
            className="max-w-xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            AI-powered platform to track, scrape, and manage job applications intelligently.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to="/auth">
              <button className="group relative bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 rounded-xl text-base transition-all duration-300 btn-glow animate-pulse-glow active:scale-[0.97] flex items-center gap-2">
                Start Tracking for Free
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Link>
            <button className="group glass text-foreground font-medium px-8 py-4 rounded-xl text-base transition-all duration-300 hover:bg-secondary active:scale-[0.97] flex items-center gap-2">
              <Play className="w-4 h-4" />
              Watch Demo
            </button>
          </motion.div>

          <motion.div
            className="mt-20 relative"
            initial={{ opacity: 0, y: 60, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute -inset-4 rounded-3xl" style={{ background: "linear-gradient(180deg, hsla(38, 90%, 55%, 0.06) 0%, transparent 60%)" }} />
            <DashboardMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
