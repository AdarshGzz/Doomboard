import { Github, Twitter, Linkedin } from "lucide-react";

const links = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Privacy", href: "#" },
];

const socials = [
  { icon: Twitter, href: "#" },
  { icon: Github, href: "#" },
  { icon: Linkedin, href: "#" },
];

export const Footer = () => (
  <footer className="border-t border-border/50 py-12 bg-background">
    <div className="container px-6 mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-xs font-black text-primary-foreground">D</span>
          </div>
          <span className="font-bold text-foreground tracking-tight">Doomboard</span>
        </div>

        <nav className="flex items-center gap-6">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {socials.map((s, i) => (
            <a
              key={i}
              href={s.href}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200 active:scale-95"
            >
              <s.icon className="w-4 h-4" />
            </a>
          ))}
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-8">
        © 2026 Doomboard. All rights reserved.
      </p>
    </div>
  </footer>
);
