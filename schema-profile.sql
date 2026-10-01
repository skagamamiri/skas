-- SK@S DIGITAL - Modul Profil / Maklumat Guru
-- Jalankan SEKALI di Supabase SQL Editor selepas schema-approval.sql.

create table if not exists public.profile_information (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null default 'Lain-lain',
  owner text,
  information_date date,
  url text,
  note text,
  file_path text,
  file_name text,
  file_type text,
  file_size bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profile_information_user_id_idx
  on public.profile_information(user_id);

create index if not exists profile_information_created_at_idx
  on public.profile_information(created_at desc);

alter table public.profile_information enable row level security;

revoke all on table public.profile_information from anon, authenticated;
grant select, insert, update, delete on table public.profile_information to authenticated;

drop policy if exists profile_information_select on public.profile_information;
create policy profile_information_select
on public.profile_information
for select to authenticated
using (
  (select public.current_status()) = 'approved'
  and (
    user_id = auth.uid()
    or (select public.current_role()) in ('admin','nazir')
  )
);

drop policy if exists profile_information_insert on public.profile_information;
create policy profile_information_insert
on public.profile_information
for insert to authenticated
with check (
  (select public.current_status()) = 'approved'
  and user_id = auth.uid()
);

drop policy if exists profile_information_update on public.profile_information;
create policy profile_information_update
on public.profile_information
for update to authenticated
using (
  (select public.current_status()) = 'approved'
  and (
    user_id = auth.uid()
    or (select public.current_role()) in ('admin','nazir')
  )
)
with check (
  (select public.current_status()) = 'approved'
  and (
    user_id = auth.uid()
    or (select public.current_role()) in ('admin','nazir')
  )
);

drop policy if exists profile_information_delete on public.profile_information;
create policy profile_information_delete
on public.profile_information
for delete to authenticated
using (
  (select public.current_status()) = 'approved'
  and (
    user_id = auth.uid()
    or (select public.current_role()) in ('admin','nazir')
  )
);

comment on table public.profile_information is 'Maklumat profil guru SK@S Digital. Fail sebenar boleh disimpan di Google Drive; url disimpan di Supabase.';
