import { BookOpen, Briefcase, LayoutGrid, Target, Wallet } from "lucide-react";

// Fonte única dos itens de navegação (sidebar, dock e busca)
export const NAV_ITEMS = [
  { to: "/dashboard", label: "Painel", icon: LayoutGrid },
  { to: "/leitura", label: "Biblioteca", icon: BookOpen },
  { to: "/financas", label: "Finanças", icon: Wallet },
  { to: "/habilidades", label: "Habilidades", icon: Target },
  { to: "/carreira", label: "Carreira", icon: Briefcase },
];
