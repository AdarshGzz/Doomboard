import { motion } from "framer-motion";
import { Target, Clock, Rocket } from "lucide-react";

const items = [
  { icon: Target, label: "Track smarter" },
  { icon: Clock, label: "Save time" },
  { icon: Rocket, label: "Land faster" },
];

export const TrustStrip = () => (
  <section className="relative py-16 border-y border-border/50 bg-gradient-section">
    <div className="container px-6 mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-12 sm:gap-20">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            className="flex items-center gap-3 group cursor-default"
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="p-3 rounded-xl glass transition-all duration-300 group-hover:glow-border">
              <item.icon className="w-5 h-5 text-accent transition-transform duration-200 group-hover:scale-110" />
            </div>
            <span className="text-lg font-semibold text-foreground">{item.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
