-- Esquema do LearnHub no Supabase.
-- Rode uma vez no SQL Editor do projeto (Dashboard > SQL Editor > New query > Run).
-- Cada módulo tem a própria tabela; o conteúdo do registro fica em "data" (jsonb)
-- e "user_id" diz de quem é. As políticas RLS garantem que cada pessoa só vê os próprios dados.

do $$
declare
  t text;
  tabelas text[] := array[
    'alunos', 'usuarios', 'financas_resumo', 'leitura', 'financas_transacoes',
    'habilidades', 'candidaturas', 'carreira_metas', 'tarefas', 'listas', 'projetos'
  ];
begin
  foreach t in array tabelas loop
    execute format($f$
      create table if not exists public.%1$I (
        id text primary key,
        user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
        data jsonb not null default '{}'::jsonb,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );
      create index if not exists %2$I on public.%1$I (user_id);
      alter table public.%1$I enable row level security;
      drop policy if exists "dono" on public.%1$I;
      create policy "dono" on public.%1$I for all to authenticated
        using (user_id = auth.uid()) with check (user_id = auth.uid());
      alter table public.%1$I replica identity full;
    $f$, t, t || '_user_id_idx');

    -- Tempo real (o app atualiza a tela quando os dados mudam)
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- Relatórios de problema: qualquer pessoa logada envia, ninguém lê pelo app
create table if not exists public.bug_reports (
  id text primary key,
  user_id uuid default auth.uid() references auth.users (id) on delete set null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.bug_reports enable row level security;
drop policy if exists "enviar" on public.bug_reports;
create policy "enviar" on public.bug_reports for insert to authenticated with check (true);

-- Atualização parcial (equivalente ao updateDoc / setDoc com merge do Firestore):
-- junta os campos novos com os que já existem, criando o registro se ainda não existir.
-- "security invoker": roda com as permissões de quem chamou, então o RLS continua valendo.
create or replace function public.merge_doc(p_table text, p_id text, p_patch jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if p_table not in (
    'alunos', 'usuarios', 'financas_resumo', 'leitura', 'financas_transacoes',
    'habilidades', 'candidaturas', 'carreira_metas', 'tarefas', 'listas', 'projetos'
  ) then
    raise exception 'tabela inválida: %', p_table;
  end if;
  execute format(
    'insert into public.%1$I as t (id, data) values ($1, $2)
     on conflict (id) do update set data = t.data || excluded.data, updated_at = now()',
    p_table
  ) using p_id, p_patch;
end;
$$;

revoke execute on function public.merge_doc(text, text, jsonb) from public, anon;
grant execute on function public.merge_doc(text, text, jsonb) to authenticated;

-- Permissões das tabelas (projetos novos do Supabase não concedem acesso automaticamente).
-- O RLS acima continua decidindo quais linhas cada pessoa vê.
grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on
  public.alunos, public.usuarios, public.financas_resumo, public.leitura, public.financas_transacoes,
  public.habilidades, public.candidaturas, public.carreira_metas, public.tarefas, public.listas, public.projetos
  to authenticated, service_role;
grant insert on public.bug_reports to authenticated;
grant all on public.bug_reports to service_role;
