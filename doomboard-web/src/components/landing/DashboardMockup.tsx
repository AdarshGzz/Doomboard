import { motion } from "framer-motion";

const columns = [
  {
    title: "Applied",
    color: "hsl(38, 90%, 55%)",
    cards: [
      { company: "Stripe", role: "Sr. Frontend Engineer", tag: "Remote" },
      { company: "Linear", role: "Product Designer", tag: "NYC" },
    ],
  },
  {
    title: "Interview",
    color: "hsl(200, 60%, 50%)",
    cards: [
      { company: "Vercel", role: "Full Stack Dev", tag: "SF" },
    ],
  },
  {
    title: "Offer",
    color: "hsl(160, 50%, 45%)",
    cards: [
      { company: "Notion", role: "Design Engineer", tag: "Remote" },
    ],
  },
];

export const DashboardMockup = () => (
  <div className="glass-card rounded-2xl p-6 glow-border">
    <div className="flex items-center gap-2 mb-6">
      <div className="w-3 h-3 rounded-full" style={{ background: "hsl(0, 60%, 50%)" }} />
      <div className="w-3 h-3 rounded-full" style={{ background: "hsl(38, 80%, 50%)" }} />
      <div className="w-3 h-3 rounded-full" style={{ background: "hsl(140, 50%, 42%)" }} />
      <span className="ml-3 text-xs text-muted-foreground font-medium tracking-wider uppercase">Doomboard — Dashboard</span>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((col, ci) => (
        <div key={col.title} className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
            <span className="text-sm font-semibold text-foreground">{col.title}</span>
            <span className="text-xs text-muted-foreground ml-auto">{col.cards.length}</span>
          </div>
          {col.cards.map((card, i) => (
            <motion.div
              key={card.company}
              className="glass rounded-xl p-4 transition-all duration-300 hover:translate-y-[-2px]"
              style={{ borderLeft: `2px solid ${col.color}` }}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + ci * 0.15 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-sm font-semibold text-foreground">{card.company}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.role}</p>
              <span
                className="inline-block mt-2 text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: `${col.color}20`, color: col.color }}
              >
                {card.tag}
              </span>
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  </div>
);
