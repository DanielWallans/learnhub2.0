import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { ArrowUp, CalendarCheck, ChevronDown, Clock, ListChecks, Plus, SlidersHorizontal } from 'lucide-react';
import { db } from '@/lib/firebase';
import { COL } from '@/lib/collections';
import { cn } from '@/lib/utils';
import { useStudent } from '@/context/StudentContext';
import { ModuleFrame } from '@/components/layout/ModuleFrame';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { EmptyState, StatRow } from '@/components/ui/primitives';
import { useFeedback } from '@/components/ui/feedback';
import { TaskItem } from '@/features/tarefas/components/TaskItem';
import { TaskForm } from '@/features/tarefas/components/TaskForm';
import { WeekStrip } from '@/features/tarefas/components/WeekStrip';
import { TAREFA_VAZIA, categoria } from '@/features/tarefas/lib/constants';
import { amanhaIso, dataPorExtenso, hojeIso, rotuloData } from '@/features/tarefas/lib/datas';
import { interpretarTarefa } from '@/features/tarefas/lib/interpretar';
import TarefasImg from '@/assets/modules/tarefas.jpg';

const EXEMPLOS = ['amanhã estudar java às 19h', 'sexta entrevista 14h', 'hoje supermercado'];

// Importantes primeiro, depois por horário (sem horário por último) e ordem de criação
const ordenar = (a, b) =>
  (b.importante ? 1 : 0) - (a.importante ? 1 : 0) ||
  (a.data || '9999').localeCompare(b.data || '9999') ||
  (a.hora || '99').localeCompare(b.hora || '99') ||
  (a.createdAt || 0) - (b.createdAt || 0);

