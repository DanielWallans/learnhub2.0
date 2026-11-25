import { supabase } from '@/lib/supabase';

// Camada de dados sobre o Supabase com a mesma "cara" da API do Firestore
// (doc, collection, query, where, onSnapshot, addDoc...). Assim as páginas quase não mudam:
// cada coleção virou uma tabela com as colunas id, user_id e data (jsonb). Ver supabase/schema.sql.

export const db = { kind: 'supabase' };

const tabela = (nome) => nome.replace(/-/g, '_');

export const collection = (_db, nome) => ({ tipo: 'colecao', tabela: tabela(nome), filtros: [] });
export const doc = (_db, nome, id) => ({ tipo: 'doc', tabela: tabela(nome), id });
export const where = (campo, op, valor) => ({ campo, op, valor });
export const query = (colecao, ...filtros) => ({ ...colecao, filtros: [...colecao.filtros, ...filtros] });
export const serverTimestamp = () => new Date().toISOString();

// Datas viram texto ISO e campos undefined somem antes de gravar no jsonb
const limpar = (dados) => JSON.parse(JSON.stringify(dados ?? {}));

const novoId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
};

const docSnap = (id, data) => ({ id, exists: () => data != null, data: () => (data == null ? undefined : data) });

async function buscar(ref) {
  if (ref.tipo === 'doc') {
    const { data, error } = await supabase.from(ref.tabela).select('id, data').eq('id', ref.id).maybeSingle();
    if (error) throw error;
    return docSnap(ref.id, data ? data.data : null);
  }
  let q = supabase.from(ref.tabela).select('id, data');
  for (const f of ref.filtros) {
    if (f.op !== '==') throw new Error(`Operador não suportado: ${f.op}`);
    q = f.campo === 'userId' ? q.eq('user_id', f.valor) : q.eq(`data->>${f.campo}`, String(f.valor));
  }
  const { data, error } = await q;
  if (error) throw error;
  const docs = (data || []).map((r) => docSnap(r.id, r.data));
  return { docs, empty: docs.length === 0, size: docs.length, forEach: (fn) => docs.forEach(fn) };
}

export const getDoc = (ref) => buscar(ref);
export const getDocs = (ref) => buscar(ref);

export async function addDoc(colecao, dados) {
  const id = novoId();
  const { error } = await supabase.from(colecao.tabela).insert({ id, data: limpar(dados) });
  if (error) throw error;
  return { id };
}

async function mesclar(ref, dados) {
  const { error } = await supabase.rpc('merge_doc', { p_table: ref.tabela, p_id: ref.id, p_patch: limpar(dados) });
  if (error) throw error;
}

export async function setDoc(ref, dados, opcoes) {
  if (opcoes?.merge) return mesclar(ref, dados);
  const { error } = await supabase
    .from(ref.tabela)
    .upsert({ id: ref.id, data: limpar(dados), updated_at: new Date().toISOString() });
  if (error) throw error;
}

export const updateDoc = (ref, dados) => mesclar(ref, dados);

export async function deleteDoc(ref) {
  const { error } = await supabase.from(ref.tabela).delete().eq('id', ref.id);
  if (error) throw error;
}

// Tempo real: busca os dados e busca de novo sempre que a tabela muda
let canais = 0;
export function onSnapshot(ref, aoMudar, aoErrar) {
  let ativo = true;
  let timer = null;

  const atualizar = () =>
    buscar(ref)
      .then((snap) => ativo && aoMudar(snap))
      .catch((err) => {
        if (!ativo) return;
        if (aoErrar) aoErrar(err);
        else console.error(`onSnapshot(${ref.tabela}):`, err);
      });

  const agendar = () => {
    clearTimeout(timer);
    timer = setTimeout(atualizar, 80);
  };

  const filtro = ref.tipo === 'doc' ? { filter: `id=eq.${ref.id}` } : {};
  const canal = supabase
    .channel(`rt-${ref.tabela}-${++canais}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: ref.tabela, ...filtro }, agendar)
    .subscribe();

  atualizar();

  return () => {
    ativo = false;
    clearTimeout(timer);
    supabase.removeChannel(canal);
  };
}
