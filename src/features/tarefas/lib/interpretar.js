import { CATEGORIAS, ORDEM_DETECCAO } from '@/features/tarefas/lib/constants';
import { deIso, hojeIso, isoLocal, somarDias } from '@/features/tarefas/lib/datas';

// Transforma frases como "amanhã estudar java às 19h" em { titulo, data, hora, categoria }.
// Funciona por regras de texto (não é IA): reconhece o dia, o horário e palavras de cada categoria.

const semAcento = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const DIAS = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

// Cada regra devolve a data (ISO) a partir do trecho encontrado
const REGRAS_DATA = [
  { re: /\bdepois de amanha\b/, data: () => somarDias(hojeIso(), 2) },
  { re: /\bamanha\b/, data: () => somarDias(hojeIso(), 1) },
  { re: /\bhoje\b/, data: () => hojeIso() },
  {
    // "na sexta", "segunda-feira", "proximo sabado"
    re: /\b(?:(?:na|no|nesta|neste|proxima|proximo)\s+)?(domingo|segunda|terca|quarta|quinta|sexta|sabado)(?:-feira)?\b/,
    data: (m) => {
      const alvo = DIAS.indexOf(m[1]);
      const hoje = deIso(hojeIso());
      const diff = (alvo - hoje.getDay() + 7) % 7 || 7;
      return somarDias(hojeIso(), diff);
    },
  },
  {
    // "15/11" ou "15/11/2026"
    re: /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/,
    data: (m) => {
      const hoje = deIso(hojeIso());
      let ano = m[3] ? Number(m[3].length === 2 ? `20${m[3]}` : m[3]) : hoje.getFullYear();
      let d = new Date(ano, Number(m[2]) - 1, Number(m[1]));
      if (!m[3] && d < hoje) d = new Date(ano + 1, Number(m[2]) - 1, Number(m[1]));
      return isoLocal(d);
    },
  },
  {
    // "dia 15"
    re: /\bdia\s+(\d{1,2})\b/,
    data: (m) => {
      const hoje = deIso(hojeIso());
      let d = new Date(hoje.getFullYear(), hoje.getMonth(), Number(m[1]));
      if (d < hoje) d = new Date(hoje.getFullYear(), hoje.getMonth() + 1, Number(m[1]));
      return isoLocal(d);
    },
  },
];

// "19h", "19h30", "19:30", "às 7", "as 7 da noite"
const RE_HORA = /\b(?:(?:as|a partir das|ate as)\s+)?(\d{1,2})(?:\s*(?:h|:)\s*(\d{2})?|(?=\s*(?:da manha|da tarde|da noite)))(?:\s*(da manha|da tarde|da noite))?|\b(?:as|ate as)\s+(\d{1,2})\b/;

// Remove do texto original o trecho [ini, fim) encontrado no texto sem acento (mesmo tamanho)
const cortar = (texto, ini, fim) => `${texto.slice(0, ini)} ${texto.slice(fim)}`;

export function interpretarTarefa(texto) {
  let original = texto.normalize('NFC');
  let norm = semAcento(original);
  let data = '';
  let hora = '';

  for (const regra of REGRAS_DATA) {
    const m = norm.match(regra.re);
    if (m) {
      data = regra.data(m);
      original = cortar(original, m.index, m.index + m[0].length);
      norm = semAcento(original);
      break;
    }
  }

  const h = norm.match(RE_HORA);
  if (h) {
    let horas = Number(h[1] ?? h[4]);
    const minutos = Number(h[2] || 0);
    if (h[3] && (h[3] === 'da tarde' || h[3] === 'da noite') && horas < 12) horas += 12;
    if (horas <= 23 && minutos <= 59) {
      hora = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
      original = cortar(original, h.index, h.index + h[0].length);
    }
  }

  // Limpa conectores que sobraram nas pontas ("de", "no", "às"...) e espaços repetidos
  let titulo = original
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(?:de|do|da|no|na|as|às|a|e|para|pra)\s+/i, '')
    .replace(/\s+(?:de|do|da|no|na|as|às|a|e|para|pra)$/i, '')
    .trim();
  titulo = titulo.charAt(0).toUpperCase() + titulo.slice(1);

  const tituloNorm = ` ${semAcento(titulo)} `;
  const cat = ORDEM_DETECCAO.map((v) => CATEGORIAS.find((c) => c.valor === v)).find((c) => c.palavras.test(tituloNorm));

  return { titulo, data, hora, categoria: cat ? cat.valor : 'Pessoal' };
}