function Grupo({ titulo, detalhe, tarefas, mostrarData, acoes }) {
  if (!tarefas.length) return null;
  return (
    <section>
      <h3 className="flex items-baseline gap-2 border-b border-ink-800 pb-2 text-sm font-medium text-ink-50">
        {titulo}
        <span className="font-mono text-xs text-ink-500">{tarefas.length}</span>
        {detalhe && <span className="ml-auto text-xs font-normal text-ink-500">{detalhe}</span>}
      </h3>
      <ul>
        <AnimatePresence initial={false}>
          {tarefas.map((t) => (
            <TaskItem key={t.id} tarefa={t} mostrarData={mostrarData} {...acoes} />
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}

export default function TarefasPage() {
  const { user } = useStudent();
  const { toast } = useFeedback();
  const [tarefas, setTarefas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [texto, setTexto] = useState('');
  const [diaFiltro, setDiaFiltro] = useState(null);
  const [verConcluidas, setVerConcluidas] = useState(false);
  const [dialogo, setDialogo] = useState(null); // { modo: 'nova' | 'editar', dados }

  useEffect(() => {
    if (!user) return undefined;
    return onSnapshot(query(collection(db, COL.tarefas), where('userId', '==', user.uid)), (snap) => {
      setTarefas(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setCarregando(false);
    });
  }, [user]);

  const hoje = hojeIso();
  const amanha = amanhaIso();

  // Prévia do que foi entendido na frase digitada
  const previa = useMemo(() => (texto.trim() ? interpretarTarefa(texto) : null), [texto]);

  const pendentes = useMemo(() => tarefas.filter((t) => !t.concluida), [tarefas]);
  const grupos = useMemo(() => {
    const p = [...pendentes].sort(ordenar);
    return {
      atrasadas: p.filter((t) => t.data && t.data < hoje),
      hoje: p.filter((t) => t.data === hoje),
      amanha: p.filter((t) => t.data === amanha),
      proximas: p.filter((t) => t.data && t.data > amanha),
      semData: p.filter((t) => !t.data),
      concluidas: tarefas.filter((t) => t.concluida).sort((a, b) => (b.concluidaEm || 0) - (a.concluidaEm || 0)),
    };
  }, [tarefas, pendentes, hoje, amanha]);

  const contagemDias = useMemo(() => {
    const c = {};
    pendentes.forEach((t) => {
      if (t.data) c[t.data] = (c[t.data] || 0) + 1;
    });
    return c;
  }, [pendentes]);

  const semanaPassada = Date.now() - 7 * 86400000;
  const feitasSemana = tarefas.filter((t) => t.concluida && (t.concluidaEm || 0) > semanaPassada).length;

  const criar = async (dados) => {
    const nova = { ...TAREFA_VAZIA, ...dados, concluida: false, concluidaEm: null, userId: user.uid, createdAt: Date.now() };
    await addDoc(collection(db, COL.tarefas), nova);
    toast({
      title: 'Tarefa adicionada',
      description: [nova.titulo, rotuloData(nova.data), nova.hora].filter(Boolean).join(' · '),
      tone: 'success',
    });
  };

  // Entrada rápida: Enter cria a tarefa com o que foi entendido da frase
  const adicionarRapido = async (e) => {
    e.preventDefault();
    if (!previa || !previa.titulo) return;
    try {
      await criar({ ...previa, data: previa.data || diaFiltro || '' });
      setTexto('');
    } catch (err) {
      toast({ title: 'Não foi possível adicionar', tone: 'error' });
    }
  };

  const abrirDetalhes = () => {
    const base = previa ? { ...previa, data: previa.data || diaFiltro || '' } : { data: diaFiltro || '' };
    setDialogo({ modo: 'nova', dados: { ...TAREFA_VAZIA, ...base } });
  };

  const salvarDialogo = async (e) => {
    e.preventDefault();
    const { modo, dados } = dialogo;
    if (!dados.titulo.trim()) return;
    const campos = {
      titulo: dados.titulo.trim(),
      data: dados.data,
      hora: dados.hora,
      categoria: dados.categoria,
      importante: !!dados.importante,
      notas: dados.notas || '',
    };
    try {
      if (modo === 'nova') {
        await criar(campos);
        setTexto('');
      } else {
        await updateDoc(doc(db, COL.tarefas, dados.id), campos);
        toast({ title: 'Tarefa atualizada', tone: 'success' });
      }
      setDialogo(null);
    } catch (err) {
      toast({ title: 'Não foi possível salvar', tone: 'error' });
    }
  };

  const acoes = {
    onToggle: (t) =>
      updateDoc(doc(db, COL.tarefas, t.id), { concluida: !t.concluida, concluidaEm: t.concluida ? null : Date.now() }),
    onImportante: (t) => updateDoc(doc(db, COL.tarefas, t.id), { importante: !t.importante }),
    onEditar: (t) => setDialogo({ modo: 'editar', dados: { ...TAREFA_VAZIA, ...t } }),
    // Exclui na hora e oferece "Desfazer" em vez de pedir confirmação
    onExcluir: async (t) => {
      const { id, ...dados } = t;
      await deleteDoc(doc(db, COL.tarefas, id));
      toast({
        title: 'Tarefa excluída',
        description: t.titulo,
        duration: 6000,
        action: { label: 'Desfazer', onClick: () => setDoc(doc(db, COL.tarefas, id), dados) },
      });
    },
  };

  const doDia = diaFiltro ? tarefas.filter((t) => t.data === diaFiltro).sort((a, b) => (a.concluida ? 1 : 0) - (b.concluida ? 1 : 0) || ordenar(a, b)) : [];
  const vazio = !carregando && tarefas.length === 0;
  const catPrevia = previa ? categoria(previa.categoria) : null;

  return (
    <ModuleFrame
      id="tarefas"
      index="05"
      image={TarefasImg}
      title="Tarefas"
      phrase="O que você tem pra fazer, escrito do jeito que você fala: amanhã estudar Java às 19h."
      cta="Abrir minhas tarefas"
      stats={[
        { label: 'Para hoje', value: grupos.hoje.length },
        { label: 'Amanhã', value: grupos.amanha.length },
        { label: 'Feitas na semana', value: feitasSemana },
      ]}
      actions={
        <Button onClick={() => setDialogo({ modo: 'nova', dados: { ...TAREFA_VAZIA, data: diaFiltro || '' } })}>
          <Plus /> Nova tarefa
        </Button>
      }
    >
      {/* Entrada rápida */}
      <form onSubmit={adicionarRapido} className="group relative">
        <div className="flex items-center gap-3 border-b-2 border-ink-700 pb-3 transition-colors focus-within:border-lime">
          <Plus className="h-5 w-5 shrink-0 text-ink-500 transition-colors group-focus-within:text-lime" />
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escreva uma tarefa: amanhã estudar java às 19h"
            aria-label="Nova tarefa"
            className="min-w-0 flex-1 bg-transparent text-lg text-ink-50 placeholder:text-ink-600 focus:outline-none sm:text-xl"
          />
          <button
            type="button"
            onClick={abrirDetalhes}
            className="hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-ink-400 transition-colors hover:bg-ink-900 hover:text-ink-100 sm:flex"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> Detalhes
          </button>
          <Button type="submit" size="icon" disabled={!previa?.titulo} aria-label="Adicionar tarefa">
            <ArrowUp />
          </Button>
        </div>

        <div className="mt-3 min-h-[28px]">
          <AnimatePresence mode="wait" initial={false}>
            {previa?.titulo ? (
              <motion.div
                key="previa"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex flex-wrap items-center gap-1.5 text-xs"
              >
                <span className="text-ink-500">Vai criar:</span>
                <span className="rounded-full bg-ink-800 px-2.5 py-1 text-ink-50">{previa.titulo}</span>
                <span className="flex items-center gap-1 rounded-full border border-lime/30 bg-lime/10 px-2.5 py-1 text-lime">
                  <CalendarCheck className="h-3 w-3" /> {rotuloData(previa.data || diaFiltro || '')}
                </span>
                {previa.hora && (
                  <span className="flex items-center gap-1 rounded-full border border-ink-700 px-2.5 py-1 font-mono text-ink-200">
                    <Clock className="h-3 w-3" /> {previa.hora}
                  </span>
                )}
                <span className="flex items-center gap-1 rounded-full border border-ink-700 px-2.5 py-1 text-ink-200">
                  <catPrevia.icone className="h-3 w-3" /> {catPrevia.valor}
                </span>
                <span className="ml-1 hidden text-ink-600 sm:inline">Enter para salvar</span>
              </motion.div>
            ) : (
              <motion.div key="exemplos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-wrap gap-x-3 gap-y-1">
                {EXEMPLOS.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => setTexto(ex)}
                    className="font-mono text-xs text-ink-500 underline-offset-4 transition-colors hover:text-ink-100 hover:underline"
                  >
                    {ex}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>

      {/* Semana */}
      <div className="mt-8">
        <WeekStrip contagem={contagemDias} selecionado={diaFiltro} onSelecionar={setDiaFiltro} />
      </div>

      <StatRow
        className="mt-10"
        items={[
          { label: 'Para hoje', value: grupos.hoje.length },
          { label: 'Amanhã', value: grupos.amanha.length },
          { label: 'Atrasadas', value: grupos.atrasadas.length, hint: grupos.atrasadas.length ? 'reorganize ou conclua' : 'tudo em dia' },
          { label: 'Feitas na semana', value: feitasSemana, accent: feitasSemana > 0 },
        ]}
      />

      {/* Lista */}
      <div className="mt-12">
        {vazio ? (
          <EmptyState
            icon={ListChecks}
            title="Nenhuma tarefa por aqui"
            description="Escreva no campo lá em cima do jeito que você falaria, por exemplo: amanhã estudar java às 19h."
          />
        ) : (
          <LayoutGroup>
            {diaFiltro ? (
              <div className="flex flex-col gap-10">
                <Grupo
                  titulo={rotuloData(diaFiltro)}
                  detalhe={dataPorExtenso(diaFiltro)}
                  tarefas={doDia}
                  acoes={acoes}
                />
                {doDia.length === 0 && (
                  <EmptyState
                    icon={CalendarCheck}
                    title={`Nada marcado para ${rotuloData(diaFiltro).toLowerCase()}`}
                    description="O que você escrever agora sem data vai para este dia."
                  />
                )}
              </div>
            ) : (
              <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-2 lg:gap-x-12">
                <div className="flex flex-col gap-10">
                  <Grupo titulo="Atrasadas" tarefas={grupos.atrasadas} mostrarData acoes={acoes} />
                  <Grupo titulo="Hoje" detalhe={dataPorExtenso(hoje)} tarefas={grupos.hoje} acoes={acoes} />
                  <Grupo titulo="Amanhã" detalhe={dataPorExtenso(amanha)} tarefas={grupos.amanha} acoes={acoes} />
                  {!grupos.atrasadas.length && !grupos.hoje.length && !grupos.amanha.length && (
                    <EmptyState icon={CalendarCheck} title="Hoje e amanhã livres" description="Nenhuma tarefa marcada para os próximos dois dias." />
                  )}
                </div>
                <div className="flex flex-col gap-10">
                  <Grupo titulo="Próximos dias" tarefas={grupos.proximas} mostrarData acoes={acoes} />
                  <Grupo titulo="Sem data" tarefas={grupos.semData} acoes={acoes} />
                  {grupos.concluidas.length > 0 && (
                    <section>
                      <button
                        onClick={() => setVerConcluidas((v) => !v)}
                        className="flex w-full items-center gap-2 border-b border-ink-800 pb-2 text-left text-sm text-ink-400 transition-colors hover:text-ink-100"
                      >
                        Concluídas
                        <span className="font-mono text-xs text-ink-500">{grupos.concluidas.length}</span>
                        <ChevronDown className={cn('ml-auto h-4 w-4 transition-transform', verConcluidas && 'rotate-180')} />
                      </button>
                      <AnimatePresence initial={false}>
                        {verConcluidas && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <AnimatePresence initial={false}>
                              {grupos.concluidas.map((t) => (
                                <TaskItem key={t.id} tarefa={t} mostrarData {...acoes} />
                              ))}
                            </AnimatePresence>
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </section>
                  )}
                </div>
              </div>
            )}
          </LayoutGroup>
        )}
      </div>

      <Dialog
        open={!!dialogo}
        onClose={() => setDialogo(null)}
        title={dialogo?.modo === 'editar' ? 'Editar tarefa' : 'Nova tarefa'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDialogo(null)}>Cancelar</Button>
            <Button type="submit" form="tarefa-form">{dialogo?.modo === 'editar' ? 'Salvar' : 'Adicionar'}</Button>
          </>
        }
      >
        {dialogo && (
          <TaskForm id="tarefa-form" value={dialogo.dados} onChange={(dados) => setDialogo({ ...dialogo, dados })} onSubmit={salvarDialogo} />
        )}
      </Dialog>
    </ModuleFrame>
  );
}
