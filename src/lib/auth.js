import { supabase } from '@/lib/supabase';

// Autenticação sobre o Supabase com a mesma "cara" do Firebase Auth que o app já usava.
// O usuário exposto tem { uid, email } e os erros trazem códigos no formato "auth/...".

const paraUsuario = (u) => (u ? { uid: u.id, email: u.email } : null);

let atual = null;

export const auth = {
  get currentUser() {
    return atual;
  },
  signOut: async () => {
    await supabase.auth.signOut();
    atual = null;
  },
};

const CODIGOS = {
  invalid_credentials: 'auth/invalid-credential',
  user_already_exists: 'auth/email-already-in-use',
  email_exists: 'auth/email-already-in-use',
  weak_password: 'auth/weak-password',
  email_address_invalid: 'auth/invalid-email',
  validation_failed: 'auth/invalid-email',
  over_request_rate_limit: 'auth/too-many-requests',
  over_email_send_rate_limit: 'auth/too-many-requests',
  user_banned: 'auth/user-disabled',
  email_not_confirmed: 'auth/email-not-confirmed',
  same_password: 'auth/same-password',
};

const erro = (e) => {
  const err = new Error(e.message);
  err.code = CODIGOS[e.code] || (e.status === 429 ? 'auth/too-many-requests' : `auth/${e.code || 'desconhecido'}`);
  err.original = e;
  return err;
};

export function onAuthStateChanged(_auth, callback) {
  let ultimo;
  const { data } = supabase.auth.onAuthStateChange((_evento, sessao) => {
    const usuario = paraUsuario(sessao?.user);
    atual = usuario;
    const uid = usuario?.uid ?? null;
    if (uid === ultimo) return; // renovação de token não muda quem está logado
    ultimo = uid;
    // Fora do callback do Supabase, para poder consultar o banco sem travar
    setTimeout(() => callback(usuario), 0);
  });
  return () => data.subscription.unsubscribe();
}

export async function signInWithEmailAndPassword(_auth, email, senha) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) throw erro(error);
  atual = paraUsuario(data.user);
  return { user: atual };
}

export async function createUserWithEmailAndPassword(_auth, email, senha) {
  const { data, error } = await supabase.auth.signUp({ email, password: senha });
  if (error) throw erro(error);
  // E-mail já cadastrado: o Supabase devolve um usuário sem identidades
  if (data.user && data.user.identities?.length === 0) {
    throw erro({ code: 'user_already_exists', message: 'E-mail já cadastrado.' });
  }
  // Com "Confirm email" ligado no Supabase não há sessão e o perfil não pode ser gravado
  if (!data.session) throw erro({ code: 'email_not_confirmed', message: 'Confirme o e-mail para continuar.' });
  atual = paraUsuario(data.user);
  return { user: atual };
}

export async function sendPasswordResetEmail(_auth, email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/redefinir-senha`,
  });
  if (error) throw erro(error);
}

// Avisa quando a pessoa entrou pelo link de recuperação de senha
export function onPasswordRecovery(callback) {
  const { data } = supabase.auth.onAuthStateChange((evento) => {
    if (evento === 'PASSWORD_RECOVERY') setTimeout(callback, 0);
  });
  return () => data.subscription.unsubscribe();
}

export async function updatePassword(senha) {
  const { error } = await supabase.auth.updateUser({ password: senha });
  if (error) throw erro(error);
}
