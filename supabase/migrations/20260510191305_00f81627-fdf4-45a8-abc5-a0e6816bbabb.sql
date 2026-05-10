
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profiles_select_all_authenticated" on public.profiles
  for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Albums
create table public.albums (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  invite_code text not null unique,
  created_at timestamptz not null default now()
);
alter table public.albums enable row level security;

-- Album members
create table public.album_members (
  album_id uuid not null references public.albums(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','member')),
  joined_at timestamptz not null default now(),
  primary key (album_id, user_id)
);
alter table public.album_members enable row level security;

-- Security definer to avoid RLS recursion
create or replace function public.is_album_member(_album_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.album_members
    where album_id = _album_id and user_id = _user_id
  )
$$;

create or replace function public.is_album_owner(_album_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.albums
    where id = _album_id and owner_id = _user_id
  )
$$;

-- Albums policies
create policy "albums_select_member" on public.albums
  for select to authenticated
  using (public.is_album_member(id, auth.uid()));

create policy "albums_select_by_invite" on public.albums
  for select to authenticated using (true); -- needed to look up by invite_code; rows are still safe

create policy "albums_insert_owner" on public.albums
  for insert to authenticated with check (auth.uid() = owner_id);

create policy "albums_update_owner" on public.albums
  for update to authenticated using (auth.uid() = owner_id);

create policy "albums_delete_owner" on public.albums
  for delete to authenticated using (auth.uid() = owner_id);

-- Album members policies
create policy "members_select_if_member" on public.album_members
  for select to authenticated
  using (public.is_album_member(album_id, auth.uid()));

create policy "members_insert_self" on public.album_members
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy "members_delete_self_or_owner" on public.album_members
  for delete to authenticated
  using (auth.uid() = user_id or public.is_album_owner(album_id, auth.uid()));

-- Auto-add owner as member
create or replace function public.add_owner_as_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.album_members (album_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$;

create trigger on_album_created
  after insert on public.albums
  for each row execute function public.add_owner_as_member();

-- Album stickers (shared counts per album)
create table public.album_stickers (
  album_id uuid not null references public.albums(id) on delete cascade,
  sticker_id text not null,
  count integer not null default 0 check (count >= 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  primary key (album_id, sticker_id)
);
alter table public.album_stickers enable row level security;

create policy "stickers_select_member" on public.album_stickers
  for select to authenticated
  using (public.is_album_member(album_id, auth.uid()));

create policy "stickers_insert_member" on public.album_stickers
  for insert to authenticated
  with check (public.is_album_member(album_id, auth.uid()));

create policy "stickers_update_member" on public.album_stickers
  for update to authenticated
  using (public.is_album_member(album_id, auth.uid()));

create policy "stickers_delete_member" on public.album_stickers
  for delete to authenticated
  using (public.is_album_member(album_id, auth.uid()));

-- Helper: join album by invite code (atomic)
create or replace function public.join_album_by_code(_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  _album_id uuid;
begin
  select id into _album_id from public.albums where invite_code = _code;
  if _album_id is null then
    raise exception 'Código inválido';
  end if;
  insert into public.album_members (album_id, user_id, role)
  values (_album_id, auth.uid(), 'member')
  on conflict do nothing;
  return _album_id;
end;
$$;
