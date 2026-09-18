-- SK@S Digital V7.9 - Pengurusan Pengguna
-- Jalankan SEKALI di Supabase SQL Editor selepas schema.sql.

alter table public.profiles
  add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

-- Gantikan trigger supaya email pengguna baharu turut disimpan dalam profiles.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Hanya Admin boleh mengubah nama/role pengguna melalui aplikasi.
grant update (full_name, role) on public.profiles to authenticated;

drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles
for update to authenticated
using ((select public.current_role()) = 'admin')
with check ((select public.current_role()) = 'admin');

-- Pastikan email tidak boleh diubah melalui aplikasi.
