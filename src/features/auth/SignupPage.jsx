import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, ArrowLeft, ArrowRight, Check, Eye, EyeOff, RefreshCw } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { AuthLayout, FormMessage } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { COL } from "@/lib/collections";

const STEPS = ["Você", "Acesso", "Estudos"];

const formatCPF = (value) =>
  value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");

const formatTelefone = (value) =>
  value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .replace(/(\d{4})-(\d)(\d{4})/, "$1$2-$3")
    .replace(/(-\d{4})\d+?$/, "$1");

function CadastroAluno() {
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
    confirmSenha: "",
    matricula: "",
    nomeCompleto: "",
    dataNascimento: "",
    cpf: "",
    telefone: "",
    emailContato: "",
    nivelEnsino: "",
    anoSerie: "",
    nomeEscola: "",
    turno: "",
    nomeInstituicao: "",
    curso: "",
    semestrePeriodo: "",
    modalidade: "",
  });
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [direcao, setDirecao] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateStep = (step) => {
    const e = {};
    const f = formData;
    if (step === 1) {
      if (!f.nomeCompleto.trim()) e.nomeCompleto = "Informe seu nome completo.";
      if (!f.dataNascimento) e.dataNascimento = "Informe a data de nascimento.";
      if (!f.cpf.trim()) e.cpf = "Informe o CPF.";
      if (!f.telefone.trim()) e.telefone = "Informe um telefone.";
      if (!f.emailContato.trim()) e.emailContato = "Informe um e-mail de contato.";
    }
    if (step === 2) {
      if (!f.email.trim()) e.email = "Informe o e-mail de login.";
      if (f.senha.length < 6) e.senha = "A senha precisa ter pelo menos 6 caracteres.";
      if (f.senha !== f.confirmSenha) e.confirmSenha = "As senhas não coincidem.";
      if (!f.matricula.trim()) e.matricula = "Gere ou informe uma matrícula.";
    }
    if (step === 3) {
      if (!f.nivelEnsino) e.nivelEnsino = "Escolha o nível de ensino.";
      if (f.nivelEnsino === "Ensino Fundamental" || f.nivelEnsino === "Ensino Médio") {
        if (!f.anoSerie.trim()) e.anoSerie = "Informe o ano ou série.";
        if (!f.nomeEscola.trim()) e.nomeEscola = "Informe a escola.";
        if (!f.turno) e.turno = "Escolha o turno.";
      }
      if (f.nivelEnsino === "Ensino Superior") {
        if (!f.nomeInstituicao.trim()) e.nomeInstituicao = "Informe a instituição.";
        if (!f.curso.trim()) e.curso = "Informe o curso.";
        if (!f.semestrePeriodo.trim()) e.semestrePeriodo = "Informe o semestre ou período.";
        if (!f.modalidade) e.modalidade = "Escolha a modalidade.";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setDirecao(1);
      setCurrentStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    setDirecao(-1);
    setCurrentStep((s) => s - 1);
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    if (currentStep < 3) return nextStep();
    if (!validateStep(3)) return;

    setLoading(true);
    setErrors({});
    try {
      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.senha);
      // A senha fica só no Firebase Authentication, nunca no Firestore
      const { senha, confirmSenha, ...perfil } = formData;
      await setDoc(doc(db, COL.alunos, user.uid), {
        uid: user.uid,
        ...perfil,
        criadoEm: new Date().toISOString(),
      });
      // O login automático do Firebase acontece antes do perfil existir: confirma de novo agora
      await refreshUser();
      navigate("/boas-vindas");
    } catch (error) {
      const mensagens = {
        "auth/email-already-in-use": "Este e-mail já está cadastrado.",
        "auth/weak-password": "Senha muito fraca.",
        "auth/invalid-email": "E-mail de login inválido.",
      };
      setErrors({ submit: mensagens[error.code] || "Não deu para criar a conta. Tente de novo." });
    } finally {
      setLoading(false);
    }
  };

  // Gera a matrícula no próprio navegador: ano + 6 caracteres aleatórios (mais de 2 bilhões de combinações).
  // Antes ela era conferida consultando todos os alunos, o que obrigava a coleção a ser pública.
  const gerarMatricula = () => {
    const alfabeto = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    const sufixo = Array.from(bytes, (b) => alfabeto[b % alfabeto.length]).join("");
    updateField("matricula", `MAT-${String(new Date().getFullYear()).slice(-2)}${sufixo}`);
  };

  const campo = (name, label, props = {}) => (
    <Field label={label} error={errors[name]} htmlFor={`cad-${name}`} className={props.className}>
      <Input
        id={`cad-${name}`}
        value={formData[name]}
        onChange={(e) => updateField(name, props.format ? props.format(e.target.value) : e.target.value)}
        aria-invalid={!!errors[name]}
        className={cn(errors[name] && "border-ink-300")}
        disabled={loading}
        {...props.input}
      />
    </Field>
  );

  const seletor = (name, label, opcoes, placeholder) => (
    <Field label={label} error={errors[name]}>
      <Select value={formData[name]} onChange={(e) => updateField(name, e.target.value)} className={cn(errors[name] && "border-ink-300")} disabled={loading}>
        <option value="">{placeholder}</option>
        {opcoes.map((o) => (
          <option key={o.value || o} value={o.value || o}>{o.label || o}</option>
        ))}
      </Select>
    </Field>
  );

  const olho = (
    <button type="button" onClick={() => setShowPassword((v) => !v)} className="rounded p-1.5 text-ink-400 hover:text-ink-50" aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}>
      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );

  const etapas = {
    1: (
      <div className="grid gap-4 sm:grid-cols-2">
        {campo("nomeCompleto", "Nome completo", { className: "sm:col-span-2", input: { placeholder: "Como está no documento", autoComplete: "name" } })}
        {campo("dataNascimento", "Nascimento", { input: { type: "date" } })}
        {campo("cpf", "CPF", { format: formatCPF, input: { placeholder: "000.000.000-00", inputMode: "numeric" } })}
        {campo("telefone", "Telefone", { format: formatTelefone, input: { placeholder: "(00) 00000-0000", inputMode: "tel", autoComplete: "tel" } })}
        {campo("emailContato", "E-mail de contato", { input: { type: "email", placeholder: "voce@email.com" } })}
      </div>
    ),
    2: (
      <div className="grid gap-4">
        {campo("email", "E-mail de login", { input: { type: "email", autoComplete: "email", placeholder: "Usado para entrar" } })}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Senha" error={errors.senha} hint="Mínimo de 6 caracteres.">
            <Input type={showPassword ? "text" : "password"} autoComplete="new-password" value={formData.senha} onChange={(e) => updateField("senha", e.target.value)} trailing={olho} disabled={loading} />
          </Field>
          <Field label="Confirmar senha" error={errors.confirmSenha}>
            <Input type={showPassword ? "text" : "password"} autoComplete="new-password" value={formData.confirmSenha} onChange={(e) => updateField("confirmSenha", e.target.value)} disabled={loading} />
          </Field>
        </div>
        <Field label="Matrícula" error={errors.matricula}>
          <div className="flex gap-2">
            <Input className="flex-1 font-mono" placeholder="MAT-000000" value={formData.matricula} onChange={(e) => updateField("matricula", e.target.value)} disabled={loading} />
            <Button variant="outline" onClick={gerarMatricula}>
              <RefreshCw /> Gerar
            </Button>
          </div>
        </Field>
      </div>
    ),
    3: (
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          {seletor("nivelEnsino", "Nível de ensino", ["Ensino Fundamental", "Ensino Médio", "Ensino Superior"], "Selecione")}
        </div>
        {(formData.nivelEnsino === "Ensino Fundamental" || formData.nivelEnsino === "Ensino Médio") && (
          <>
            {campo("nomeEscola", "Escola", { className: "sm:col-span-2" })}
            {campo("anoSerie", "Ano ou série", { input: { placeholder: "9º ano, 2º ano..." } })}
            {seletor("turno", "Turno", ["Manhã", "Tarde", "Noite"], "Selecione")}
          </>
        )}
        {formData.nivelEnsino === "Ensino Superior" && (
          <>
            {campo("nomeInstituicao", "Instituição", { className: "sm:col-span-2", input: { placeholder: "Universidade ou faculdade" } })}
            {campo("curso", "Curso")}
            {campo("semestrePeriodo", "Semestre ou período", { input: { placeholder: "5º semestre" } })}
            <div className="sm:col-span-2">
              {seletor("modalidade", "Modalidade", [
                { value: "Presencial", label: "Presencial" },
                { value: "EAD", label: "EAD (a distância)" },
                { value: "Híbrido", label: "Híbrido" },
              ], "Selecione")}
            </div>
          </>
        )}
      </div>
    ),
  };

  return (
    <AuthLayout
      wide
      title="Criar conta"
      subtitle="Leva uns dois minutos. Seus dados ficam só na sua conta."
      footer={
        <>
          Já tem conta?{" "}
          <Link to="/login" className="text-ink-50 underline-offset-4 hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      {/* Etapas */}
      <ol className="mb-8 flex items-center gap-2">
        {STEPS.map((nome, i) => {
          const n = i + 1;
          const feito = n < currentStep;
          const ativo = n === currentStep;
          return (
            <li key={nome} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] transition-colors",
                  ativo ? "bg-lime text-ink-950" : feito ? "bg-ink-50 text-ink-950" : "border border-ink-700 text-ink-500"
                )}
              >
                {feito ? <Check className="h-3 w-3" strokeWidth={3} /> : n}
              </span>
              <span className={cn("text-xs", ativo ? "text-ink-50" : "text-ink-500")}>{nome}</span>
              {n < STEPS.length && (
                <span className="relative h-px flex-1 bg-ink-800">
                  <motion.span className="absolute inset-y-0 left-0 bg-ink-50" animate={{ width: feito ? "100%" : "0%" }} />
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <form onSubmit={handleCadastro}>
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direcao} initial={false}>
            <motion.div
              key={currentStep}
              custom={direcao}
              initial={{ opacity: 0, x: direcao * 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direcao * -32 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {etapas[currentStep]}
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {errors.submit && (
            <div className="mt-4">
              <FormMessage icon={AlertCircle}>{errors.submit}</FormMessage>
            </div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex gap-2">
          {currentStep > 1 && (
            <Button variant="outline" size="lg" onClick={prevStep} disabled={loading}>
              <ArrowLeft /> Voltar
            </Button>
          )}
          <Button type="submit" size="lg" className="flex-1" loading={loading}>
            {currentStep < 3 ? (
              <>
                Continuar <ArrowRight />
              </>
            ) : (
              "Criar minha conta"
            )}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}

export default CadastroAluno;
