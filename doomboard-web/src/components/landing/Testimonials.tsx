import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Manager at Figma",
    text: "Doomboard turned my chaotic spreadsheet into a clean pipeline. Landed my dream role in 3 weeks.",
    initials: "SC",
    color: "hsl(38, 90%, 55%)",
  },
  {
    name: "Marcus Rivera",
    role: "Software Engineer",
    text: "The AI extraction alone saves me 2 hours per day. It's like having a career assistant that never sleeps.",
    initials: "MR",
    color: "hsl(200, 60%, 50%)",
  },
  {
    name: "Aisha Patel",
    role: "UX Designer",
    text: "Finally a tool that understands how stressful job hunting is. Clean, fast, and genuinely helpful.",
    initials: "AP",
    color: "hsl(160, 50%, 45%)",
  },
];

export const Testimonials = () => (
  <section className="relative py-32 bg-gradient-dark">
    <div className="container px-6 mx-auto">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
          Loved by <span className="text-gradient-primary">job hunters</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            className="glass-card rounded-2xl p-7 group transition-all duration-300 hover:translate-y-[-4px]"
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">"{t.text}"</p>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: `${t.color}20`, color: t.color }}
              >
                {t.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
