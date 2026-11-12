import { brl } from '@/features/financas/lib/constants';

// Interpreta frases como "gastei 50 no almoço" (regras de texto, sem IA)
export const processarLancamento = (text) => {
  const textLower = text.toLowerCase();
  const matches = textLower.match(/\b\d+(?:[.,]\d+)?\b/g);

  if (!matches) {
    return { reply: 'Não achei um valor na frase. Tente algo como "gastei 150 com livros".', success: false };
  }

  const valor = parseFloat(matches[0].replace('.', '').replace(',', '.'));
  if (isNaN(valor) || valor <= 0) {
    return { reply: 'O valor parece inválido. Tente de novo.', success: false };
  }

  const isExpense = /gast|saida|saída|compr|pagu|perdi|cust|manuten|livr|lanche|raç/i.test(textLower);
  const isIncome = /receb|ganh|entrad|freel|salari|salári|receita|deposi/i.test(textLower);
  const isSave = /guard|reserv|poup|estud|projet/i.test(textLower);

  if (isSave) {
    return { type: 'save', value: valor, desc: 'Reserva para estudos', category: 'Reserva', icon: 'PiggyBank', reply: `${brl(valor)} foram para a reserva.`, success: true };
  }
  if (isExpense) {
    let category = 'Outros';
    let icon = 'ShoppingBag';
    if (/livr|estud|facul|curs|soft/i.test(textLower)) { category = 'Estudos'; icon = 'BookOpen'; }
    else if (/lanche|comid|restaur|raç/i.test(textLower)) { category = 'Alimentação'; icon = 'ShoppingBag'; }
    else if (/peça|hardw|comput/i.test(textLower)) { category = 'Hardware'; icon = 'Cpu'; }

    let desc = 'Gasto';
    if (/livr/i.test(textLower)) desc = 'Compra de livros';
    else if (/lanche|almoç|jant/i.test(textLower)) desc = 'Refeição';
    else if (/raç/i.test(textLower)) desc = 'Ração para pets';
    else if (/soft/i.test(textLower)) desc = 'Licença de software';
    else if (/hardw/i.test(textLower)) desc = 'Peças de hardware';
    else if (/manuten/i.test(textLower)) desc = 'Manutenção';

    return { type: 'expense', value: valor, desc, category, icon, reply: `Saída de ${brl(valor)} em "${desc}".`, success: true };
  }
  if (isIncome) {
    let desc = 'Receita extra';
    if (/freel/i.test(textLower)) desc = 'Freelance';
    else if (/salari|salári/i.test(textLower)) desc = 'Salário';
    else if (/bolsa/i.test(textLower)) desc = 'Bolsa de estudos';
    return { type: 'income', value: valor, desc, category: 'Renda', icon: 'Wallet', reply: `Entrada de ${brl(valor)} em "${desc}".`, success: true };
  }
  return {
    reply: `Achei ${brl(valor)}, mas não sei se foi gasto, entrada ou reserva. Comece com "gastei", "recebi" ou "guardei".`,
    success: false
  };
};
