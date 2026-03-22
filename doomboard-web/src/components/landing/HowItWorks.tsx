import { motion } from "framer-motion";
import { MousePointerClick, Sparkles, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: MousePointerClick,
    number: "01",
    title: "Capture jobs",
    desc: "Use our extension to save listings instantly from any job board with one click.",
    color: "hsl(265, 90%, 60%)",
  },
  {
    icon: Sparkles,
    number: "02",
    title: "Let AI extract details",
    desc: "Our AI parses salary, requirements, deadlines and more — automatically.",
    color: "hsl(220, 90%, 60%)",
  },
  {
    icon: TrendingUp,
    number: "03",
    title: "Track and optimize",
    desc: "Monitor your pipeline, get insights, and improve your hit rate over time.",
    color: "hsl(185, 100%, 50%)",
  },
];

export const HowItWorks = () => (
  <section className="relative py-32 bg-gradient-section">
    <div className="container px-6 mx-auto">
      <motion.div
        className="text-center mb-20"
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
          How it <span className="text-gradient-primary">works</span>
        </h2>
        <p className="text-lg text-muted-foreground">Three steps. Zero friction.</p>
      </motion.div>

      <div className="max-w-4xl mx-auto relative">
        {/* Connector line */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className="relative text-center"
              initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="glass-card rounded-2xl p-8 relative z-10">
                <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4 block" style={{ color: step.color }}>
                  Step {step.number}
                </span>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: `${step.color}15` }}
                >
                  <step.icon className="w-6 h-6" style={{ color: step.color }} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
