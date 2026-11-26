import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { AlertCircle, ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import { auth, updatePassword } from "@/lib/auth";
import { supabase, tokensDoLink } from "@/lib/supabase";
import { AuthLayout, FormMessage } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

// Aberta pelo link do e-mail de recuperação: o Supabase já entra com uma sessão temporária
function ResetPassword() {
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [pronto, setPronto] = useState(false);
  const navigate = useNavigate();

  // Garante a sessão do link mesmo se o token tiver saído da URL
  useEffect(() => {
    if (tokensDoLink.erro) {
      setErro("O link expirou ou já foi usado. Peça um novo.");
      return;
    }
    if (!auth.currentUser && tokensDoLink.access_token && tokensDoLink.refresh_token) {
      supabase.auth
        .setSession({ access_token: tokensDoLink.access_token, refresh_token: tokensDoLink.refresh_token })
        .catch(() => setErro("O link expirou ou já foi usado. Peça um novo."));
    }
  }, []);

  const salvar = async (e) => {
    e.preventDefault();
    setErro("");
    if (senha.length < 6) return setErro("A senha precisa ter pelo menos 6 caracteres.");
    if (senha !== confirmar) return setErro("As senhas não são iguais.");
    setLoading(true);
    try {
      if (!auth.currentUser && tokensDoLink.token_hash) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokensDoLink.token_hash, type: "recovery" });
        if (error) throw Object.assign(new Error(error.message), { code: "auth/link-expirado" });
      }
      if (!(await supabase.auth.getSession()).data.session) {
        throw Object.assign(new Error("sem sessão"), { code: "auth/link-expirado" });
      }
      await updatePassword(senha);
      setPronto(true);
      setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
    } catch (error) {
      const mensagens = {
        "auth/weak-password": "Senha muito fraca.",
        "auth/same-password": "A senha nova precisa ser diferente da atual.",
        "auth/link-expirado": "O link expirou ou já foi usado. Peça um novo.",
      };
      setErro(mensagens[error.code] || "Não deu para salvar a senha. Peça um novo link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Nova senha"
      subtitle="Escolha a senha que você vai usar daqui para frente."
      footer={
        <Link to="/esqueci-senha" className="inline-flex items-center gap-1.5 text-ink-300 hover:text-ink-50">
          <ArrowLeft className="h-4 w-4" /> Pedir outro link
        </Link>
      }
    >
      {pronto ? (
        <FormMessage icon={CheckCircle2} tone="success">
          Senha alterada. Entrando...
        </FormMessage>
      ) : (
        <form onSubmit={salvar} className="flex flex-col gap-4">
          <Field label="Nova senha" htmlFor="nova-senha">
            <Input
              id="nova-senha"
              type="password"
              icon={Lock}
              autoComplete="new-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={loading}
              required
            />
          </Field>
          <Field label="Confirmar senha" htmlFor="confirmar-senha">
            <Input
              id="confirmar-senha"
              type="password"
              icon={Lock}
              autoComplete="new-password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              disabled={loading}
              required
            />
          </Field>
          <AnimatePresence>{erro && <FormMessage icon={AlertCircle}>{erro}</FormMessage>}</AnimatePresence>
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Salvar senha
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}

export default ResetPassword;
