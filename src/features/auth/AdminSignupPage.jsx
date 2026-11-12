import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { AnimatePresence } from "motion/react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { AuthLayout, FormMessage } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Field, Input, TextField } from "@/components/ui/field";
import { COL } from "@/lib/collections";

// Cadastro de conta administrativa
function Cadastros() {
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault();
    setErro("");
    if (senha.length < 6) return setErro("A senha precisa ter pelo menos 6 caracteres.");
    if (senha !== confirmSenha) return setErro("As senhas não coincidem.");

    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, senha);
      // Documento com o próprio uid, que é como o login procura o perfil
      await setDoc(doc(db, COL.usuarios, user.uid), {
        uid: user.uid,
        email,
        nome,
        sobrenome,
        criadoEm: new Date().toISOString(),
      });
      navigate("/home");
    } catch (error) {
      const mensagens = {
        "auth/email-already-in-use": "Este e-mail já está cadastrado.",
        "auth/invalid-email": "E-mail inválido.",
        "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
      };
      setErro(mensagens[error.code] || "Não deu para criar a conta. Tente de novo.");
    } finally {
      setLoading(false);
    }
  };

  const olho = (
    <button
      type="button"
      onClick={() => setMostrarSenha((v) => !v)}
      className="rounded p-1.5 text-ink-400 hover:text-ink-50"
      aria-label={mostrarSenha ? "Esconder senha" : "Mostrar senha"}
    >
      {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );

  return (
    <AuthLayout
      title="Conta administrativa"
      subtitle="Acesso para quem administra o LearnHub."
      footer={
        <>
          Já tem conta?{" "}
          <Link to="/login" className="text-ink-50 underline-offset-4 hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={handleCadastro} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required disabled={loading} />
          <TextField label="Sobrenome" value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} required disabled={loading} />
        </div>
        <TextField label="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
        <Field label="Senha" hint="Mínimo de 6 caracteres.">
          <Input type={mostrarSenha ? "text" : "password"} autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} required disabled={loading} trailing={olho} />
        </Field>
        <Field label="Confirmar senha">
          <Input type={mostrarSenha ? "text" : "password"} autoComplete="new-password" value={confirmSenha} onChange={(e) => setConfirmSenha(e.target.value)} required disabled={loading} />
        </Field>
        <AnimatePresence>{erro && <FormMessage icon={AlertCircle}>{erro}</FormMessage>}</AnimatePresence>
        <Button type="submit" size="lg" className="mt-2 w-full" loading={loading}>
          Criar conta
        </Button>
      </form>
    </AuthLayout>
  );
}

export default Cadastros;
