import { BookOpen, Briefcase, FolderKanban, LayoutGrid, ListChecks, Target, Wallet } from "lucide-react";

// Fonte única dos itens de navegação (sidebar, dock e busca).
// "curto" é o nome no dock do celular, onde 7 itens dividem a largura da tela.
export const NAV_ITEMS = [
  { to: "/dashboard", label: "Painel", icon: LayoutGrid },
  { to: "/tarefas", label: "Tarefas", icon: ListChecks },
  { to: "/leitura", label: "Biblioteca", curto: "Livros", icon: BookOpen },
  { to: "/financas", label: "Finanças", icon: Wallet },
  { to: "/habilidades", label: "Habilidades", curto: "Skills", icon: Target },
  { to: "/carreira", label: "Carreira", icon: Briefcase },
  { to: "/projetos", label: "Projetos", icon: FolderKanban },
];

// Quantidade de módulos (todos os itens menos o Painel), usada no contador "01 / 05"
export const TOTAL_MODULOS = String(NAV_ITEMS.length - 1).padStart(2, "0");
