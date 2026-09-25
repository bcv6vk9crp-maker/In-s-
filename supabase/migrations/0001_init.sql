-- Ines. B — schéma initial
-- À exécuter une fois dans Supabase : SQL Editor > New query > coller > Run.
--
-- Toutes les lectures et écritures passent par le serveur Next.js avec la clé secrète.
-- La sécurité au niveau des lignes (RLS) est activée sans aucune règle : la clé publique
-- (utilisée seulement pour la connexion d'Ines) ne peut donc rien lire ni écrire.

create extension if not exists pgcrypto;

-- Réglages (une seule ligne)
create table public.settings (
  id int primary key default 1 check (id = 1),
  price_small_cents int not null default 3500,   -- tirage 20 × 30
  price_large_cents int not null default 7000,   -- tirage 40 × 60
  frame_small_cents int not null default 5000,   -- supplément cadre 20 × 30
  frame_large_cents int not null default 5000,   -- supplément cadre 40 × 60
  notification_email text,                       -- reçoit les alertes de commande
  contact_email text,                            -- affiché sur la page contact
  instagram text,
  about_fr text not null default '',
  about_en text not null default '',
  contact_intro_fr text not null default '',
  contact_intro_en text not null default '',
  legal_name text not null default '',
  legal_status text not null default '',
  siret text not null default '',
  vat_mention text not null default '',
  legal_address text not null default '',
  updated_at timestamptz not null default now()
);
insert into public.settings (id) values (1);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_fr text not null,
  name_en text not null default '',
  note_fr text not null default '',   -- annotation manuscrite
  note_en text not null default '',
  position int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_fr text not null,
  title_en text not null default '',
  description_fr text not null default '',
  description_en text not null default '',
  year int,
  image_path text not null,           -- chemin dans le bucket "photos" (version web filigranée)
  width int not null,
  height int not null,
  position int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.photo_collections (
  photo_id uuid not null references public.photos(id) on delete cascade,
  collection_id uuid not null references public.collections(id) on delete cascade,
  primary key (photo_id, collection_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number bigint generated always as identity unique,
  status text not null default 'nouvelle'
    check (status in ('nouvelle', 'contactee', 'payee', 'livree', 'annulee')),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  delivery_method text not null check (delivery_method in ('retrait', 'livraison')),
  address_line text,
  postal_code text,
  city text,
  country text,
  message text,
  locale text not null default 'fr',
  consent_at timestamptz not null,
  total_cents int not null,
  internal_notes text not null default '',
  anonymized_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_created_at_idx on public.orders (created_at desc);
create index orders_status_idx on public.orders (status);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  photo_id uuid references public.photos(id) on delete set null,
  photo_title text not null,          -- copie du titre au moment de la commande
  size text not null check (size in ('20x30', '40x60')),
  framed boolean not null,
  unit_price_cents int not null,      -- prix unitaire (tirage + cadre) au moment de la commande
  quantity int not null check (quantity between 1 and 10)
);
create index order_items_order_idx on public.order_items (order_id);

alter table public.settings enable row level security;
alter table public.collections enable row level security;
alter table public.photos enable row level security;
alter table public.photo_collections enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Stockage des images web (filigranées) : lecture publique, écriture par le serveur uniquement.
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;
