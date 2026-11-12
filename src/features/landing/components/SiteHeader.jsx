import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { Github } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";

const links = [
  { label: "Módulos", href: "#modulos" },
  { label: "Recursos", href: "#recursos" },
];

export function SiteHeader() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(null);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-b border-ink-800 bg-ink-950/90 backdrop-blur-md"
          : "border-b border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link to="/home" aria-label="LearnHub, início">
          <Logo />
        </Link>

        <nav className="hidden items-center md:flex" onMouseLeave={() => setHovered(null)}>
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onMouseEnter={() => setHovered(link.href)}
              className="relative px-4 py-2 text-sm text-ink-300 transition-colors hover:text-ink-50"
            >
              {hovered === link.href && (
                <motion.span
                  layoutId="nav-hover"
                  className="absolute inset-0 -z-10 rounded-md bg-ink-800"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              {link.label}
            </a>
          ))}
          <a
            href="https://github.com/DanielWallans/Learnhub"
            target="_blank"
            rel="noreferrer"
            onMouseEnter={() => setHovered("gh")}
            className="relative flex items-center gap-1.5 px-4 py-2 text-sm text-ink-300 transition-colors hover:text-ink-50"
          >
            {hovered === "gh" && (
              <motion.span
                layoutId="nav-hover"
                className="absolute inset-0 -z-10 rounded-md bg-ink-800"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-md px-3 py-2 text-sm text-ink-200 transition-colors hover:text-ink-50"
          >
            Entrar
          </Link>
          <Link
            to="/cadastro-aluno"
            className="rounded-md bg-ink-50 px-3.5 py-2 text-sm font-medium text-ink-950 transition-colors hover:bg-white"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </header>
  );
}
