import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, LayoutGroup } from 'motion/react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, setDoc, updateDoc, where } from '@/lib/db';
import { Columns3, FolderKanban, List, Plus, Search, X } from 'lucide-react';
import { db } from '@/lib/db';
import { COL } from '@/lib/collections';
import { cn } from '@/lib/utils';
import { useStudent } from '@/context/StudentContext';
import { ModuleFrame } from '@/components/layout/ModuleFrame';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/field';
import { EmptyState, Segmented, StatRow } from '@/components/ui/primitives';
import { useFeedback } from '@/components/ui/feedback';
import { ProjectCard } from '@/features/projetos/components/ProjectCard';
import { ProjectForm } from '@/features/projetos/components/ProjectForm';
import { ProjectDetail } from '@/features/projetos/components/ProjectDetail';
import {
  AREAS,
  PROJETO_VAZIO,
  STATUS,
  atrasado,
  categoriaTarefa,
  formatarHoras,
  hojeIso,
  ordenarProjetos,
  totalHoras,
} from '@/features/projetos/lib/constants';
import { TAREFA_VAZIA } from '@/features/tarefas/lib/constants';
import ProjetosImg from '@/assets/modules/projetos.jpg';

const semAcento = (t) => (t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function ProjetosPage() {
  const { user } = useStudent();
  const { toast, confirm } = useFeedback();
  const [projetos, setProjetos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroArea, setFiltroArea] = useState('Todas');
  const [verConcluidos, setVerConcluidos] = useState(true);
  const [arrastando, setArrastando] = useState(null);
  const [colunaAlvo, setColunaAlvo] = useState(null);
  const [dialogo, setDialogo] = useState(null); // { modo: 'novo' | 'editar', dados }

  // Projeto aberto e modo de visualização ficam no endereço (?projeto=id&ver=lista)
  const [params, setParams] = useSearchParams();
  const abertoId = params.get('projeto');
  const visao = params.get('ver') === 'lista' ? 'lista' : 'quadro';
  const setParam = (chave, valor, replace = false) => {
    const p = new URLSearchParams(params);
    if (valor) p.set(chave, valor);
    else p.delete(chave);
    setParams(p, { replace });
  };

  useEffect(() => {
    if (!user) return undefined;
    return onSnapshot(
      query(collection(db, COL.projetos), where('userId', '==', user.uid)),
      (snap) => {
        setProjetos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setCarregando(false);
      },
      (err) => {
        console.error('Erro ao carregar projetos:', err);
        setCarregando(false);
        toast({ title: 'Não foi possível abrir os projetos', description: 'Confira as regras do Firestore (coleção projetos).', tone: 'error' });
      }
    );
  }, [user, toast]);

  const aberto = projetos.find((p) => p.id === abertoId) || null;

  const filtrados = useMemo(() => {
    const q = semAcento(busca.trim());
    return projetos
      .filter((p) => filtroArea === 'Todas' || p.area === filtroArea)
      .filter(
        (p) =>
          !q ||
          semAcento(p.nome).includes(q) ||
          semAcento(p.descricao).includes(q) ||
          (p.tags || []).some((t) => semAcento(t).includes(q)) ||
          (p.etapas || []).some((e) => semAcento(e.titulo).includes(q))
      )
      .sort(ordenarProjetos);
  }, [projetos, busca, filtroArea]);

  const ativos = projetos.filter((p) => p.status === 'andamento');
  const concluidos = projetos.filter((p) => p.status === 'concluido');
  const atrasados = projetos.filter(atrasado);
  const semana = Date.now() - 7 * 86400000;
  const etapasSemana = projetos.reduce((n, p) => n + (p.etapas || []).filter((e) => e.feita && (e.feitaEm || 0) > semana).length, 0);
  const horas = projetos.reduce((n, p) => n + totalHoras(p), 0);
  const areasUsadas = AREAS.filter((a) => projetos.some((p) => p.area === a.valor));

  /* Firestore */
  const atualizar = (id, campos) =>
    updateDoc(doc(db, COL.projetos, id), { ...campos, atualizadoEm: Date.now() }).catch(() =>
      toast({ title: 'Não foi possível salvar', tone: 'error' })
    );

  const novo = (status) => {
    setDialogo({ modo: 'novo', dados: { ...PROJETO_VAZIO, status: status || 'planejando', dataInicio: hojeIso() } });
  };

  const salvarDialogo = async (e) => {
    e.preventDefault();
    const { modo, dados } = dialogo;
    if (!dados.nome.trim()) return;
    const campos = {
      nome: dados.nome.trim(),
      descricao: dados.descricao.trim(),
      objetivo: dados.objetivo.trim(),
      area: dados.area,
      status: dados.status,
      prioridade: dados.prioridade,
      dataInicio: dados.dataInicio,
      prazo: dados.prazo,
      tags: dados.tags || [],
      orcamento: parseFloat(dados.orcamento) || 0,
    };
    try {
      if (modo === 'novo') {
        const ref = await addDoc(collection(db, COL.projetos), {
          ...PROJETO_VAZIO,
          ...campos,
          etapas: [],
          userId: user.uid,
          createdAt: Date.now(),
          atualizadoEm: Date.now(),
          concluidoEm: campos.status === 'concluido' ? Date.now() : null,
        });
        toast({ title: 'Projeto criado', description: campos.nome, tone: 'success' });
        setParam('projeto', ref.id);
      } else {
        await atualizar(dados.id, campos);
        toast({ title: 'Projeto atualizado', tone: 'success' });
      }
      setDialogo(null);
    } catch {
      toast({ title: 'Não foi possível salvar', tone: 'error' });
    }
  };

  const excluir = async (projeto) => {
    const ok = await confirm({
      title: `Excluir "${projeto.nome}"?`,
      description: 'Etapas, diário, links e gastos do projeto também somem. As tarefas já enviadas para Tarefas continuam lá.',
      confirmLabel: 'Excluir',
      destructive: true,
    });
    if (!ok) return;
    const { id, ...dados } = projeto;
    await deleteDoc(doc(db, COL.projetos, id));
    setParam('projeto', null);
    toast({ title: 'Projeto excluído', description: projeto.nome, duration: 6000, action: { label: 'Desfazer', onClick: () => setDoc(doc(db, COL.projetos, id), dados) } });
  };

  // Etapa vira uma tarefa no módulo Tarefas, com o prazo da etapa
  const enviarTarefa = async (projeto, etapa) => {
    try {
      const ref = await addDoc(collection(db, COL.tarefas), {
        ...TAREFA_VAZIA,
        titulo: `${etapa.titulo} (${projeto.nome})`,
        data: etapa.prazo || '',
        categoria: categoriaTarefa(projeto.area),
        importante: projeto.prioridade === 'alta',
        notas: `Etapa do projeto "${projeto.nome}"`,
        concluida: false,
        concluidaEm: null,
        userId: user.uid,
        createdAt: Date.now(),
      });
      toast({ title: 'Enviada para Tarefas', description: etapa.prazo ? `Aparece no dia do prazo` : 'Aparece em "Sem data"', tone: 'success' });
      return ref.id;
    } catch {
      toast({ title: 'Não foi possível enviar', tone: 'error' });
      return null;
    }
  };

  const soltar = (statusValor) => (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/projeto');
    setColunaAlvo(null);
    setArrastando(null);
    const p = projetos.find((x) => x.id === id);
    if (!p || p.status === statusValor) return;
    atualizar(id, { status: statusValor, concluidoEm: statusValor === 'concluido' ? Date.now() : null });
    toast({ title: `Movido para ${STATUS.find((s) => s.valor === statusValor).curto.toLowerCase()}`, description: p.nome });
  };

  const abrir = (p) => {
    setParam('projeto', p.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const vazio = !carregando && projetos.length === 0;
  const colunas = STATUS.filter((s) => verConcluidos || s.valor !== 'concluido');

  return (
    <ModuleFrame
      id="projetos"
      index="06"
      image={ProjetosImg}
      title="Projetos"
      phrase="Da ideia ao concluído: etapas, prazo, diário, links e orçamento de cada projeto, de qualquer área."
      cta="Abrir meus projetos"
      stats={[
        { label: 'Em andamento', value: ativos.length },
        { label: 'Concluídos', value: concluidos.length },
        { label: 'Etapas na semana', value: etapasSemana },
      ]}
      actions={
        <Button onClick={() => novo()}>
          <Plus /> Novo projeto
        </Button>
      }
    >
      {aberto ? (
        <ProjectDetail
          key={aberto.id}
          projeto={aberto}
          toast={toast}
          onAtualizar={(campos) => atualizar(aberto.id, campos)}
          onEditar={() => setDialogo({ modo: 'editar', dados: { ...PROJETO_VAZIO, ...aberto } })}
          onExcluir={() => excluir(aberto)}
          onVoltar={() => setParam('projeto', null)}
          onEnviarTarefa={(etapa) => enviarTarefa(aberto, etapa)}
        />
      ) : (
        <>
          <StatRow
            items={[
              { label: 'Em andamento', value: ativos.length },
              { label: 'Atrasados', value: atrasados.length, hint: atrasados.length ? 'prazo vencido' : 'tudo no prazo' },
              { label: 'Etapas feitas na semana', value: etapasSemana, accent: etapasSemana > 0 },
              { label: 'Tempo registrado', value: formatarHoras(horas) },
            ]}
          />

          {/* Barra de ferramentas */}
          <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative sm:max-w-xs sm:flex-1">
              <Input icon={Search} placeholder="Buscar projeto, etapa ou #etiqueta" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar projetos" />
              {busca && (
                <button onClick={() => setBusca('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-400 hover:text-ink-50" aria-label="Limpar busca">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 sm:ml-auto">
              {visao === 'quadro' && concluidos.length > 0 && (
                <button
                  onClick={() => setVerConcluidos((v) => !v)}
                  className="rounded-lg px-2.5 py-2 text-xs text-ink-400 transition-colors hover:bg-ink-900 hover:text-ink-100"
                >
                  {verConcluidos ? 'Esconder concluídos' : 'Mostrar concluídos'}
                </button>
              )}
              <Segmented
                size="sm"
                layoutId="projetos-visao"
                value={visao}
                onChange={(v) => setParam('ver', v === 'lista' ? 'lista' : null, true)}
                options={[
                  { value: 'quadro', label: 'Quadro', icon: Columns3 },
                  { value: 'lista', label: 'Lista', icon: List },
                ]}
              />
            </div>
          </div>

          {areasUsadas.length > 1 && (
            <div className="-mx-4 mt-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
              {[{ valor: 'Todas' }, ...areasUsadas].map((a) => {
                const ativo = filtroArea === a.valor;
                const n = a.valor === 'Todas' ? projetos.length : projetos.filter((p) => p.area === a.valor).length;
                return (
                  <button
                    key={a.valor}
                    onClick={() => setFiltroArea(a.valor)}
                    className={cn(
                      'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors',
                      ativo ? 'border-ink-50 bg-ink-50 text-ink-950' : 'border-ink-800 text-ink-400 hover:border-ink-600 hover:text-ink-100'
                    )}
                  >
                    {a.icone && <a.icone className="h-3.5 w-3.5" />}
                    {a.valor}
                    <span className={cn('font-mono text-[10px]', ativo ? 'text-ink-600' : 'text-ink-600')}>{n}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-8">
            {vazio ? (
              <div>
                <EmptyState
                  icon={FolderKanban}
                  title="Nenhum projeto ainda"
                  description="Pode ser um app, o TCC, uma reforma, uma viagem ou um negócio."
                  action={
                    <Button onClick={() => novo()}>
                      <Plus /> Criar o primeiro projeto
                    </Button>
                  }
                />
              </div>
            ) : filtrados.length === 0 ? (
              <EmptyState icon={Search} title="Nada encontrado" description="Tente outra palavra ou outra área." />
            ) : visao === 'quadro' ? (
              <LayoutGroup>
                <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 xl:grid xl:snap-none xl:overflow-visible" style={{ gridTemplateColumns: `repeat(${colunas.length}, minmax(0, 1fr))` }}>
                  {colunas.map((s) => {
                    const daColuna = filtrados.filter((p) => p.status === s.valor);
                    const alvo = colunaAlvo === s.valor && arrastando;
                    return (
                      <section
                        key={s.valor}
                        onDragOver={(e) => {
                          if (!arrastando) return;
                          e.preventDefault();
                          if (colunaAlvo !== s.valor) setColunaAlvo(s.valor);
                        }}
                        onDragLeave={(e) => {
                          if (!e.currentTarget.contains(e.relatedTarget)) setColunaAlvo(null);
                        }}
                        onDrop={soltar(s.valor)}
                        className={cn(
                          'flex w-[80vw] max-w-[300px] shrink-0 snap-start flex-col rounded-2xl border p-2 transition-colors sm:w-[280px] xl:w-auto xl:max-w-none',
                          alvo ? 'border-lime/50 bg-lime/[0.04]' : 'border-ink-800/70 bg-ink-950'
                        )}
                      >
                        <h3 className="flex items-center gap-2 px-2 pb-3 pt-1.5 text-sm font-medium text-ink-100">
                          <s.icone className={cn('h-4 w-4', s.valor === 'andamento' ? 'text-lime' : 'text-ink-500')} />
                          {s.nome}
                          <span className="font-mono text-xs text-ink-500">{daColuna.length}</span>
                          <button
                            onClick={() => novo(s.valor)}
                            className="ml-auto rounded-md p-1 text-ink-500 transition-colors hover:bg-ink-850 hover:text-ink-50"
                            aria-label={`Novo projeto em ${s.nome}`}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </h3>
                        <div className="flex min-h-[120px] flex-col gap-2">
                          <AnimatePresence initial={false}>
                            {daColuna.map((p) => (
                              <ProjectCard key={p.id} projeto={p} onAbrir={abrir} arrastavel onArrastar={setArrastando} />
                            ))}
                          </AnimatePresence>
                          {daColuna.length === 0 && (
                            <p className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-ink-800 px-3 py-6 text-center text-xs text-ink-600">
                              {arrastando ? 'Solte aqui' : 'Vazio'}
                            </p>
                          )}
                        </div>
                      </section>
                    );
                  })}
                </div>
                <p className="mt-2 hidden text-xs text-ink-600 lg:block">Arraste um card para outra coluna para mudar o status.</p>
              </LayoutGroup>
            ) : (
              <LayoutGroup>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <AnimatePresence initial={false}>
                    {filtrados.map((p) => (
                      <ProjectCard key={p.id} projeto={p} onAbrir={abrir} compacto />
                    ))}
                  </AnimatePresence>
                </div>
              </LayoutGroup>
            )}
          </div>
        </>
      )}

      <Dialog
        open={!!dialogo}
        onClose={() => setDialogo(null)}
        title={dialogo?.modo === 'editar' ? 'Editar projeto' : 'Novo projeto'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDialogo(null)}>Cancelar</Button>
            <Button type="submit" form="projeto-form">{dialogo?.modo === 'editar' ? 'Salvar' : 'Criar projeto'}</Button>
          </>
        }
      >
        {dialogo && (
          <ProjectForm
            id="projeto-form"
            criando={dialogo.modo === 'novo'}
            value={dialogo.dados}
            onChange={(dados) => setDialogo((d) => ({ ...d, dados }))}
            onSubmit={salvarDialogo}
          />
        )}
      </Dialog>
    </ModuleFrame>
  );
}
