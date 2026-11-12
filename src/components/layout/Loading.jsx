import { motion } from 'motion/react';
import { LogoMark } from '@/components/brand/Logo';

// Tela de carregamento única do app. "title" fica como rótulo pequeno; "message" logo abaixo.
const Loading = ({ title, message = 'Carregando' }) => {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink-950 font-sans">
      <div className="flex flex-col items-center gap-5">
        <motion.div
          animate={{ scale: [1, 0.9, 1], rotate: [0, 0, 90] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <LogoMark className="h-9 w-9" />
        </motion.div>
        <div className="flex flex-col items-center gap-1.5">
          {title && <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-500">{title}</span>}
          <span className="text-sm text-ink-300">{message}</span>
        </div>
        <div className="h-px w-32 overflow-hidden bg-ink-800">
          <motion.div
            className="h-full w-1/3 bg-lime"
            animate={{ x: ['-100%', '300%'] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Loading;
