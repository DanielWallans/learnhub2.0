import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { AlertTriangle, Bug, Lightbulb } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea, TextField } from "@/components/ui/field";
import { Segmented } from "@/components/ui/primitives";
import { useFeedback } from "@/components/ui/feedback";
import { COL } from "@/lib/collections";

const initial = {
  tipo: "bug",
  titulo: "",
  descricao: "",
  passos: "",
  navegador: "",
  dispositivo: "",
  prioridade: "media",
};

export function BugReportDialog({ open, onClose }) {
  const { toast } = useFeedback();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.descricao.trim()) {
      setError("Preencha pelo menos o título e a descrição.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, COL.bugReports), {
        ...form,
        userId: user?.uid || "anonimo",
        userEmail: user?.email || "não informado",
        timestamp: serverTimestamp(),
        status: "aberto",
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
      toast({ title: "Relatório enviado", description: "Obrigado por ajudar a melhorar o LearnHub.", tone: "success" });
      setForm(initial);
      onClose();
    } catch (err) {
      console.error("Erro ao enviar relatório:", err);
      setError("Não foi possível enviar agora. Tente novamente.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Reportar um problema"
      description="Conte o que aconteceu. A gente lê tudo."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={sending}>
            Cancelar
          </Button>
          <Button type="submit" form="bug-form" loading={sending}>
            Enviar relatório
          </Button>
        </>
      }
    >
      <form id="bug-form" onSubmit={submit} className="flex flex-col gap-4">
        <Segmented
          className="w-full"
          layoutId="bug-tipo"
          value={form.tipo}
          onChange={(tipo) => setForm((f) => ({ ...f, tipo }))}
          options={[
            { value: "bug", label: "Erro", icon: Bug },
            { value: "melhoria", label: "Sugestão", icon: Lightbulb },
            { value: "problema", label: "Problema", icon: AlertTriangle },
          ]}
        />
        <TextField label="Título" placeholder="Resumo em uma frase" value={form.titulo} onChange={set("titulo")} />
        <Field label="Descrição">
          <Textarea
            rows={4}
            placeholder="O que aconteceu? O que você esperava que acontecesse?"
            value={form.descricao}
            onChange={set("descricao")}
          />
        </Field>
        <Field label="Passos para reproduzir" hint="Opcional">
          <Textarea rows={3} placeholder={"1. Abri...\n2. Cliquei em...\n3. Apareceu..."} value={form.passos} onChange={set("passos")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Navegador" placeholder="Chrome, Safari..." value={form.navegador} onChange={set("navegador")} />
          <TextField label="Dispositivo" placeholder="Notebook, celular..." value={form.dispositivo} onChange={set("dispositivo")} />
        </div>
        <Field label="Prioridade">
          <Select value={form.prioridade} onChange={set("prioridade")}>
            <option value="baixa">Baixa: não atrapalha o uso</option>
            <option value="media">Média: atrapalha em parte</option>
            <option value="alta">Alta: impede o uso</option>
          </Select>
        </Field>
        {error && <p className="rounded-lg border border-ink-700 bg-ink-850 px-3 py-2.5 text-sm text-ink-50">{error}</p>}
      </form>
    </Dialog>
  );
}
