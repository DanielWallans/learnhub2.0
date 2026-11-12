import React from 'react';
import { Field, Select, Textarea, TextField } from '@/components/ui/field';

export function VagaForm({ id, value, onChange, onSubmit }) {
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
  return (
    <form id={id} onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <TextField label="Empresa" placeholder="Google" value={value.empresa} onChange={set('empresa')} required autoFocus />
      <TextField label="Vaga" placeholder="Dev React" value={value.vaga} onChange={set('vaga')} required />
      <Field label="Contrato">
        <Select value={value.tipoVaga} onChange={set('tipoVaga')}>
          {['Estágio', 'CLT', 'PJ', 'Trainee', 'Freelance'].map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
      </Field>
      <Field label="Modalidade">
        <Select value={value.modalidade} onChange={set('modalidade')}>
          {['Remoto', 'Híbrido', 'Presencial'].map((m) => <option key={m} value={m}>{m}</option>)}
        </Select>
      </Field>
      <TextField label="Salário ou bolsa" placeholder="R$ 2.000" value={value.salario} onChange={set('salario')} />
      <TextField label="Local" placeholder="São Paulo/SP" value={value.localizacao} onChange={set('localizacao')} />
      <TextField className="sm:col-span-2" label="Link da vaga" type="url" placeholder="https://..." value={value.linkVaga} onChange={set('linkVaga')} />
      <TextField className="sm:col-span-2" label="Requisitos principais" placeholder="React, Docker, inglês..." value={value.requisitos} onChange={set('requisitos')} />
      <Field label="Anotações" className="sm:col-span-2">
        <Textarea value={value.observacoes} onChange={set('observacoes')} placeholder="Contatos, datas, impressões..." />
      </Field>
    </form>
  );
}
