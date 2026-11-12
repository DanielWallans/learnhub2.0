import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Search, BookOpen, X, Plus, Bookmark, Heart, LayoutGrid, List, Upload, Library } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudent } from '@/context/StudentContext';
import { ModuleFrame } from '@/components/layout/ModuleFrame';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea, TextField } from '@/components/ui/field';
import { Dialog } from '@/components/ui/dialog';
import { Badge, EmptyState, Progress, Segmented } from '@/components/ui/primitives';
import { Spinner } from '@/components/ui/spinner';
import { useFeedback } from '@/components/ui/feedback';
import { QuickDelete } from '@/components/ui/quick-delete';
import BibliotecaImg from '@/assets/modules/biblioteca.jpg';
import { COL } from '@/lib/collections';
import { LIVRO_VAZIO, categorias, tipos, statusLeitura, statusTone, calcularProgresso } from '@/features/leitura/lib/constants';
import { buscarCapaPorTitulo, buscarLivros } from '@/features/leitura/lib/busca';
import { Cover } from '@/features/leitura/components/BookCover';
import { Stars } from '@/features/leitura/components/Stars';
import { BookDetail } from '@/features/leitura/components/BookDetail';

const Leitura = () => {
  const { user } = useStudent();
  const { toast, confirm } = useFeedback();

  const [livros, setLivros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [livroEditando, setLivroEditando] = useState(null);
  const [livroSelecionadoId, setLivroSelecionadoId] = useState(null);
  const [detalheMobileAberto, setDetalheMobileAberto] = useState(false);

  const [termoBusca, setTermoBusca] = useState('');
  const [resultadosBusca, setResultadosBusca] = useState([]);
  const [buscando, setBuscando] = useState(false);

  const [secaoAtiva, setSecaoAtiva] = useState('library'); // library | favourites
  const [novoLivro, setNovoLivro] = useState(LIVRO_VAZIO);
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [modoVisualizacao, setModoVisualizacao] = useState('grid');

  // Debounce da busca de livros
  useEffect(() => {
    const t = setTimeout(() => {
      if (termoBusca.trim().length > 2) {
        buscarLivrosAPI(termoBusca);
      } else {
        setResultadosBusca([]);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [termoBusca]);

  const buscarLivrosAPI = async (q) => {
    setBuscando(true);

    setResultadosBusca(await buscarLivros(q));
    setBuscando(false);
  };

  // Livros do Firestore em tempo real
  useEffect(() => {
    if (!user) {
      setCarregando(false);
      return undefined;
    }
    const q = query(collection(db, COL.leitura), where('userId', '==', user.uid));
    return onSnapshot(q, (snapshot) => {
      setLivros(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setCarregando(false);
    });
  }, [user]);

  useEffect(() => {
    if (livros.length > 0 && !livroSelecionadoId) {
      setLivroSelecionadoId(livros[0].id);
    }
  }, [livros, livroSelecionadoId]);

  const livroAtivo = livros.find(l => l.id === livroSelecionadoId) || (livros.length > 0 ? livros[0] : null);

  const salvarLivroFirebase = async (livroData) => {
    const ref = await addDoc(collection(db, COL.leitura), {
      ...livroData,
      userId: user.uid,
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    });
    setLivroSelecionadoId(ref.id);
  };

  const atualizarLivroFirebase = async (id, livroData) => {
    await updateDoc(doc(db, COL.leitura, id), {
      ...livroData,
      dataAtualizacao: new Date().toISOString()
    });
  };

  const cancelarEdicao = () => {
    setModoEdicao(false);
    setLivroEditando(null);
    setNovoLivro(LIVRO_VAZIO);
  };

  const fecharFormulario = () => {
    setMostrarFormulario(false);
    cancelarEdicao();
  };

  const adicionarLivro = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSalvando(true);
    try {
      let capaFinal = novoLivro.capa || '';

      // Sem capa (ou com link que não é imagem): tenta achar pelo título
      const isUrlBase64 = capaFinal.startsWith('data:image/');
      const isDirectImageLink = capaFinal.match(/\.(jpeg|jpg|gif|png|webp)/i) ||
        capaFinal.includes('google.com') ||
        capaFinal.includes('openlibrary.org') ||
        capaFinal.includes('googleapis.com');

      if (!capaFinal || (!isUrlBase64 && !isDirectImageLink)) {
        capaFinal = (await buscarCapaPorTitulo(novoLivro.titulo)) || '';
      }

      const livroData = {
        ...novoLivro,
        capa: capaFinal,
        paginasTotal: parseInt(novoLivro.paginasTotal) || 0,
        paginasLidas: parseInt(novoLivro.paginasLidas) || 0,
        avaliacao: parseInt(novoLivro.avaliacao) || 0,
        anotacoes: novoLivro.anotacoes || []
      };
      delete livroData.id;

      if (modoEdicao && livroEditando) {
        await atualizarLivroFirebase(livroEditando.id, livroData);
        toast({ title: 'Livro atualizado', tone: 'success' });
      } else {
        await salvarLivroFirebase(livroData);
        toast({ title: 'Livro adicionado à estante', description: livroData.titulo, tone: 'success' });
      }
      fecharFormulario();
    } catch (error) {
      console.error('Erro ao salvar livro:', error);
      toast({ title: 'Não foi possível salvar', description: 'Tente novamente.', tone: 'error' });
    } finally {
      setSalvando(false);
    }
  };

  const iniciarEdicao = (livro) => {
    setLivroEditando(livro);
    setNovoLivro({ ...LIVRO_VAZIO, ...livro });
    setModoEdicao(true);
    setDetalheMobileAberto(false);
    setMostrarFormulario(true);
  };

  const removerLivro = async (id) => {
    const livro = livros.find((l) => l.id === id);
    const ok = await confirm({
      title: `Remover "${livro?.titulo || 'livro'}"?`,
      description: 'O livro e as anotações dele saem da sua estante. Não dá para desfazer.',
      confirmLabel: 'Remover',
      destructive: true
    });
    if (!ok) return;
    try {
      await deleteDoc(doc(db, COL.leitura, id));
      if (livroSelecionadoId === id) setLivroSelecionadoId(null);
      setDetalheMobileAberto(false);
      toast({ title: 'Livro removido', description: livro?.titulo });
    } catch (error) {
      toast({ title: 'Não foi possível remover', tone: 'error' });
    }
  };

  const alternarFavorito = async (e, id, estadoAtual) => {
    e.stopPropagation();
    try {
      await atualizarLivroFirebase(id, { favorito: !estadoAtual });
    } catch (error) {
      console.error('Erro ao alternar favorito:', error);
    }
  };

  const selecionarLivroParaAdicionar = (livroInfo) => {
    const cat = categorias.find(c => c.toLowerCase() === (livroInfo.categoria || '').toLowerCase()) || 'Ficção';
    setNovoLivro({
      ...LIVRO_VAZIO,
      titulo: livroInfo.titulo,
      autor: livroInfo.autor,
      categoria: cat,
      descricao: livroInfo.descricao || '',
      paginasTotal: livroInfo.paginasTotal || '',
      dataInicio: new Date().toISOString().split('T')[0],
      capa: livroInfo.capa
    });
    setModoEdicao(false);
    setMostrarFormulario(true);
    setTermoBusca('');
    setResultadosBusca([]);
  };

  const handleUploadImagemCapa = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      toast({ title: 'Imagem muito grande', description: 'Escolha uma imagem com menos de 1,5 MB.', tone: 'error' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setNovoLivro(prev => ({ ...prev, capa: reader.result }));
    reader.readAsDataURL(file);
  };

  const atualizarProgresso = async (id, novasPaginas) => {
    const livro = livros.find(l => l.id === id);
    if (!livro) return;

    const paginasLidas = Math.max(0, Math.min(novasPaginas, livro.paginasTotal));
    let novoStatus = livro.status;
    if (paginasLidas === 0) {
      novoStatus = 'Não Iniciado';
    } else if (paginasLidas === livro.paginasTotal && livro.paginasTotal > 0) {
      novoStatus = 'Concluído';
    } else if (livro.status === 'Não Iniciado' || livro.status === 'Concluído') {
      novoStatus = 'Lendo';
    }

    try {
      await atualizarLivroFirebase(id, {
        paginasLidas,
        status: novoStatus,
        ...(novoStatus === 'Concluído' && !livro.dataTermino ? { dataTermino: new Date().toISOString().split('T')[0] } : {})
      });
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
    }
  };

  const atualizarCapitulo = async (id, capituloAtual) => {
    try {
      await atualizarLivroFirebase(id, { capituloAtual });
    } catch (error) {
      console.error('Erro ao atualizar capítulo:', error);
    }
  };

  const atualizarStatusDireto = async (id, novoStatus) => {
    const livro = livros.find(l => l.id === id);
    if (!livro) return;

    let paginasLidas = livro.paginasLidas;
    if (novoStatus === 'Concluído') paginasLidas = livro.paginasTotal;
    else if (novoStatus === 'Não Iniciado') paginasLidas = 0;

    try {
      await atualizarLivroFirebase(id, {
        status: novoStatus,
        paginasLidas,
        ...(novoStatus === 'Concluído' && !livro.dataTermino ? { dataTermino: new Date().toISOString().split('T')[0] } : {})
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const atualizarAvaliacao = async (id, avaliacao) => {
    try {
      await atualizarLivroFirebase(id, { avaliacao });
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
    }
  };

  const salvarAnotacao = async ({ texto, capitulo, pagina }) => {
    if (!texto.trim() || !livroAtivo) return false;
    const novaAnotacao = {
      id: Date.now().toString(),
      data: new Date().toISOString(),
      texto: texto.trim(),
      capitulo: capitulo.trim() || 'Geral',
      pagina: parseInt(pagina) || 0
    };
    try {
      await atualizarLivroFirebase(livroAtivo.id, { anotacoes: [novaAnotacao, ...(livroAtivo.anotacoes || [])] });
      return true;
    } catch (error) {
      toast({ title: 'Não foi possível salvar a anotação', tone: 'error' });
      return false;
    }
  };

  const deletarAnotacao = async (anotacaoId) => {
    if (!livroAtivo) return;
    const ok = await confirm({ title: 'Apagar anotação?', confirmLabel: 'Apagar', destructive: true });
    if (!ok) return;
    try {
      await atualizarLivroFirebase(livroAtivo.id, {
        anotacoes: (livroAtivo.anotacoes || []).filter(a => a.id !== anotacaoId)
      });
    } catch (error) {
      toast({ title: 'Não foi possível apagar', tone: 'error' });
    }
  };

  const livrosFiltrados = livros.filter(livro => {
    const matchesCategoria = filtroCategoria === 'Todas' || livro.categoria === filtroCategoria;
    if (secaoAtiva === 'favourites') return livro.favorito && matchesCategoria;
    return matchesCategoria;
  });

  const countFavoritos = livros.filter(l => l.favorito).length;
  const categoriasComLivros = categorias.filter(cat => livros.some(l => l.categoria === cat));

  const selecionarLivro = (id) => {
    setLivroSelecionadoId(id);
    if (window.matchMedia('(max-width: 1279px)').matches) setDetalheMobileAberto(true);
  };

  const detailProps = {
    onProgresso: atualizarProgresso,
    onCapitulo: atualizarCapitulo,
    onStatus: atualizarStatusDireto,
    onAvaliar: atualizarAvaliacao,
    onSalvarAnotacao: salvarAnotacao,
    onApagarAnotacao: deletarAnotacao,
    onEditar: iniciarEdicao,
    onRemover: removerLivro
  };

  const setCampo = (campo) => (e) => setNovoLivro({ ...novoLivro, [campo]: e.target.value });

  return (
    <ModuleFrame
      id="leitura"
      index="01"
      image={BibliotecaImg}
      title="Biblioteca"
      phrase="Cada livro com a página onde você parou, a nota que deu e o que vale lembrar."
      cta="Abrir minha estante"
      stats={[
        { label: 'Na estante', value: livros.length },
        { label: 'Lendo agora', value: livros.filter(l => l.status === 'Lendo').length },
        { label: 'Concluídos', value: livros.filter(l => l.status === 'Concluído').length }
      ]}
      actions={
        <Button
          onClick={() => {
            cancelarEdicao();
            setMostrarFormulario(true);
          }}
        >
          <Plus /> Adicionar livro
        </Button>
      }
    >
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          {/* Busca */}
          <div className="relative">
            <Input
              icon={Search}
              placeholder="Busque um livro para adicionar (título ou autor)"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="h-11"
              trailing={
                termoBusca && (
                  <button onClick={() => setTermoBusca('')} className="rounded p-1.5 text-ink-400 hover:text-ink-50" aria-label="Limpar busca">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )
              }
            />
            <AnimatePresence>
              {(buscando || resultadosBusca.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-ink-700 bg-ink-900 shadow-2xl"
                >
                  <p className="border-b border-ink-800 px-4 py-2 font-mono text-[11px] text-ink-500">Resultados da busca</p>
                  {buscando ? (
                    <div className="flex items-center gap-2 px-4 py-5 text-sm text-ink-400">
                      <Spinner className="h-4 w-4" /> Buscando livros
                    </div>
                  ) : (
                    <ul className="max-h-80 overflow-y-auto">
                      {resultadosBusca.map((item) => (
                        <li key={item.id}>
                          <button
                            onClick={() => selecionarLivroParaAdicionar(item)}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-ink-850"
                          >
                            <div className="h-12 w-8 shrink-0 overflow-hidden rounded-sm">
                              <Cover livro={item} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm text-ink-50">{item.titulo}</p>
                              <p className="truncate text-xs text-ink-400">
                                {item.autor}
                                {item.paginasTotal > 0 && ` · ${item.paginasTotal} pág.`}
                              </p>
                            </div>
                            <Plus className="h-4 w-4 text-ink-400" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Filtros */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <Segmented
              layoutId="leitura-secao"
              value={secaoAtiva}
              onChange={(v) => {
                setSecaoAtiva(v);
                setFiltroCategoria('Todas');
              }}
              options={[
                { value: 'library', label: 'Estante', icon: Library, count: livros.length },
                { value: 'favourites', label: 'Favoritos', icon: Heart, count: countFavoritos }
              ]}
            />
            <Segmented
              size="sm"
              layoutId="leitura-view"
              value={modoVisualizacao}
              onChange={setModoVisualizacao}
              options={[
                { value: 'grid', label: '', icon: LayoutGrid },
                { value: 'lista', label: '', icon: List }
              ]}
            />
          </div>

          {categoriasComLivros.length > 0 && (
            <div className="-mx-1 mt-4 flex gap-1.5 overflow-x-auto px-1 pb-1">
              {['Todas', ...categoriasComLivros].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFiltroCategoria(cat)}
                  className={cn(
                    'whitespace-nowrap rounded-full border px-3 py-1 text-xs transition-colors [@media(pointer:coarse)]:px-4 [@media(pointer:coarse)]:py-2',
                    filtroCategoria === cat
                      ? 'border-ink-50 bg-ink-50 text-ink-950'
                      : 'border-ink-700 text-ink-300 hover:border-ink-500 hover:text-ink-50'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Estante */}
          <div className="mt-5">
            {carregando ? (
              <div className="flex items-center justify-center gap-2 py-20 text-sm text-ink-400">
                <Spinner className="h-4 w-4" /> Carregando estante
              </div>
            ) : livrosFiltrados.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title={secaoAtiva === 'favourites' ? 'Nenhum favorito ainda' : 'Sua estante está vazia'}
                description={
                  secaoAtiva === 'favourites'
                    ? 'Toque no coração de um livro para ele aparecer aqui.'
                    : 'Busque um livro acima para preencher capa e páginas automaticamente, ou adicione à mão.'
                }
                action={
                  secaoAtiva !== 'favourites' && (
                    <Button
                      onClick={() => {
                        cancelarEdicao();
                        setMostrarFormulario(true);
                      }}
                    >
                      <Plus /> Adicionar livro
                    </Button>
                  )
                }
              />
            ) : modoVisualizacao === 'grid' ? (
              <motion.div layout className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                <AnimatePresence initial={false}>
                {livrosFiltrados.map((livro) => {
                  const prog = calcularProgresso(livro);
                  const ativo = livroAtivo?.id === livro.id;
                  return (
                    <motion.div
                      layout
                      key={livro.id}
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ y: -4 }}
                      className="group relative"
                    >
                      <button onClick={() => selecionarLivro(livro.id)} className="block w-full text-left">
                        <div
                          className={cn(
                            'relative aspect-[2/3] overflow-hidden rounded-lg ring-1 transition-shadow',
                            ativo ? 'ring-2 ring-lime' : 'ring-ink-800 group-hover:ring-ink-600'
                          )}
                        >
                          <Cover livro={livro} />
                          <div className="absolute inset-x-0 bottom-0 h-1 bg-ink-950/70">
                            <div className="h-full bg-lime" style={{ width: `${prog}%` }} />
                          </div>
                        </div>
                        <p className="mt-2.5 line-clamp-2 text-sm leading-snug text-ink-50">{livro.titulo}</p>
                        <p className="mt-0.5 truncate text-xs text-ink-500">{livro.autor || 'Autor desconhecido'}</p>
                        <p className="mt-1 font-mono text-[11px] text-ink-400">{prog}% lido</p>
                      </button>
                      <button
                        onClick={(e) => alternarFavorito(e, livro.id, livro.favorito)}
                        className={cn(
                          'absolute right-2 top-2 rounded-full p-1.5 backdrop-blur-md transition before:absolute before:-inset-2 before:content-[""] [@media(pointer:coarse)]:p-2',
                          livro.favorito
                            ? 'bg-lime text-ink-950'
                            : 'bg-ink-950/60 text-ink-100 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100'
                        )}
                        aria-label={livro.favorito ? 'Tirar dos favoritos' : 'Favoritar'}
                      >
                        <Heart className={cn('h-3.5 w-3.5', livro.favorito && 'fill-current')} />
                      </button>
                      <QuickDelete
                        label={`Remover ${livro.titulo}`}
                        onClick={() => removerLivro(livro.id)}
                        className="absolute left-2 top-2 h-7 w-7"
                      />
                    </motion.div>
                  );
                })}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="divide-y divide-ink-800 border-y border-ink-800">
                {livrosFiltrados.map((livro) => {
                  const prog = calcularProgresso(livro);
                  const ativo = livroAtivo?.id === livro.id;
                  return (
                    <div key={livro.id} className="group flex items-center gap-2">
                    <button
                      onClick={() => selecionarLivro(livro.id)}
                      className={cn('flex min-w-0 flex-1 items-center gap-4 px-2 py-3 text-left transition-colors', ativo ? 'bg-ink-900' : 'hover:bg-ink-900/60')}
                    >
                      <div className="h-14 w-10 shrink-0 overflow-hidden rounded-sm">
                        <Cover livro={livro} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-ink-50">{livro.titulo}</p>
                        <p className="truncate text-xs text-ink-500">{livro.autor || 'Autor desconhecido'}</p>
                      </div>
                      <Badge tone={statusTone[livro.status] || 'default'} className="hidden sm:inline-flex">{livro.status}</Badge>
                      <div className="hidden w-28 sm:block">
                        <Progress value={prog} />
                      </div>
                      <span className="w-10 text-right font-mono text-xs text-ink-300">{prog}%</span>
                    </button>
                    <QuickDelete label={`Remover ${livro.titulo}`} onClick={() => removerLivro(livro.id)} className="mr-1 shrink-0" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Detalhes (desktop largo) */}
        <aside className="hidden xl:block">
          <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto border-l border-ink-800 pl-6 pr-2">
            {livroAtivo ? (
              <BookDetail key={livroAtivo.id} livro={livroAtivo} {...detailProps} />
            ) : (
              <EmptyState
                className="border-0"
                icon={Bookmark}
                title="Nenhum livro selecionado"
                description="Escolha um livro da estante para registrar o progresso e fazer anotações."
              />
            )}
          </div>
        </aside>
      </div>

      {/* Detalhes (telas menores) */}
      <Dialog open={detalheMobileAberto && !!livroAtivo} onClose={() => setDetalheMobileAberto(false)} title="Detalhes do livro" size="md">
        {livroAtivo && <BookDetail key={livroAtivo.id} livro={livroAtivo} {...detailProps} />}
      </Dialog>

      {/* Cadastro / edição */}
      <Dialog
        open={mostrarFormulario}
        onClose={fecharFormulario}
        title={modoEdicao ? 'Editar livro' : 'Adicionar livro'}
        description={modoEdicao ? undefined : 'Deixe a capa vazia que a gente tenta encontrar pelo título.'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={fecharFormulario} disabled={salvando}>Cancelar</Button>
            <Button type="submit" form="livro-form" loading={salvando}>
              {modoEdicao ? 'Salvar alterações' : 'Adicionar à estante'}
            </Button>
          </>
        }
      >
        <form id="livro-form" onSubmit={adicionarLivro} className="grid gap-4 sm:grid-cols-2">
          <TextField className="sm:col-span-2" label="Título" placeholder="Nome do livro, resumo ou material" value={novoLivro.titulo} onChange={setCampo('titulo')} required />
          <TextField label="Autor" value={novoLivro.autor} onChange={setCampo('autor')} />
          <Field label="Tipo de material">
            <Select value={novoLivro.tipo} onChange={setCampo('tipo')}>
              {tipos.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
          </Field>

          <Field label="Capa" className="sm:col-span-2" hint="Cole o link de uma imagem ou envie um arquivo de até 1,5 MB.">
            <div className="flex gap-2">
              {novoLivro.capa && (
                <img src={novoLivro.capa} alt="Prévia da capa" className="h-10 w-7 shrink-0 rounded-sm object-cover ring-1 ring-ink-700" />
              )}
              <Input className="flex-1" placeholder="https://..." value={novoLivro.capa.startsWith('data:') ? 'Imagem enviada' : novoLivro.capa} onChange={setCampo('capa')} />
              <label className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-ink-700 px-3 text-sm text-ink-100 transition-colors hover:border-ink-500">
                <Upload className="h-4 w-4" /> Enviar
                <input type="file" accept="image/*" onChange={handleUploadImagemCapa} className="hidden" />
              </label>
            </div>
          </Field>

          <Field label="Categoria">
            <Select value={novoLivro.categoria} onChange={setCampo('categoria')}>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Status">
            <Select value={novoLivro.status} onChange={setCampo('status')}>
              {statusLeitura.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>

          <Field label="Descrição" className="sm:col-span-2">
            <Textarea placeholder="Sinopse ou resumo rápido" value={novoLivro.descricao} onChange={setCampo('descricao')} />
          </Field>

          <TextField label="Total de páginas" type="number" min="0" placeholder="350" value={novoLivro.paginasTotal} onChange={setCampo('paginasTotal')} />
          <TextField
            label="Páginas lidas"
            type="number"
            min="0"
            value={novoLivro.paginasLidas}
            onChange={(e) => setNovoLivro({ ...novoLivro, paginasLidas: parseInt(e.target.value) || 0 })}
          />
          <TextField label="Início" type="date" value={novoLivro.dataInicio} onChange={setCampo('dataInicio')} />
          <TextField label="Término" type="date" value={novoLivro.dataTermino} onChange={setCampo('dataTermino')} />

          <Field label="Avaliação">
            <div className="flex h-10 items-center">
              <Stars value={novoLivro.avaliacao || 0} onChange={(n) => setNovoLivro({ ...novoLivro, avaliacao: n })} size="h-5 w-5" />
            </div>
          </Field>
          <TextField label="Link de compra ou download" type="url" placeholder="https://..." value={novoLivro.linkCompra} onChange={setCampo('linkCompra')} />
        </form>
      </Dialog>
    </ModuleFrame>
  );
};

export default Leitura;
