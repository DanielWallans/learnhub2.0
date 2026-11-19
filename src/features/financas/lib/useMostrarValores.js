import { useCallback, useEffect, useState } from 'react';

// Preferência "mostrar/ocultar valores" compartilhada entre o Painel e Finanças.
// Fica salva no navegador; esconder em uma tela esconde na outra também.
const CHAVE = 'learnhub_mostrar_saldo';
const EVENTO = 'learnhub:mostrar-valores';

export const VALOR_OCULTO = 'R$ ••••';

const ler = () => {
  try {
    return localStorage.getItem(CHAVE) !== 'false';
  } catch {
    return true;
  }
};

export function useMostrarValores() {
  const [mostrar, setMostrar] = useState(ler);

  useEffect(() => {
    const sync = () => setMostrar(ler());
    window.addEventListener(EVENTO, sync);
    window.addEventListener('storage', sync); // outras abas
    return () => {
      window.removeEventListener(EVENTO, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const alternar = useCallback((e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    const novo = !ler();
    try {
      localStorage.setItem(CHAVE, String(novo));
    } catch {
      // Sem armazenamento: vale só até recarregar a página
    }
    setMostrar(novo);
    window.dispatchEvent(new Event(EVENTO));
  }, []);

  return [mostrar, alternar];
}
