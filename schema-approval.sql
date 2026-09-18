-- SK@S DIGITAL V7.14 - Google OAuth + Admin Approval
-- Jalankan SEKALI selepas schema.sql dan schema-users.sql.

alter table public.profiles
  add column if not exists status text not null default 'approved';

alter table public.profiles
  drop constraint if exists profiles_status_check;

alter table public.profiles
  add constraint profiles_status_check
  check (status in ('pending','approved','rejected'));

-- Akaun sedia ada dianggap telah diluluskan supaya pengguna lama tidak terkunci.
update public.profiles
set status = 'approved'
where status is null;

-- Pengguna baharu (termasuk Google OAuth) perlu menunggu kelulusan Admin.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, status)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(coalesce(new.email, 'pengguna'), '@', 1)
    ),
    new.email,
    'pending'
  )
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Fungsi status digunakan oleh RLS supaya akaun pending/rejected tidak boleh
-- membaca atau menambah eviden walaupun sudah berjaya authenticate dengan Google/email.
create or replace function public.current_status()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select status from public.profiles where id = auth.uid();
$$;

grant execute on function public.current_status() to authenticated;

-- Admin perlu boleh meluluskan / menolak pengguna.
grant update (full_name, role, status) on public.profiles to authenticated;

drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles
for update to authenticated
using ((select public.current_role()) = 'admin')
with check ((select public.current_role()) = 'admin');

-- Hanya pengguna yang telah diluluskan boleh mengakses eviden.
drop policy if exists evidences_select on public.evidences;
create policy evidences_select on public.evidences
for select to authenticated
using ((select public.current_status()) = 'approved');

drop policy if exists evidences_insert on public.evidences;
create policy evidences_insert on public.evidences
for insert to authenticated
with check ((select public.current_status()) = 'approved' and user_id = auth.uid());

drop policy if exists evidences_update on public.evidences;
create policy evidences_update on public.evidences
for update to authenticated
using (
  (select public.current_status()) = 'approved'
  and (user_id = auth.uid() or (select public.current_role()) in ('admin','nazir'))
)
with check (
  (select public.current_status()) = 'approved'
  and (user_id = auth.uid() or (select public.current_role()) in ('admin','nazir'))
);

drop policy if exists evidences_delete on public.evidences;
create policy evidences_delete on public.evidences
for delete to authenticated
using (
  (select public.current_status()) = 'approved'
  and (user_id = auth.uid() or (select public.current_role()) in ('admin','nazir'))
);

-- Storage Supabase lama turut dihadkan kepada akaun yang telah diluluskan.
drop policy if exists skas_storage_select on storage.objects;
create policy skas_storage_select on storage.objects
for select to authenticated
using (
  bucket_id = 'skas-eviden'
  and (select public.current_status()) = 'approved'
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
  and (select public.current_status()) = 'approved'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists skas_storage_update on storage.objects;
create policy skas_storage_update on storage.objects
for update to authenticated
using (
  bucket_id = 'skas-eviden'
  and (select public.current_status()) = 'approved'
  and ((storage.foldername(name))[1] = auth.uid()::text or (select public.current_role()) in ('admin','nazir'))
)
with check (
  bucket_id = 'skas-eviden'
  and (select public.current_status()) = 'approved'
  and ((storage.foldername(name))[1] = auth.uid()::text or (select public.current_role()) in ('admin','nazir'))
);

drop policy if exists skas_storage_delete on storage.objects;
create policy skas_storage_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'skas-eviden'
  and (select public.current_status()) = 'approved'
  and ((storage.foldername(name))[1] = auth.uid()::text or (select public.current_role()) in ('admin','nazir'))
);
