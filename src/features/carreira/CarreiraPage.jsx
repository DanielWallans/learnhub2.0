import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Target, Briefcase, Pencil, Trash2, Plus, Check, Globe, ExternalLink, MapPin, Wallet, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudent } from '@/context/StudentContext';
import { ModuleFrame } from '@/components/layout/ModuleFrame';
import { Button } from '@/components/ui/button';
import { Field, Select, Textarea, TextField } from '@/components/ui/field';
import { Dialog } from '@/components/ui/dialog';
import { Badge, EmptyState, Section, StatRow } from '@/components/ui/primitives';
import { useFeedback } from '@/components/ui/feedback';
import { QuickDelete } from '@/components/ui/quick-delete';
import CarreiraImg from '@/assets/modules/carreira.jpg';
import { COL } from '@/lib/collections';
import { FLOW_STAGES, STAGE_LABEL, TIPOS_META, tipoMeta, VAGA_VAZIA, META_VAZIA, duracaoTexto, detalheMeta } from '@/features/carreira/lib/constants';
import { VagaForm } from '@/features/carreira/components/VagaForm';
import { StageTracker } from '@/features/carreira/components/StageTracker';

export default function ModuloCarreira() {
  const { user } = useStudent();
  const { toast, confirm } = useFeedback();

  const [metas, setMetas] = useState([]);
  const [candidaturas, setCandidaturas] = useState([]);
  const [selectedCandidaturaId, setSelectedCandidaturaId] = useState('');

  const [vagaDialog, setVagaDialog] = useState(null); // { modo: 'nova' | 'editar', dados }
  const [metaDialog, setMetaDialog] = useState(null); // dados da meta em edição (com id opcional)
  const [notesText, setNotesText] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const selectedCandidatura = useMemo(
    () => candidaturas.find((c) => c.id === selectedCandidaturaId) || null,
    [candidaturas, selectedCandidaturaId]
  );

  useEffect(() => {
    setNotesText(selectedCandidatura?.observacoes || '');
  }, [selectedCandidaturaId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Metas e candidaturas em tempo real
  useEffect(() => {
    if (!user) return undefined;
    const unsubMetas = onSnapshot(
      query(collection(db, COL.carreiraMetas), where('userId', '==', user.uid)),
      (snapshot) => setMetas(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error('Erro nas metas:', err)
    );
    const unsubCand = onSnapshot(
      query(collection(db, COL.candidaturas), where('userId', '==', user.uid)),
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => (b.dataEnvio || '').localeCompare(a.dataEnvio || ''));
        setCandidaturas(data);
        setSelectedCandidaturaId((atual) => (atual && data.some((c) => c.id === atual) ? atual : data[0]?.id || ''));
      },
      (err) => console.error('Erro nas candidaturas:', err)
    );
    return () => {
      unsubMetas();
      unsubCand();
    };
  }, [user]);

  // Candidaturas
  const salvarVaga = async (e) => {
    e.preventDefault();
    const { modo, dados } = vagaDialog;
    if (!dados.empresa || !dados.vaga) return;
    try {
      if (modo === 'nova') {
        const ref = await addDoc(collection(db, COL.candidaturas), {
          ...dados,
          fase: 'enviado',
          dataEnvio: new Date().toISOString(),
          userId: user.uid
        });
        setSelectedCandidaturaId(ref.id);
        toast({ title: 'Candidatura adicionada', description: `${dados.vaga} · ${dados.empresa}`, tone: 'success' });
      } else {
        await updateDoc(doc(db, COL.candidaturas, selectedCandidatura.id), dados);
        setNotesText(dados.observacoes || '');
        toast({ title: 'Candidatura atualizada', tone: 'success' });
      }
      setVagaDialog(null);
    } catch (err) {
      console.error('Erro ao salvar candidatura:', err);
      toast({ title: 'Não foi possível salvar', tone: 'error' });
    }
  };

  const editarVaga = () => {
    if (!selectedCandidatura) return;
    const dados = Object.fromEntries(Object.keys(VAGA_VAZIA).map((k) => [k, selectedCandidatura[k] || VAGA_VAZIA[k]]));
    setVagaDialog({ modo: 'editar', dados });
  };

  const handleUpdateCandidacyStage = async (id, fase) => {
    try {
      await updateDoc(doc(db, COL.candidaturas, id), { fase });
    } catch (err) {
      toast({ title: 'Não foi possível mudar a etapa', tone: 'error' });
    }
  };

  const handleDeleteCandidacy = async (id) => {
    const cand = candidaturas.find((c) => c.id === id);
    const ok = await confirm({
      title: `Excluir "${cand?.vaga || 'candidatura'}"?`,
      description: 'O processo e as anotações dele serão apagados.',
      confirmLabel: 'Excluir',
      destructive: true
    });
    if (!ok) return;
    try {
      await deleteDoc(doc(db, COL.candidaturas, id));
      if (id === selectedCandidaturaId) setSelectedCandidaturaId('');
      toast({ title: 'Candidatura excluída', description: cand ? `${cand.vaga} · ${cand.empresa}` : undefined });
    } catch (err) {
      toast({ title: 'Não foi possível excluir', tone: 'error' });
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedCandidatura) return;
    setIsSavingNotes(true);
    try {
      await updateDoc(doc(db, COL.candidaturas, selectedCandidatura.id), { observacoes: notesText });
      toast({ title: 'Anotações salvas', tone: 'success' });
    } catch (error) {
      toast({ title: 'Não foi possível salvar', tone: 'error' });
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Metas
  const handleSaveGoal = async (e) => {
    e.preventDefault();
    const goal = metaDialog;
    let texto = goal.valorObjetivo || 'Objetivo indefinido';
    if (goal.tipo === 'tempo') texto = `${goal.valorObjetivo || 'Meta'} (Duração: ${duracaoTexto(goal.valorTempo)})`;

    const payload = {
      tipo: goal.tipo,
      texto,
      valorTempo: goal.valorTempo || META_VAZIA.valorTempo,
      valorObjetivo: goal.valorObjetivo || '',
      plataforma: goal.plataforma || '',
      instituicao: goal.instituicao || '',
      dataAlvo: goal.dataAlvo || '',
      tecnologias: goal.tecnologias || '',
      idiomaNivel: goal.idiomaNivel || '',
      detalhesNetworking: goal.detalhesNetworking || '',
      concluida: goal.concluida || false
    };

    try {
      if (goal.id) await updateDoc(doc(db, COL.carreiraMetas, goal.id), payload);
      else await addDoc(collection(db, COL.carreiraMetas), { ...payload, userId: user.uid });
      setMetaDialog(null);
    } catch (err) {
      toast({ title: 'Não foi possível salvar a meta', tone: 'error' });
    }
  };

  const handleDeleteGoal = async (goalId) => {
    const ok = await confirm({ title: 'Excluir meta?', confirmLabel: 'Excluir', destructive: true });
    if (ok) await deleteDoc(doc(db, COL.carreiraMetas, goalId));
  };

  const handleToggleGoalComplete = (goal) => updateDoc(doc(db, COL.carreiraMetas, goal.id), { concluida: !goal.concluida });

  const setMeta = (k) => (e) => setMetaDialog({ ...metaDialog, [k]: e.target.value });
  const setTempo = (k) => (e) => setMetaDialog({ ...metaDialog, valorTempo: { ...metaDialog.valorTempo, [k]: e.target.value } });

  const contagemFases = useMemo(() => {
    const c = { enviado: 0, prova: 0, entrevista: 0, aprovado: 0, reprovado: 0 };
    candidaturas.forEach((x) => { c[x.fase] = (c[x.fase] || 0) + 1; });
    return c;
  }, [candidaturas]);

  const metasConcluidas = metas.filter((m) => m.concluida).length;

  return (
    <ModuleFrame
      id="carreira"
      index="04"
      image={CarreiraImg}
      title="Carreira"
      phrase="Cada vaga numa etapa, cada meta com prazo. O próximo degrau fica sempre à vista."
      cta="Abrir minha carreira"
      stats={[
        { label: 'Candidaturas', value: candidaturas.length },
        { label: 'Em entrevista', value: contagemFases.entrevista },
        { label: 'Metas concluídas', value: `${metasConcluidas}/${metas.length}` }
      ]}
      actions={
        <>
          <Button variant="outline" onClick={() => setMetaDialog({ ...META_VAZIA })}><Target /> Nova meta</Button>
          <Button onClick={() => setVagaDialog({ modo: 'nova', dados: { ...VAGA_VAZIA } })}><Plus /> Nova candidatura</Button>
        </>
      }
    >
      {/* Funil */}
      <StatRow
        className="grid-cols-3 sm:grid-cols-5"
        items={[...FLOW_STAGES.map((s) => s.key), 'reprovado'].map((k) => ({
          label: STAGE_LABEL[k],
          value: contagemFases[k] || 0,
          accent: k === 'aprovado' && contagemFases.aprovado > 0
        }))}
      />

      <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-12 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Candidaturas */}
        <Section title="Candidaturas" description={`${candidaturas.length} no total`}>
          {candidaturas.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="Nenhuma candidatura ainda"
              description="Registre as vagas em que você se inscreveu e acompanhe cada etapa até a proposta."
              action={<Button onClick={() => setVagaDialog({ modo: 'nova', dados: { ...VAGA_VAZIA } })}><Plus /> Nova candidatura</Button>}
            />
          ) : (
            <div className="grid md:grid-cols-[220px_minmax(0,1fr)]">
              <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-3 md:mx-0 md:max-h-[640px] md:flex-col md:gap-1 md:overflow-y-auto md:border-r md:border-ink-800 md:px-0 md:pb-0 md:pr-4">
                {candidaturas.map((c) => {
                  const ativo = c.id === selectedCandidaturaId;
                  return (
                    <li key={c.id} className="group relative shrink-0 md:shrink">
                      <QuickDelete
                        label={`Excluir ${c.vaga}`}
                        onClick={() => handleDeleteCandidacy(c.id)}
                        className="absolute right-2 top-2 z-10"
                      />
                      <button
                        onClick={() => setSelectedCandidaturaId(c.id)}
                        className={cn(
                          'relative w-48 rounded-lg px-3 py-2.5 text-left transition-colors md:w-full',
                          ativo ? 'bg-ink-800' : 'hover:bg-ink-850'
                        )}
                      >
                        {ativo && <motion.span layoutId="cand-ativa" className="absolute inset-y-2 left-0 w-[3px] rounded-r bg-lime" />}
                        <p className="truncate pr-5 text-sm text-ink-50">{c.vaga}</p>
                        <p className="truncate text-xs text-ink-400">{c.empresa}</p>
                        <p className={cn('mt-1.5 font-mono text-[10px] uppercase tracking-wider', c.fase === 'aprovado' ? 'text-lime' : 'text-ink-500')}>
                          {STAGE_LABEL[c.fase] || 'Inscrição'}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <AnimatePresence mode="wait">
                {selectedCandidatura && (
                  <motion.div
                    key={selectedCandidatura.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-8 pt-4 md:pl-8 md:pt-0"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm text-ink-400">{selectedCandidatura.empresa}</p>
                        <h2 className="mt-0.5 text-2xl font-semibold tracking-[-0.03em] text-ink-50">{selectedCandidatura.vaga}</h2>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <Badge><Briefcase /> {selectedCandidatura.tipoVaga || 'Estágio'}</Badge>
                          <Badge><Globe /> {selectedCandidatura.modalidade || 'Remoto'}</Badge>
                          {selectedCandidatura.localizacao && <Badge><MapPin /> {selectedCandidatura.localizacao}</Badge>}
                          {selectedCandidatura.salario && <Badge tone="accent"><Wallet /> {selectedCandidatura.salario}</Badge>}
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        {selectedCandidatura.linkVaga && (
                          <a
                            href={selectedCandidatura.linkVaga}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-ink-700 px-3 text-xs text-ink-100 transition-colors hover:border-ink-500"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> Vaga
                          </a>
                        )}
                        <Button variant="outline" size="sm" onClick={editarVaga}><Pencil /> Editar</Button>
                        <Button variant="danger" size="icon-sm" onClick={() => handleDeleteCandidacy(selectedCandidatura.id)} aria-label="Excluir candidatura"><Trash2 /></Button>
                      </div>
                    </div>

                    <StageTracker fase={selectedCandidatura.fase} onChange={(f) => handleUpdateCandidacyStage(selectedCandidatura.id, f)} />

                    {selectedCandidatura.requisitos && (
                      <div>
                        <h3 className="mb-2 text-sm font-medium text-ink-50">Requisitos</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedCandidatura.requisitos.split(/[,;]/).map((r) => r.trim()).filter(Boolean).map((r) => (
                            <Badge key={r} tone="muted">{r}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="flex items-center gap-1.5 text-sm font-medium text-ink-50"><FileText className="h-4 w-4 text-ink-400" /> Anotações</h3>
                        {notesText !== (selectedCandidatura.observacoes || '') && (
                          <Button size="sm" variant="secondary" onClick={handleSaveNotes} loading={isSavingNotes}>Salvar</Button>
                        )}
                      </div>
                      <Textarea
                        rows={5}
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        placeholder="Datas de entrevista, contato do recrutador, feedback..."
                      />
                      {selectedCandidatura.dataEnvio && (
                        <p className="mt-2 font-mono text-[11px] text-ink-500">
                          Inscrição em {new Date(selectedCandidatura.dataEnvio).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </Section>

        {/* Metas */}
        <Section
          title="Metas de carreira"
          description={metas.length ? `${metasConcluidas} de ${metas.length} concluídas` : 'Defina onde quer chegar'}
          action={<Button variant="ghost" size="icon-sm" onClick={() => setMetaDialog({ ...META_VAZIA })} aria-label="Nova meta"><Plus /></Button>}
        >
          {metas.length > 0 && (
            <div className="h-1 overflow-hidden rounded-full bg-ink-800">
              <motion.div className="h-full bg-lime" animate={{ width: `${(metasConcluidas / metas.length) * 100}%` }} />
            </div>
          )}
          <ul className="mt-4 flex flex-col gap-1">
            {metas.length === 0 && (
              <EmptyState
                icon={Target}
                title="Sem metas"
                description="Curso, certificação, idioma, projeto... escolha o tipo e acompanhe."
                action={<Button size="sm" onClick={() => setMetaDialog({ ...META_VAZIA })}><Plus /> Nova meta</Button>}
              />
            )}
            <AnimatePresence initial={false}>
              {metas.map((goal) => {
                const tipo = tipoMeta(goal.tipo);
                const Icon = tipo.icon;
                const detalhe = detalheMeta(goal);
                return (
                  <motion.li
                    key={goal.id}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-ink-850"
                  >
                    <button
                      onClick={() => handleToggleGoalComplete(goal)}
                      className={cn(
                        'relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors before:absolute before:-inset-2 before:content-[""] [@media(pointer:coarse)]:h-6 [@media(pointer:coarse)]:w-6',
                        goal.concluida ? 'border-lime bg-lime text-ink-950' : 'border-ink-600 hover:border-ink-400'
                      )}
                      aria-label={goal.concluida ? 'Marcar como pendente' : 'Marcar como concluída'}
                    >
                      {goal.concluida && <Check className="h-3 w-3" strokeWidth={3} />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={cn('text-sm', goal.concluida ? 'text-ink-500 line-through' : 'text-ink-50')}>
                        {goal.valorObjetivo || goal.texto}
                      </p>
                      <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-ink-500">
                        <Icon className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {tipo.label}
                          {detalhe && ` · ${detalhe}`}
                        </span>
                      </p>
                    </div>
                    <div className="flex opacity-0 transition-opacity group-hover:opacity-100 [@media(hover:none)]:opacity-100">
                      <button onClick={() => setMetaDialog({ ...META_VAZIA, ...goal })} className="rounded p-1 text-ink-500 hover:text-ink-50 [@media(pointer:coarse)]:p-2.5" aria-label="Editar meta">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDeleteGoal(goal.id)} className="rounded p-1 text-ink-500 hover:text-ink-50 [@media(pointer:coarse)]:p-2.5" aria-label="Excluir meta">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </Section>
      </div>

      {/* Candidatura: nova / editar */}
      <Dialog
        open={!!vagaDialog}
        onClose={() => setVagaDialog(null)}
        title={vagaDialog?.modo === 'editar' ? 'Editar candidatura' : 'Nova candidatura'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setVagaDialog(null)}>Cancelar</Button>
            <Button type="submit" form="vaga-form">{vagaDialog?.modo === 'editar' ? 'Salvar alterações' : 'Adicionar'}</Button>
          </>
        }
      >
        {vagaDialog && (
          <VagaForm id="vaga-form" value={vagaDialog.dados} onChange={(dados) => setVagaDialog({ ...vagaDialog, dados })} onSubmit={salvarVaga} />
        )}
      </Dialog>

      {/* Meta: nova / editar */}
      <Dialog
        open={!!metaDialog}
        onClose={() => setMetaDialog(null)}
        title={metaDialog?.id ? 'Editar meta' : 'Nova meta'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setMetaDialog(null)}>Cancelar</Button>
            <Button type="submit" form="meta-form">Salvar meta</Button>
          </>
        }
      >
        {metaDialog && (
          <form id="meta-form" onSubmit={handleSaveGoal} className="flex flex-col gap-4">
            <Field label="Tipo">
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {TIPOS_META.map((t) => {
                  const Icon = t.icon;
                  const ativo = metaDialog.tipo === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setMetaDialog({ ...metaDialog, tipo: t.value })}
                      className={cn(
                        'flex flex-col items-start gap-2 rounded-lg border p-2.5 text-left text-xs transition-colors',
                        ativo ? 'border-ink-50 bg-ink-50 text-ink-950' : 'border-ink-700 text-ink-300 hover:border-ink-500'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </Field>
            <TextField label="Meta" placeholder="Aprender React, passar no TOEFL..." value={metaDialog.valorObjetivo} onChange={setMeta('valorObjetivo')} required />

            {metaDialog.tipo === 'tempo' && (
              <Field label="Estudar por">
                <div className="grid grid-cols-3 gap-2">
                  <Select value={metaDialog.valorTempo?.anos || '0'} onChange={setTempo('anos')}>
                    {[0, 1, 2, 3, 4, 5].map((y) => <option key={y} value={y}>{y} {y === 1 ? 'ano' : 'anos'}</option>)}
                  </Select>
                  <Select value={metaDialog.valorTempo?.meses || '0'} onChange={setTempo('meses')}>
                    {Array.from({ length: 12 }, (_, m) => <option key={m} value={m}>{m} {m === 1 ? 'mês' : 'meses'}</option>)}
                  </Select>
                  <Select value={metaDialog.valorTempo?.dias || '0'} onChange={setTempo('dias')}>
                    {[0, 5, 10, 15, 20, 25].map((d) => <option key={d} value={d}>{d} dias</option>)}
                  </Select>
                </div>
              </Field>
            )}
            {(metaDialog.tipo === 'estudo' || metaDialog.tipo === 'projeto') && (
              <TextField label="Tecnologias" placeholder="TypeScript, Docker..." value={metaDialog.tecnologias} onChange={setMeta('tecnologias')} />
            )}
            {metaDialog.tipo === 'curso' && (
              <TextField label="Plataforma ou escola" placeholder="Alura, Udemy, Coursera..." value={metaDialog.plataforma} onChange={setMeta('plataforma')} />
            )}
            {metaDialog.tipo === 'certificacao' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Emissor" placeholder="AWS, Google, Scrum..." value={metaDialog.instituicao} onChange={setMeta('instituicao')} />
                <TextField label="Data limite" type="date" value={metaDialog.dataAlvo} onChange={setMeta('dataAlvo')} />
              </div>
            )}
            {metaDialog.tipo === 'idioma' && (
              <TextField label="Nível desejado" placeholder="Inglês B2, fluência..." value={metaDialog.idiomaNivel} onChange={setMeta('idiomaNivel')} />
            )}
            {metaDialog.tipo === 'networking' && (
              <TextField label="Foco" placeholder="Eventos, LinkedIn, pessoas..." value={metaDialog.detalhesNetworking} onChange={setMeta('detalhesNetworking')} />
            )}
          </form>
        )}
      </Dialog>
    </ModuleFrame>
  );
}
