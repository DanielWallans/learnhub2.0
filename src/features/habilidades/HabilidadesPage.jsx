import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '@/lib/firebase';
import { collection, query, where, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { Plus, Sparkles, Target, Radar as RadarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudent } from '@/context/StudentContext';
import { ModuleFrame } from '@/components/layout/ModuleFrame';
import { Button } from '@/components/ui/button';
import { Field, Select, Textarea, TextField } from '@/components/ui/field';
import { Dialog } from '@/components/ui/dialog';
import { EmptyState, Section, StatRow } from '@/components/ui/primitives';
import { useFeedback } from '@/components/ui/feedback';
import { QuickDelete } from '@/components/ui/quick-delete';
import HabilidadesImg from '@/assets/modules/habilidades.jpg';
import { COL } from '@/lib/collections';
import { categorias, niveis, prazos, calcularDataConclusao, getSkillIcon } from '@/features/habilidades/lib/constants';
import { layoutMapa, useLargura } from '@/features/habilidades/lib/mapa';
import { RadarChart } from '@/features/habilidades/components/RadarChart';
import { SkillDetail } from '@/features/habilidades/components/SkillDetail';

const Habilidades = () => {
  const { user } = useStudent();
  const { toast, confirm } = useFeedback();

  const [habilidades, setHabilidades] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState(null);
  const [detalheMobileAberto, setDetalheMobileAberto] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');

  const [showNewForm, setShowNewForm] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Estudo');
  const [newSkillLevel, setNewSkillLevel] = useState('Iniciante');

  const [editando, setEditando] = useState(null);

  useEffect(() => {
    if (!user) {
      setCarregando(false);
      return undefined;
    }
    const q = query(collection(db, COL.habilidades), where('userId', '==', user.uid));
    return onSnapshot(q, (snapshot) => {
      setHabilidades(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setCarregando(false);
    }, (error) => {
      console.error('Erro ao carregar habilidades:', error);
      setCarregando(false);
    });
  }, [user]);

  useEffect(() => {
    if (!selectedSkillId && habilidades.length > 0) setSelectedSkillId(habilidades[0].id);
  }, [habilidades, selectedSkillId]);

  const atualizarHabilidade = async (id, dados) => {
    try {
      await updateDoc(doc(db, COL.habilidades, id), { ...dados, updatedAt: new Date() });
      return true;
    } catch (error) {
      console.error('Erro ao atualizar habilidade:', error);
      return false;
    }
  };

  const handleCreateSkillSubmit = async (e) => {
    e.preventDefault();
    if (!user || !newSkillName.trim()) return;

    setSalvando(true);
    const dataInicio = new Date().toISOString().split('T')[0];
    const progresso = newSkillLevel === 'Avançado' ? 80 : newSkillLevel === 'Intermediário' ? 45 : 10;

    try {
      const ref = await addDoc(collection(db, COL.habilidades), {
        nome: newSkillName.trim(),
        categoria: newSkillCategory,
        nivel: newSkillLevel,
        descricao: `Desenvolver competências em ${newSkillName.trim()}.`,
        meta: 'Mapear progresso e aplicar no dia a dia.',
        prazo: '1 mês',
        dataInicio,
        dataConclusao: calcularDataConclusao(dataInicio, '1 mês'),
        progresso,
        ativo: true,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      setSelectedSkillId(ref.id);
      setShowNewForm(false);
      setNewSkillName('');
      toast({ title: 'Habilidade adicionada', description: newSkillName.trim(), tone: 'success' });
    } catch (error) {
      toast({ title: 'Não foi possível salvar a habilidade', tone: 'error' });
    }
    setSalvando(false);
  };

  const handleUpdateProgress = async (id, delta) => {
    const skill = habilidades.find((h) => h.id === id);
    if (!skill) return;
    const progresso = Math.max(0, Math.min(100, (skill.progresso || 0) + delta));
    // O nível acompanha o progresso
    const nivel = progresso >= 75 ? 'Avançado' : progresso >= 30 ? 'Intermediário' : 'Iniciante';
    await atualizarHabilidade(id, { progresso, nivel });
  };

  const handleToggleStatus = async (id) => {
    const skill = habilidades.find((h) => h.id === id);
    if (skill) await atualizarHabilidade(id, { ativo: !skill.ativo });
  };

  const handleDeleteSkill = async (id) => {
    const skill = habilidades.find((h) => h.id === id);
    const ok = await confirm({
      title: `Excluir "${skill?.nome || 'habilidade'}"?`,
      description: 'Ela sai do mapa e do radar. Não dá para desfazer.',
      confirmLabel: 'Excluir',
      destructive: true
    });
    if (!ok) return;
    try {
      await deleteDoc(doc(db, COL.habilidades, id));
      if (selectedSkillId === id) setSelectedSkillId(null);
      setDetalheMobileAberto(false);
      toast({ title: 'Habilidade excluída', description: skill?.nome });
    } catch (error) {
      toast({ title: 'Não foi possível excluir', tone: 'error' });
    }
  };

  const abrirEdicao = (skill) => {
    setEditando({
      id: skill.id,
      nome: skill.nome,
      descricao: skill.descricao || '',
      categoria: skill.categoria,
      nivel: skill.nivel,
      meta: skill.meta || '',
      prazo: skill.prazo || '1 mês',
      dataInicio: skill.dataInicio || new Date().toISOString().split('T')[0]
    });
    setDetalheMobileAberto(false);
  };

  const salvarEdicao = async (e) => {
    e.preventDefault();
    if (!editando) return;
    setSalvando(true);
    const { id, ...dados } = editando;
    const ok = await atualizarHabilidade(id, { ...dados, dataConclusao: calcularDataConclusao(dados.dataInicio, dados.prazo) });
    setSalvando(false);
    if (ok) {
      setEditando(null);
      toast({ title: 'Habilidade atualizada', tone: 'success' });
    } else {
      toast({ title: 'Não foi possível salvar', tone: 'error' });
    }
  };

  const selecionar = (id) => {
    setSelectedSkillId(id);
    if (window.matchMedia('(max-width: 1279px)').matches) setDetalheMobileAberto(true);
  };

  const selectedSkill = habilidades.find((h) => h.id === selectedSkillId) || null;

  const habilidadesFiltradas = useMemo(
    () => (filtroCategoria === 'Todas' ? habilidades : habilidades.filter((h) => h.categoria === filtroCategoria)),
    [habilidades, filtroCategoria]
  );

  // Média de progresso das habilidades ativas em cada categoria (0.08 a 1)
  const radarNiveis = useMemo(
    () =>
      categorias.map((cat) => {
        const skills = habilidades.filter((h) => h.categoria === cat && h.ativo);
        if (skills.length === 0) return 0.08;
        const media = skills.reduce((acc, s) => acc + (s.progresso || 0), 0) / skills.length;
        return Math.max(0.08, media / 100);
      }),
    [habilidades]
  );

  const [mapaRef, larguraMapa] = useLargura();
  const mapa = useMemo(() => layoutMapa(habilidadesFiltradas, larguraMapa), [habilidadesFiltradas, larguraMapa]);
  const posicoes = mapa.nodes;

  const dominadas = habilidades.filter((h) => (h.progresso || 0) >= 75).length;
  const ativas = habilidades.filter((h) => h.ativo).length;
  const media = habilidades.length
    ? Math.round(habilidades.reduce((acc, h) => acc + (h.progresso || 0), 0) / habilidades.length)
    : 0;

  const detailProps = {
    onProgress: handleUpdateProgress,
    onToggle: handleToggleStatus,
    onEdit: abrirEdicao,
    onDelete: handleDeleteSkill
  };

  return (
    <ModuleFrame
      id="habilidades"
      index="03"
      image={HabilidadesImg}
      title="Habilidades"
      phrase="Mapeie o que você está aprendendo, quanto já domina e o próximo passo de cada coisa."
      cta="Abrir meu mapa"
      stats={[
        { label: 'Habilidades', value: habilidades.length },
        { label: 'Dominadas', value: dominadas },
        { label: 'Média', value: `${media}%` }
      ]}
      actions={<Button onClick={() => setShowNewForm(true)}><Plus /> Nova habilidade</Button>}
    >
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-12">
          <StatRow
            items={[
              { label: 'Cadastradas', value: habilidades.length },
              { label: 'Ativas', value: ativas },
              { label: 'Dominadas', value: dominadas, hint: '75% ou mais', accent: dominadas > 0 },
              { label: 'Domínio médio', value: `${media}%` }
            ]}
          />

          <div className="grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-12 lg:grid-cols-[280px_minmax(0,1fr)]">
            <Section title="Radar" icon={RadarIcon} description="Média das habilidades ativas">
              <RadarChart niveis={radarNiveis} />
            </Section>

            <Section title="Mapa" description="Toque numa habilidade para ver os detalhes">
              <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
                {['Todas', ...categorias].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFiltroCategoria(cat)}
                    className={cn(
                      'whitespace-nowrap rounded-full border px-3 py-1 text-xs transition-colors [@media(pointer:coarse)]:px-4 [@media(pointer:coarse)]:py-2',
                      filtroCategoria === cat ? 'border-ink-50 bg-ink-50 text-ink-950' : 'border-ink-700 text-ink-300 hover:border-ink-500 hover:text-ink-50'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {carregando ? null : habilidades.length === 0 ? (
                <EmptyState
                  className="mt-4 flex-1"
                  icon={Sparkles}
                  title="Seu mapa está vazio"
                  description="Adicione a primeira habilidade que você quer desenvolver."
                  action={<Button onClick={() => setShowNewForm(true)}><Plus /> Nova habilidade</Button>}
                />
              ) : (
                <div
                  ref={mapaRef}
                  style={{ height: mapa.altura }}
                  className="relative mt-4 overflow-hidden rounded-xl bg-ink-900/40 bg-[radial-gradient(#26262D_1px,transparent_1px)] transition-[height] duration-300 [background-size:18px_18px]"
                >
                  {/* Rótulos dos grupos */}
                  {mapa.labels.map(({ cat, x, y }) => (
                    <span
                      key={cat}
                      className={cn(
                        'pointer-events-none absolute -translate-x-1/2 font-mono text-[10px] uppercase tracking-wider transition-opacity',
                        filtroCategoria === 'Todas' || filtroCategoria === cat ? 'text-ink-500' : 'opacity-0'
                      )}
                      style={{ left: x, top: y }}
                    >
                      {cat}
                    </span>
                  ))}

                  {/* Ligações entre habilidades da mesma categoria */}
                  <svg className="pointer-events-none absolute inset-0 h-full w-full">
                    {categorias.flatMap((cat) => {
                      const sibs = habilidadesFiltradas.filter((h) => h.categoria === cat);
                      return sibs.slice(1).map((s, i) => {
                        const a = posicoes[sibs[i].id];
                        const b = posicoes[s.id];
                        if (!a || !b) return null;
                        const forte = (sibs[i].progresso || 0) >= 75 && (s.progresso || 0) >= 75;
                        return (
                          <line
                            key={`${sibs[i].id}-${s.id}`}
                            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                            stroke={forte ? '#C6F432' : '#4A4A54'}
                            strokeOpacity={forte ? 0.5 : 0.6}
                            strokeWidth="1"
                            strokeDasharray={forte ? 'none' : '3 4'}
                          />
                        );
                      });
                    })}
                  </svg>

                  <AnimatePresence>
                    {habilidadesFiltradas.map((skill, i) => {
                      const pos = posicoes[skill.id];
                      if (!pos) return null;
                      const Icon = getSkillIcon(skill.nome);
                      const ativo = selectedSkillId === skill.id;
                      const dominada = (skill.progresso || 0) >= 75;
                      return (
                        <motion.div
                          key={skill.id}
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: skill.ativo ? 1 : 0.5, scale: 1, left: pos.x, top: pos.y }}
                          exit={{ opacity: 0, scale: 0.4, filter: 'blur(4px)' }}
                          transition={{ type: 'spring', stiffness: 220, damping: 22, delay: i * 0.02 }}
                          whileHover={{ scale: 1.06 }}
                          style={{ x: '-50%', y: '-50%' }}
                          className="group absolute"
                        >
                          <button
                            onClick={() => selecionar(skill.id)}
                            className={cn(
                              'flex max-w-[150px] items-center gap-1.5 rounded-full border py-1 pl-1 pr-3 text-xs transition-colors [@media(pointer:coarse)]:py-1.5',
                              ativo
                                ? 'border-ink-50 bg-ink-50 text-ink-950'
                                : dominada
                                  ? 'border-lime/40 bg-ink-900 text-ink-50'
                                  : 'border-ink-700 bg-ink-900 text-ink-200 hover:border-ink-500'
                            )}
                          >
                            <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full', dominada ? 'bg-lime text-ink-950' : ativo ? 'bg-ink-950 text-ink-50' : 'bg-ink-800')}>
                              <Icon className="h-3 w-3" />
                            </span>
                            <span className="truncate">{skill.nome}</span>
                            <span className={cn('font-mono text-[10px]', ativo ? 'text-ink-600' : 'text-ink-500')}>{skill.progresso || 0}</span>
                          </button>
                          <QuickDelete
                            label={`Excluir ${skill.nome}`}
                            onClick={() => handleDeleteSkill(skill.id)}
                            className="absolute -right-2 -top-2"
                          />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </Section>
          </div>
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto border-l border-ink-800 pl-6 pr-2">
            {selectedSkill ? (
              <SkillDetail skill={selectedSkill} {...detailProps} />
            ) : (
              <EmptyState className="border-0" icon={Target} title="Nenhuma habilidade selecionada" description="Escolha uma no mapa para ver detalhes e dicas." />
            )}
          </div>
        </aside>
      </div>

      <Dialog open={detalheMobileAberto && !!selectedSkill} onClose={() => setDetalheMobileAberto(false)} title="Habilidade">
        {selectedSkill && <SkillDetail skill={selectedSkill} {...detailProps} />}
      </Dialog>

      {/* Nova habilidade */}
      <Dialog
        open={showNewForm}
        onClose={() => setShowNewForm(false)}
        title="Nova habilidade"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowNewForm(false)}>Cancelar</Button>
            <Button type="submit" form="nova-habilidade" loading={salvando}>Adicionar</Button>
          </>
        }
      >
        <form id="nova-habilidade" onSubmit={handleCreateSkillSubmit} className="flex flex-col gap-4">
          <TextField label="Nome" placeholder="React Native, inglês, corrida..." value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} autoFocus required />
          <Field label="Categoria">
            <Select value={newSkillCategory} onChange={(e) => setNewSkillCategory(e.target.value)}>
              {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Nível atual" hint="Define o progresso inicial: 10%, 45% ou 80%.">
            <Select value={newSkillLevel} onChange={(e) => setNewSkillLevel(e.target.value)}>
              {niveis.map((n) => <option key={n} value={n}>{n}</option>)}
            </Select>
          </Field>
        </form>
      </Dialog>

      {/* Edição */}
      <Dialog
        open={!!editando}
        onClose={() => setEditando(null)}
        title="Editar habilidade"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditando(null)}>Cancelar</Button>
            <Button type="submit" form="editar-habilidade" loading={salvando}>Salvar</Button>
          </>
        }
      >
        {editando && (
          <form id="editar-habilidade" onSubmit={salvarEdicao} className="grid gap-4 sm:grid-cols-2">
            <TextField className="sm:col-span-2" label="Nome" value={editando.nome} onChange={(e) => setEditando({ ...editando, nome: e.target.value })} required />
            <Field label="Descrição" className="sm:col-span-2">
              <Textarea value={editando.descricao} onChange={(e) => setEditando({ ...editando, descricao: e.target.value })} />
            </Field>
            <Field label="Categoria">
              <Select value={editando.categoria} onChange={(e) => setEditando({ ...editando, categoria: e.target.value })}>
                {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Nível">
              <Select value={editando.nivel} onChange={(e) => setEditando({ ...editando, nivel: e.target.value })}>
                {niveis.map((n) => <option key={n} value={n}>{n}</option>)}
              </Select>
            </Field>
            <TextField className="sm:col-span-2" label="Meta" value={editando.meta} onChange={(e) => setEditando({ ...editando, meta: e.target.value })} />
            <Field label="Prazo">
              <Select value={editando.prazo} onChange={(e) => setEditando({ ...editando, prazo: e.target.value })}>
                {prazos.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </Field>
            <TextField label="Início" type="date" value={editando.dataInicio} onChange={(e) => setEditando({ ...editando, dataInicio: e.target.value })} />
          </form>
        )}
      </Dialog>
    </ModuleFrame>
  );
};

export default Habilidades;
