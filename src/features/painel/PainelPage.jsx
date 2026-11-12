import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { ArrowUpRight, Eye, EyeOff, Command } from 'lucide-react';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { useStudent } from '@/context/StudentContext';
import { setCardTransition } from '@/components/layout/cardTransition';
import BibliotecaImg from '@/assets/modules/biblioteca.jpg';
import FinancasImg from '@/assets/modules/financas.jpg';
import HabilidadesImg from '@/assets/modules/habilidades.jpg';
import CarreiraImg from '@/assets/modules/carreira.jpg';
import { COL } from '@/lib/collections';

const brl = (v) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const saudacao = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
};

const entrada = {
  hidden: { opacity: 0, y: 24 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.06 + i * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] } })
};

// Card de módulo com a foto ocupando tudo; o conteúdo fica por cima, embaixo
function ModuleCard({ id, to, index, title, image, className, i, onOpen, children }) {
  return (
    <motion.a
      href={to}
      data-card={id}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onOpen(id, to, e.currentTarget);
      }}
      variants={entrada}
      initial="hidden"
      animate="show"
      custom={i}
      className={cn(
        'dash-card group relative isolate flex min-h-[260px] flex-col justify-end overflow-hidden rounded-2xl bg-ink-900 p-5 outline-none sm:p-6',
        'focus-visible:ring-2 focus-visible:ring-lime/70',
        className
      )}
    >
      <img
        src={image}
        alt=""
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-55 transition-[transform,opacity] duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] group-hover:opacity-70"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/10" />

      <div className="absolute inset-x-5 top-5 flex items-center justify-between sm:inset-x-6 sm:top-6">
        <span className="font-mono text-xs text-ink-300">{index}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-950/40 text-ink-100 backdrop-blur-md transition-colors group-hover:bg-lime group-hover:text-ink-950">
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
        </span>
      </div>

      <h2 className="text-3xl font-semibold tracking-[-0.04em] text-ink-50 sm:text-4xl">{title}</h2>
      <span className="mt-3 block h-px w-10 origin-left bg-lime transition-transform duration-500 group-hover:scale-x-[2.5]" />
      <div className="mt-4">{children}</div>
    </motion.a>
  );
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, primeiroNome } = useStudent();
  const root = useRef(null);
  const saindo = useRef(false);
  const [livros, setLivros] = useState([]);
  const [habilidades, setHabilidades] = useState([]);
  const [candidaturas, setCandidaturas] = useState([]);
  const [financas, setFinancas] = useState({ totalBalance: 0, totalSpending: 0, totalSaved: 0 });
  const [mostrarSaldo, setMostrarSaldo] = useState(() => {
    try {
      return localStorage.getItem('learnhub_mostrar_saldo') !== 'false';
    } catch (e) {
      return true;
    }
  });

  // Baixa o código dos módulos com antecedência para a transição não parar num carregamento
  useEffect(() => {
    import('@/features/leitura/LeituraPage');
    import('@/features/financas/FinancasPage');
    import('@/features/habilidades/HabilidadesPage');
    import('@/features/carreira/CarreiraPage');
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    const uid = user.uid;
    const unsubs = [
      onSnapshot(query(collection(db, COL.leitura), where('userId', '==', uid)), (s) =>
        setLivros(s.docs.map((d) => ({ id: d.id, ...d.data() })))
      ),
      onSnapshot(query(collection(db, COL.habilidades), where('userId', '==', uid)), (s) =>
        setHabilidades(s.docs.map((d) => ({ id: d.id, ...d.data() })))
      ),
      onSnapshot(query(collection(db, COL.candidaturas), where('userId', '==', uid)), (s) =>
        setCandidaturas(s.docs.map((d) => ({ id: d.id, ...d.data() })))
      ),
      onSnapshot(doc(db, COL.financasResumo, uid), (s) => {
        const data = s.exists() ? s.data() : {};
        setFinancas({ totalBalance: data.totalBalance || 0, totalSpending: data.totalSpending || 0, totalSaved: data.totalSaved || 0 });
      })
    ];
    return () => unsubs.forEach((u) => u());
  }, [user]);

  // Clique num card: o resto da tela recua, o card se destaca e a tela do módulo nasce dele
  const abrirModulo = (id, to, el) => {
    if (saindo.current) return;
    saindo.current = true;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return navigate(to);

    const outros = root.current.querySelectorAll(`.dash-card:not([data-card="${id}"]), .dash-header`);
    gsap
      .timeline({
        onComplete: () => {
          setCardTransition(id, el.getBoundingClientRect());
          navigate(to);
        }
      })
      .to(outros, { opacity: 0, scale: 0.96, y: 10, duration: 0.35, ease: 'power2.in', stagger: 0.03 }, 0)
      .to(el, { scale: 1.015, duration: 0.35, ease: 'power2.out' }, 0)
      .to(el.querySelector('img'), { opacity: 1, duration: 0.35 }, 0)
      .to(el, { scale: 1, duration: 0.15, ease: 'power2.inOut' });
  };

  const toggleSaldo = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMostrarSaldo((v) => {
      try {
        localStorage.setItem('learnhub_mostrar_saldo', String(!v));
      } catch (err) {
        // Preferência só não fica salva
      }
      return !v;
    });
  };

  const lendo = livros.filter((l) => l.status === 'Lendo');
  const livroAtivo = lendo[0] || null;
  const progressoLivro = livroAtivo?.paginasTotal ? Math.round(((livroAtivo.paginasLidas || 0) / livroAtivo.paginasTotal) * 100) : 0;
  const concluidos = livros.filter((l) => l.status === 'Concluído').length;

  const topHabilidade = useMemo(
    () => [...habilidades].filter((h) => h.ativo !== false).sort((a, b) => (b.progresso || 0) - (a.progresso || 0))[0],
    [habilidades]
  );
  const mediaHabilidades = habilidades.length
    ? Math.round(habilidades.reduce((acc, h) => acc + (h.progresso || 0), 0) / habilidades.length)
    : 0;

  const faseLabel = { enviado: 'Inscrição', prova: 'Prova', entrevista: 'Entrevista', aprovado: 'Aprovado', reprovado: 'Não passou' };
  const fases = ['enviado', 'prova', 'entrevista', 'aprovado'];
  const contagem = fases.map((f) => candidaturas.filter((c) => c.fase === f).length);
  const ultimaCandidatura = [...candidaturas].sort((a, b) => (b.dataEnvio || '').localeCompare(a.dataEnvio || ''))[0];

  const resumo = [
    lendo.length > 0 && `${lendo.length} ${lendo.length === 1 ? 'livro' : 'livros'} em andamento`,
    contagem[2] > 0 && `${contagem[2]} ${contagem[2] === 1 ? 'entrevista' : 'entrevistas'} no radar`,
    habilidades.length > 0 && `${mediaHabilidades}% de domínio médio nas habilidades`
  ].filter(Boolean);

  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const oculto = 'R$ ••••';

  return (
    <div ref={root} className="mx-auto max-w-[1400px] px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-10">
      <motion.header variants={entrada} initial="hidden" animate="show" custom={0} className="dash-header flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-mono text-xs text-ink-400 first-letter:uppercase">{hoje}</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.045em] text-ink-50 sm:text-6xl">
            {saudacao()}, {primeiroNome}.
          </h1>
          <p className="mt-3 max-w-xl text-ink-300">
            {resumo.length > 0 ? `${resumo.join(', ')}.` : 'Escolha um módulo para começar. Tudo o que você registrar aparece aqui.'}
          </p>
        </div>
        <p className="hidden items-center gap-1.5 text-xs text-ink-500 lg:flex">
          Ir rápido para qualquer lugar:
          <kbd className="inline-flex items-center gap-0.5 rounded border border-ink-700 px-1.5 py-0.5 font-mono text-[10px] text-ink-300">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </p>
      </motion.header>

      <div className="mt-10 grid gap-3 md:grid-cols-2 xl:grid-cols-4 xl:grid-rows-[300px_260px]">
        <ModuleCard id="leitura" to="/leitura" index="01" title="Biblioteca" image={BibliotecaImg} className="xl:col-span-2 xl:row-span-2" i={1} onOpen={abrirModulo}>
          {livroAtivo ? (
            <div className="max-w-md">
              <p className="text-xs text-ink-400">Lendo agora</p>
              <p className="mt-1 text-lg font-medium leading-snug text-ink-50">{livroAtivo.titulo}</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-ink-50/15">
                  <div className="h-full rounded-full bg-lime" style={{ width: `${progressoLivro}%` }} />
                </div>
                <span className="font-mono text-xs text-ink-200">{progressoLivro}%</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink-300">Nenhum livro em leitura agora.</p>
          )}
          <p className="mt-4 font-mono text-xs text-ink-400">
            {livros.length} na estante · {lendo.length} lendo · {concluidos} concluídos
          </p>
        </ModuleCard>

        <ModuleCard id="financas" to="/financas" index="02" title="Finanças" image={FinancasImg} className="xl:col-span-2" i={2} onOpen={abrirModulo}>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-xs text-ink-400">
                Saldo
                <button
                  onClick={toggleSaldo}
                  className="-m-2 rounded p-2 text-ink-400 transition-colors hover:text-ink-50"
                  aria-label={mostrarSaldo ? 'Ocultar valores' : 'Mostrar valores'}
                >
                  {mostrarSaldo ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </p>
              <p className="mt-1 font-mono text-2xl tracking-tight text-ink-50 tabular-nums">
                {mostrarSaldo ? brl(financas.totalBalance) : oculto}
              </p>
            </div>
            <p className="text-right font-mono text-xs leading-relaxed text-ink-400">
              gasto {mostrarSaldo ? brl(financas.totalSpending) : oculto}
              <br />
              <span className="text-lime">guardado {mostrarSaldo ? brl(financas.totalSaved) : oculto}</span>
            </p>
          </div>
        </ModuleCard>

        <ModuleCard id="habilidades" to="/habilidades" index="03" title="Habilidades" image={HabilidadesImg} i={3} onOpen={abrirModulo}>
          <p className="font-mono text-2xl text-ink-50">{mediaHabilidades}%</p>
          <p className="mt-1 truncate text-xs text-ink-400">
            {topHabilidade ? `Mais forte: ${topHabilidade.nome}` : 'Domínio médio'}
          </p>
        </ModuleCard>

        <ModuleCard id="carreira" to="/carreira" index="04" title="Carreira" image={CarreiraImg} i={4} onOpen={abrirModulo}>
          {ultimaCandidatura ? (
            <>
              <p className="truncate text-sm text-ink-100">{ultimaCandidatura.vaga}</p>
              <p className="mt-0.5 truncate text-xs text-ink-400">
                {ultimaCandidatura.empresa} ·{' '}
                <span className={ultimaCandidatura.fase === 'aprovado' ? 'text-lime' : 'text-ink-200'}>
                  {faseLabel[ultimaCandidatura.fase] || 'Inscrição'}
                </span>
              </p>
            </>
          ) : (
            <p className="text-sm text-ink-300">Nenhuma candidatura ainda.</p>
          )}
        </ModuleCard>
      </div>
    </div>
  );
};

export default Dashboard;
