import { motion } from "framer-motion";
import { Chrome, LayoutDashboard, Bot, Smartphone, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Chrome,
    title: "Browser Extension",
    desc: "Capture jobs from any listing with a single click. Works across all major job boards.",
    color: "hsl(38, 90%, 55%)",
  },
  {
    icon: LayoutDashboard,
    title: "Intelligent Dashboard",
    desc: "Kanban-style board to visualize every stage of your pipeline at a glance.",
    color: "hsl(200, 60%, 50%)",
  },
  {
    icon: Bot,
    title: "AI Extraction",
    desc: "Automatically parse job descriptions into structured, actionable data fields.",
    color: "hsl(160, 50%, 45%)",
  },
  {
    icon: Smartphone,
    title: "Mobile App",
    desc: "Collect and save jobs on the go — works the same way as the browser extension.",
    color: "hsl(280, 40%, 55%)",
  },
  {
    icon: Shield,
    title: "Privacy First",
    desc: "Your data stays yours. End-to-end encryption with zero third-party access.",
    color: "hsl(45, 70%, 50%)",
  },
  {
    icon: Zap,
    title: "Real-time Sync",
    desc: "Instant sync across all your devices. Never miss an update.",
    color: "hsl(10, 65%, 52%)",
  },
];

export const FeaturesSection = () => (
  <section className="relative py-32 bg-gradient-dark" id="features">
    <div className="container px-6 mx-auto">
      <motion.div
        className="text-center mb-20"
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
          Everything you need to <span className="text-gradient-primary">dominate</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          A complete toolkit designed around how modern job seekers actually work.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            className="glass-card rounded-2xl p-7 group transition-all duration-300 hover:translate-y-[-4px]"
            style={{ borderTop: `2px solid ${f.color}30` }}
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ boxShadow: `0 0 30px ${f.color}15` }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-110"
              style={{ background: `${f.color}15` }}
            >
              <f.icon className="w-5 h-5" style={{ color: f.color }} />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
