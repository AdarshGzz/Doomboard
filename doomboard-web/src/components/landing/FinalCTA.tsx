import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const FinalCTA = () => (
  <section className="relative py-32 bg-gradient-section overflow-hidden">
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
      style={{ background: "radial-gradient(circle, hsla(38, 90%, 55%, 0.06) 0%, transparent 70%)" }}
    />

    <div className="container px-6 relative z-10 mx-auto">
      <motion.div
        className="max-w-2xl mx-auto text-center"
        initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.05]">
          Stop losing track.
          <br />
          <span className="text-gradient-primary">Start getting offers.</span>
        </h2>
        <p className="text-lg text-muted-foreground mb-10">
          Join thousands of job seekers who've already leveled up their search.
        </p>
        <Link to="/auth">
          <button className="group relative bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-10 py-5 rounded-xl text-lg transition-all duration-300 btn-glow animate-pulse-glow active:scale-[0.97] inline-flex items-center gap-3 mx-auto">
            Get Started Free
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </Link>
      </motion.div>
    </div>
  </section>
);
