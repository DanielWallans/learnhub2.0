import { ArrowDownRight, Wallet, PiggyBank, BookOpen, Code, ShoppingBag, Cpu, Music } from 'lucide-react';

export const RESUMO_INICIAL = {
  totalBalance: 0,
  totalSpending: 0,
  totalSaved: 0,
  cardBalance: 0,
  cardBrand: 'VISA',
  cardNumber: '**** **** 1287 2342',
  cardExpiration: '05/29',
  cardColor: 'lime',
  cardNickname: 'Principal'
};

// Só três estilos de cartão para manter a paleta do app (preto, branco e lime)
export const CARD_STYLES = {
  lime: 'bg-lime text-ink-950',
  white: 'bg-ink-50 text-ink-950',
  black: 'bg-ink-800 text-ink-50 ring-1 ring-inset ring-ink-600'
};
export const cardStyle = (color) => CARD_STYLES[color] || CARD_STYLES.black;

export const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export const brl = (v) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const getTxIcon = (iconName) => {
  switch (iconName) {
    case 'Code': return Code;
    case 'ShoppingBag': return ShoppingBag;
    case 'Cpu': return Cpu;
    case 'Music': return Music;
    case 'BookOpen': return BookOpen;
    case 'ArrowDownRight': return ArrowDownRight;
    case 'PiggyBank': return PiggyBank;
    default: return Wallet;
  }
};
