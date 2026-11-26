import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('Supabase: defina REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY no .env');
}

// Lido antes de qualquer redirecionamento do router apagar o token da URL:
// o link do e-mail de "esqueci a senha" chega com type=recovery
const hashInicial = new URLSearchParams(window.location.hash.slice(1));
const buscaInicial = new URLSearchParams(window.location.search);
// Tokens do link (se o redirecionamento apagar a URL antes de o Supabase ler, a tela de nova senha usa estes).
// token_hash vem do modelo de e-mail próprio: só é gasto quando a pessoa salva a senha,
// então os verificadores de link do Outlook/Gmail não conseguem invalidá-lo antes.
export const tokensDoLink = {
  access_token: hashInicial.get('access_token'),
  refresh_token: hashInicial.get('refresh_token'),
  token_hash: buscaInicial.get('token_hash'),
  erro: hashInicial.get('error_code') || buscaInicial.get('error_code'),
};
export const chegouPorRecuperacao =
  /type=recovery/.test(window.location.hash + window.location.search) || !!tokensDoLink.erro;

export const supabase = createClient(url, anonKey);
