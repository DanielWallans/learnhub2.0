import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { AnimatePresence } from "motion/react";
import { AlertCircle, Eye, EyeOff, GraduationCap, Lock, Mail, Settings2 } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { AuthLayout, FormMessage } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Segmented } from "@/components/ui/primitives";
import { COL } from "@/lib/collections";

function Login() {
  const [tipoUsuario, setTipoUsuario] = useState("aluno"); // "aluno" | "admin"
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userType, loading: authLoading, refreshUser } = useAuth();

  const destino = (tipo) => (tipo === "admin" ? "/home" : location.state?.from || "/dashboard");

  // Quem abre o login já logado segue direto (não interfere enquanto o formulário está enviando)
  useEffect(() => {
    if (currentUser && !authLoading && !loading) navigate(destino(userType), { replace: true });
  }, [currentUser, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, senha);
      const colecao = tipoUsuario === "admin" ? COL.usuarios : COL.alunos;
      const userDoc = await getDoc(doc(db, colecao, user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, colecao, user.uid), {
          uid: user.uid,
          email: user.email,
          criadoEm: new Date().toISOString(),
        });
      }
      // Confirma o perfil antes de navegar, senão a rota privada ainda vê "ninguém logado"
      const tipo = await refreshUser();
      navigate(destino(tipo || tipoUsuario), { replace: true });
    } catch (error) {
      const mensagens = {
        "auth/user-not-found": "E-mail não encontrado.",
        "auth/wrong-password": "Senha incorreta.",
        "auth/invalid-credential": "E-mail ou senha incorretos.",
        "auth/invalid-email": "E-mail inválido.",
        "auth/too-many-requests": "Muitas tentativas. Tente de novo daqui a pouco.",
      };
      setErro(mensagens[error.code] || "Não deu para entrar. Confira os dados e tente de novo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Entrar"
      subtitle={tipoUsuario === "aluno" ? "Que bom te ver de novo." : "Acesso administrativo do sistema."}
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link to={tipoUsuario === "aluno" ? "/cadastro-aluno" : "/cadastros"} className="text-ink-50 underline-offset-4 hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      <Segmented
        className="mb-6 w-full"
        layoutId="login-tipo"
        value={tipoUsuario}
        onChange={(v) => {
          setTipoUsuario(v);
          setErro("");
        }}
        options={[
          { value: "aluno", label: "Estudante", icon: GraduationCap },
          { value: "admin", label: "Administrativo", icon: Settings2 },
        ]}
      />

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <Field label="E-mail" htmlFor="login-email">
          <Input
            id="login-email"
            type="email"
            icon={Mail}
            autoComplete="email"
            placeholder={tipoUsuario === "aluno" ? "voce@email.com" : "admin@learnhub.com"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </Field>
        <Field
          label={
            <span className="flex w-full items-center justify-between">
              Senha
              <Link to="/esqueci-senha" className="-my-1 py-1 text-xs font-normal text-ink-400 hover:text-ink-50">
                Esqueci a senha
              </Link>
            </span>
          }
          htmlFor="login-senha"
        >
          <Input
            id="login-senha"
            type={mostrarSenha ? "text" : "password"}
            icon={Lock}
            autoComplete="current-password"
            placeholder="Sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            disabled={loading}
            trailing={
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                className="rounded p-1.5 text-ink-400 hover:text-ink-50"
                aria-label={mostrarSenha ? "Esconder senha" : "Mostrar senha"}
              >
                {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
        </Field>

        <AnimatePresence>{erro && <FormMessage icon={AlertCircle}>{erro}</FormMessage>}</AnimatePresence>

        <Button type="submit" size="lg" className="mt-2 w-full" loading={loading}>
          {loading ? "Entrando" : "Entrar"}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default Login;
