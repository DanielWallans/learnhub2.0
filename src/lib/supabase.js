import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('Supabase: defina REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY no .env');
}

// Lido antes de qualquer redirecionamento do router apagar o token da URL:
// o link do e-mail de "esqueci a senha" chega com type=recovery
const parametrosIniciais = new URLSearchParams(window.location.hash.slice(1));
export const chegouPorRecuperacao = /type=recovery/.test(window.location.hash + window.location.search);
// Tokens do link (se o redirecionamento apagar a URL antes de o Supabase ler, a tela de nova senha usa estes)
export const tokensDoLink = {
  access_token: parametrosIniciais.get('access_token'),
  refresh_token: parametrosIniciais.get('refresh_token'),
  erro: parametrosIniciais.get('error_description'),
};

export const supabase = createClient(url, anonKey);
