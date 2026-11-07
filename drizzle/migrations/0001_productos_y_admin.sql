create type public.app_role as enum ('admin');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Ver mis roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- La primera cuenta que entra queda como Administradora (la dueña).
create or replace function public.primera_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_primera_admin after insert on auth.users
  for each row execute function public.primera_admin();

create table public.productos (
  codigo text primary key,
  data jsonb not null,
  en_boutique boolean not null default true,
  updated_at timestamptz not null default now()
);
grant select on public.productos to anon;
grant select, insert, update, delete on public.productos to authenticated;
grant all on public.productos to service_role;
alter table public.productos enable row level security;
create policy "Vitrina pública" on public.productos for select to anon, authenticated using (en_boutique);
create policy "Admin ve todo" on public.productos for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admin edita" on public.productos for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table public.ajustes_tienda (
  id int primary key default 1 check (id = 1),
  precios jsonb,
  updated_at timestamptz not null default now()
);
grant select on public.ajustes_tienda to anon;
grant select, insert, update on public.ajustes_tienda to authenticated;
grant all on public.ajustes_tienda to service_role;
alter table public.ajustes_tienda enable row level security;
create policy "Precios públicos" on public.ajustes_tienda for select to anon, authenticated using (true);
create policy "Admin edita precios" on public.ajustes_tienda for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

alter publication supabase_realtime add table public.productos;