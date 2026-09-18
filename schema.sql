-- SK@S DIGITAL V7 - Supabase setup
-- Run this entire script in Supabase SQL Editor.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'guru' check (role in ('guru','nazir','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.evidences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_ids text[] not null default '{}',
  target_label text,
  title text not null,
  category text not null,
  owner text,
  evidence_date date,
  url text,
  note text,
  file_path text,
  file_name text,
  file_type text,
  file_size bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists evidences_target_ids_idx on public.evidences using gin(target_ids);
create index if not exists evidences_created_at_idx on public.evidences(created_at desc);

-- Create profile automatically for every new Auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

grant execute on function public.current_role() to authenticated;

alter table public.profiles enable row level security;
alter table public.evidences enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.evidences from anon, authenticated;
grant select on table public.profiles to authenticated;
grant select, insert, update, delete on table public.evidences to authenticated;

-- Users can see their own profile; admin/nazir can see profiles for administration.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
for select to authenticated
using (id = auth.uid() or (select public.current_role()) in ('admin','nazir'));

-- All signed-in users can see school evidences.
drop policy if exists evidences_select on public.evidences;
create policy evidences_select on public.evidences
for select to authenticated
using (true);

-- Signed-in users can add evidence only as themselves.
drop policy if exists evidences_insert on public.evidences;
create policy evidences_insert on public.evidences
for insert to authenticated
with check (user_id = auth.uid());

-- Owner can edit; admin/nazir can edit any.
drop policy if exists evidences_update on public.evidences;
create policy evidences_update on public.evidences
for update to authenticated
using (user_id = auth.uid() or (select public.current_role()) in ('admin','nazir'))
with check (user_id = auth.uid() or (select public.current_role()) in ('admin','nazir'));

-- Owner, admin or nazir can delete.
drop policy if exists evidences_delete on public.evidences;
create policy evidences_delete on public.evidences
for delete to authenticated
using (user_id = auth.uid() or (select public.current_role()) in ('admin','nazir'));

-- Storage bucket. Create it as private.
insert into storage.buckets (id, name, public)
values ('skas-eviden', 'skas-eviden', false)
on conflict (id) do update set public = false;

-- Storage path convention: user_id/uuid_filename
-- Any authenticated user may upload only into their own first path segment.
drop policy if exists skas_storage_select on storage.objects;
create policy skas_storage_select on storage.objects
for select to authenticated
using (
  bucket_id = 'skas-eviden'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or (select public.current_role()) in ('admin','nazir')
  )
);

drop policy if exists skas_storage_insert on storage.objects;
create policy skas_storage_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'skas-eviden'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists skas_storage_update on storage.objects;
create policy skas_storage_update on storage.objects
for update to authenticated
using (
  bucket_id = 'skas-eviden'
  and ((storage.foldername(name))[1] = auth.uid()::text or (select public.current_role()) in ('admin','nazir'))
)
with check (
  bucket_id = 'skas-eviden'
  and ((storage.foldername(name))[1] = auth.uid()::text or (select public.current_role()) in ('admin','nazir'))
);

drop policy if exists skas_storage_delete on storage.objects;
create policy skas_storage_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'skas-eviden'
  and ((storage.foldername(name))[1] = auth.uid()::text or (select public.current_role()) in ('admin','nazir'))
);

-- After the first admin account is created, run e.g.:
-- update public.profiles set role='admin' where id='USER-UUID-HERE';
-- Then set other users to guru/nazir as required.
