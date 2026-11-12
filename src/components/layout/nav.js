import { BookOpen, Briefcase, LayoutGrid, ListChecks, Target, Wallet } from "lucide-react";

// Fonte única dos itens de navegação (sidebar, dock e busca)
export const NAV_ITEMS = [
  { to: "/dashboard", label: "Painel", icon: LayoutGrid },
  { to: "/tarefas", label: "Tarefas", icon: ListChecks },
  { to: "/leitura", label: "Biblioteca", icon: BookOpen },
  { to: "/financas", label: "Finanças", icon: Wallet },
  { to: "/habilidades", label: "Habilidades", icon: Target },
  { to: "/carreira", label: "Carreira", icon: Briefcase },
];

// Quantidade de módulos (todos os itens menos o Painel), usada no contador "01 / 05"
export const TOTAL_MODULOS = String(NAV_ITEMS.length - 1).padStart(2, "0");
