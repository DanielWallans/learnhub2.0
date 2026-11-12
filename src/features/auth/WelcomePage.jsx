import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import { ArrowRight, BookOpen, Briefcase, ListChecks, Target, Wallet } from 'lucide-react';
import { useStudent } from '@/context/StudentContext';
import { Logo } from '@/components/brand/Logo';
import BibliotecaImg from '@/assets/modules/biblioteca.jpg';
import FinancasImg from '@/assets/modules/financas.jpg';
import HabilidadesImg from '@/assets/modules/habilidades.jpg';
import CarreiraImg from '@/assets/modules/carreira.jpg';
import TarefasImg from '@/assets/modules/tarefas.jpg';

gsap.registerPlugin(SplitText, useGSAP);

const MODULOS = [
  { to: '/tarefas', nome: 'Tarefas', texto: 'O que fazer e quando', icon: ListChecks, img: TarefasImg },
  { to: '/leitura', nome: 'Biblioteca', texto: 'Livros e anotações', icon: BookOpen, img: BibliotecaImg },
  { to: '/financas', nome: 'Finanças', texto: 'Saldo e gastos', icon: Wallet, img: FinancasImg },
  { to: '/habilidades', nome: 'Habilidades', texto: 'O que você domina', icon: Target, img: HabilidadesImg },
  { to: '/carreira', nome: 'Carreira', texto: 'Vagas e metas', icon: Briefcase, img: CarreiraImg }
];

function BoasVindas() {
  const navigate = useNavigate();
  const { primeiroNome } = useStudent();
  const root = useRef(null);
  const title = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        SplitText.create(title.current, {
          type: 'words',
          mask: 'words',
          wordsClass: 'hero-word',
          onSplit: (self) => gsap.from(self.words, { yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.06 })
        });
      });
    },
    { scope: root }
  );

  return (
    <div ref={root} className="flex min-h-screen flex-col bg-ink-950 px-5 py-6 font-sans text-ink-50 antialiased sm:px-10">
      <Logo />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center py-12">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 font-mono text-xs text-ink-400">
          <span className="h-1.5 w-1.5 rounded-full bg-lime" /> Conta criada
        </motion.p>
        <h1 ref={title} className="mt-5 max-w-3xl text-[clamp(2.5rem,7vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.05em]">
          Bem-vindo, {primeiroNome}. Por onde começamos?
        </h1>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {MODULOS.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.button
                key={m.to}
                onClick={() => navigate(m.to)}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                className="group relative h-44 overflow-hidden rounded-2xl border border-ink-800 text-left"
              >
                <img src={m.img} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50 transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent" />
                <div className="relative flex h-full flex-col justify-end p-4">
                  <Icon className="mb-auto h-5 w-5 text-ink-200" />
                  <p className="text-lg font-medium tracking-tight">{m.nome}</p>
                  <p className="text-sm text-ink-400">{m.texto}</p>
                </div>
                <span className="absolute right-3 top-3 font-mono text-[11px] text-ink-400">0{i + 1}</span>
              </motion.button>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-10">
          <button
            onClick={() => navigate('/dashboard')}
            className="group inline-flex h-12 items-center gap-2 rounded-lg bg-lime px-6 text-sm font-medium text-ink-950 transition-colors hover:bg-[#D4FF4A]"
          >
            Ir para o painel <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default BoasVindas;
