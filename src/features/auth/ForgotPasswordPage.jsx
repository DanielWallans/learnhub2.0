import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { AnimatePresence } from "motion/react";
import { AlertCircle, ArrowLeft, Mail, MailCheck } from "lucide-react";
import { auth } from "@/lib/firebase";
import { AuthLayout, FormMessage } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

// Única tela de recuperação de senha (atende /esqueci-senha e /recuperar-senha)
function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErro("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErro("Digite um e-mail válido.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email, { url: `${window.location.origin}/login`, handleCodeInApp: false });
      setEnviado(true);
    } catch (error) {
      const mensagens = {
        "auth/user-not-found": "Não encontramos uma conta com esse e-mail.",
        "auth/invalid-email": "E-mail inválido.",
        "auth/too-many-requests": "Muitas tentativas. Aguarde alguns minutos.",
        "auth/user-disabled": "Esta conta foi desativada.",
      };
      setErro(mensagens[error.code] || "Não deu para enviar agora. Verifique a conexão e tente de novo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Mandamos um link para você criar uma senha nova."
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 text-ink-300 hover:text-ink-50">
          <ArrowLeft className="h-4 w-4" /> Voltar para o login
        </Link>
      }
    >
      {enviado ? (
        <div className="flex flex-col gap-4">
          <FormMessage icon={MailCheck} tone="success">
            Link enviado para <strong className="font-medium">{email}</strong>. Confira a caixa de entrada e o spam.
          </FormMessage>
          <Button variant="outline" onClick={() => setEnviado(false)}>
            Usar outro e-mail
          </Button>
        </div>
      ) : (
        <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
          <Field label="E-mail da conta" htmlFor="reset-email">
            <Input
              id="reset-email"
              type="email"
              icon={Mail}
              autoComplete="email"
              placeholder="voce@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </Field>
          <AnimatePresence>{erro && <FormMessage icon={AlertCircle}>{erro}</FormMessage>}</AnimatePresence>
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Enviar link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}

export default ForgotPassword;
