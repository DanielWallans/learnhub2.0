import { Link } from "react-router-dom";
import { Github } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const columns = [
  {
    title: "Produto",
    links: [
      { label: "Módulos", href: "#modulos" },
      { label: "Recursos", href: "#recursos" },
    ],
  },
  {
    title: "Conta",
    links: [
      { label: "Entrar", to: "/login" },
      { label: "Criar conta", to: "/cadastro-aluno" },
      { label: "Esqueci a senha", to: "/esqueci-senha" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-ink-800">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:px-8 md:grid-cols-[1fr_auto_auto] md:gap-20">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-ink-400">
            Organização para estudantes: leitura, finanças, hábitos e carreira.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-sm text-ink-50">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.to ? (
                    <Link to={l.to} className="inline-block py-1 text-sm text-ink-400 transition-colors hover:text-ink-50">
                      {l.label}
                    </Link>
                  ) : (
                    <a href={l.href} className="inline-block py-1 text-sm text-ink-400 transition-colors hover:text-ink-50">
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-ink-800 px-5 py-6 sm:px-8">
        <p className="font-mono text-xs text-ink-500">© {new Date().getFullYear()} LearnHub · por Daniel Wallans</p>
        <a
          href="https://github.com/DanielWallans"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub de Daniel Wallans"
          className="text-ink-400 transition-colors hover:text-ink-50"
        >
          <Github className="h-4 w-4" />
        </a>
      </div>
    </footer>
  );
}
