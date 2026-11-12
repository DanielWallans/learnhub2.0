// Datas sempre no fuso local, no formato "AAAA-MM-DD" (sem horário, para não virar o dia por causa do UTC)

export const DIAS_CURTOS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
export const DIAS_LONGOS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function isoLocal(data) {
  const y = data.getFullYear();
  const m = String(data.getMonth() + 1).padStart(2, '0');
  const d = String(data.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function deIso(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function somarDias(iso, dias) {
  const d = deIso(iso);
  d.setDate(d.getDate() + dias);
  return isoLocal(d);
}

export const hojeIso = () => isoLocal(new Date());
export const amanhaIso = () => somarDias(hojeIso(), 1);

// "Hoje", "Amanhã", "Ontem", "sexta" (até 6 dias) ou "qui, 14 nov"
export function rotuloData(iso) {
  if (!iso) return 'Sem data';
  const hoje = hojeIso();
  const diff = Math.round((deIso(iso) - deIso(hoje)) / 86400000);
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Amanhã';
  if (diff === -1) return 'Ontem';
  const d = deIso(iso);
  if (diff > 1 && diff < 7) return DIAS_LONGOS[d.getDay()];
  return `${DIAS_CURTOS[d.getDay()]}, ${d.getDate()} ${MESES[d.getMonth()]}`;
}

// "quinta-feira, 14 de novembro"
export function dataPorExtenso(iso) {
  return deIso(iso).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

// Os próximos 7 dias a partir de hoje
export function proximosDias(qtd = 7) {
  const hoje = hojeIso();
  return Array.from({ length: qtd }, (_, i) => {
    const iso = somarDias(hoje, i);
    const d = deIso(iso);
    return { iso, dia: d.getDate(), semana: i === 0 ? 'hoje' : DIAS_CURTOS[d.getDay()] };
  });
}
