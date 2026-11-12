import { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { GraduationCap, Pencil, User } from "lucide-react";
import { db } from "@/lib/firebase";
import { useStudent } from "@/context/StudentContext";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, Select, TextField } from "@/components/ui/field";
import { Avatar, Segmented } from "@/components/ui/primitives";
import { useFeedback } from "@/components/ui/feedback";
import { COL } from "@/lib/collections";

const emptyForm = {
  nome: "",
  emailContato: "",
  telefone: "",
  dataNascimento: "",
  nomeInstituicao: "",
  curso: "",
  semestrePeriodo: "",
  modalidade: "",
  foto: "",
};

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-ink-800 py-3 last:border-0">
      <span className="text-sm text-ink-400">{label}</span>
      <span className="truncate text-right text-sm text-ink-50">{value || <span className="text-ink-600">Não informado</span>}</span>
    </div>
  );
}

export function ProfileDialog({ open, onClose }) {
  const { user, aluno, nome, foto } = useStudent();
  const { toast } = useFeedback();
  const [tab, setTab] = useState("pessoais");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) setEditing(false);
  }, [open]);

  const startEdit = () => {
    setForm({
      nome: aluno?.nome || nome || "",
      emailContato: aluno?.emailContato || user?.email || "",
      telefone: aluno?.telefone || "",
      dataNascimento: aluno?.dataNascimento || "",
      nomeInstituicao: aluno?.nomeInstituicao || "",
      curso: aluno?.curso || "",
      semestrePeriodo: aluno?.semestrePeriodo || "",
      modalidade: aluno?.modalidade || "",
      foto: aluno?.foto || foto || "",
    });
    setEditing(true);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, COL.alunos, user.uid), form);
      setEditing(false);
      toast({ title: "Perfil atualizado", tone: "success" });
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      toast({ title: "Não foi possível salvar", description: "Tente novamente em instantes.", tone: "error" });
    } finally {
      setSaving(false);
    }
  };

  const displayName = (editing ? form.nome : aluno?.nome) || nome || "Estudante";
  const subtitle = aluno?.curso
    ? `${aluno.curso}${aluno.nomeInstituicao ? ` · ${aluno.nomeInstituicao}` : ""}`
    : aluno?.emailContato || user?.email;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Perfil"
      size="md"
      footer={
        editing ? (
          <>
            <Button variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={save} loading={saving}>
              Salvar alterações
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={startEdit}>
            <Pencil /> Editar perfil
          </Button>
        )
      }
    >
      <div className="flex items-center gap-4">
        <Avatar src={editing ? form.foto : aluno?.foto || foto} name={displayName} className="h-14 w-14 text-base" />
        <div className="min-w-0">
          <p className="truncate text-lg font-medium tracking-tight">{displayName}</p>
          <p className="truncate text-sm text-ink-400">{subtitle}</p>
        </div>
      </div>

      <Segmented
        className="mt-6 w-full"
        layoutId="perfil-tab"
        value={tab}
        onChange={setTab}
        options={[
          { value: "pessoais", label: "Dados pessoais", icon: User },
          { value: "academicos", label: "Acadêmico", icon: GraduationCap },
        ]}
      />

      <div className="mt-5">
        {!editing && tab === "pessoais" && (
          <div>
            <Row label="Nome" value={aluno?.nome || nome} />
            <Row label="E-mail da conta" value={user?.email} />
            <Row label="E-mail de contato" value={aluno?.emailContato} />
            <Row label="Telefone" value={aluno?.telefone} />
            <Row
              label="Nascimento"
              value={aluno?.dataNascimento && new Date(`${aluno.dataNascimento}T12:00:00`).toLocaleDateString("pt-BR")}
            />
          </div>
        )}
        {!editing && tab === "academicos" && (
          <div>
            <Row label="Instituição" value={aluno?.nomeInstituicao} />
            <Row label="Curso" value={aluno?.curso} />
            <Row label="Semestre / período" value={aluno?.semestrePeriodo} />
            <Row label="Modalidade" value={aluno?.modalidade} />
          </div>
        )}

        {editing && tab === "pessoais" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField className="sm:col-span-2" label="Nome completo" value={form.nome} onChange={set("nome")} />
            <TextField className="sm:col-span-2" label="E-mail da conta" value={user?.email || ""} disabled hint="Não pode ser alterado aqui." />
            <TextField label="E-mail de contato" type="email" value={form.emailContato} onChange={set("emailContato")} />
            <TextField label="Telefone" type="tel" value={form.telefone} onChange={set("telefone")} />
            <TextField label="Nascimento" type="date" value={form.dataNascimento} onChange={set("dataNascimento")} />
            <TextField label="Foto (link da imagem)" type="url" placeholder="https://..." value={form.foto} onChange={set("foto")} />
          </div>
        )}
        {editing && tab === "academicos" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField className="sm:col-span-2" label="Instituição de ensino" value={form.nomeInstituicao} onChange={set("nomeInstituicao")} />
            <TextField label="Curso" value={form.curso} onChange={set("curso")} />
            <TextField label="Semestre / período" value={form.semestrePeriodo} onChange={set("semestrePeriodo")} />
            <Field label="Modalidade" className="sm:col-span-2">
              <Select value={form.modalidade} onChange={set("modalidade")}>
                <option value="">Selecione</option>
                <option value="Presencial">Presencial</option>
                <option value="EAD">EAD</option>
                <option value="Semipresencial">Semipresencial</option>
              </Select>
            </Field>
          </div>
        )}
      </div>
    </Dialog>
  );
}
