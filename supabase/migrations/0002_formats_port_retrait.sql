-- Ines. B — formats gérés dans l'admin, frais de port, lieu de retrait.
-- À exécuter après 0001_init.sql (SQL Editor > New query > coller > Run).

-- Formats de tirage : Ines en propose de 2 à 4, du classique au grand format.
create table public.formats (
  id uuid primary key default gen_random_uuid(),
  label text not null,                     -- ex. « 20 × 30 cm »
  price_cents int not null check (price_cents >= 0),
  frame_cents int not null check (frame_cents >= 0),       -- supplément cadre
  shipping_cents int not null check (shipping_cents >= 0), -- forfait de port
  position int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.formats enable row level security;

insert into public.formats (label, price_cents, frame_cents, shipping_cents, position) values
  ('20 × 30 cm', 3500, 600, 600, 1),
  ('30 × 45 cm', 5000, 800, 800, 2),
  ('40 × 60 cm', 7000, 1000, 1200, 3),
  ('60 × 90 cm', 12000, 1200, 1800, 4);

-- Lignes de commande : le format devient une référence + une copie de son nom.
alter table public.order_items add column format_id uuid references public.formats(id) on delete set null;
alter table public.order_items add column format_label text;
update public.order_items set format_label = case size when '20x30' then '20 × 30 cm' else '40 × 60 cm' end;
update public.order_items i set format_id = f.id from public.formats f where f.label = i.format_label;
alter table public.order_items alter column format_label set not null;
alter table public.order_items drop column size;

-- Frais de port de la commande (0 en retrait). total_cents inclut désormais le port.
alter table public.orders add column shipping_cents int not null default 0;

-- Réglages : les prix passent dans la table des formats ; ajout du lieu de retrait.
alter table public.settings
  drop column price_small_cents,
  drop column price_large_cents,
  drop column frame_small_cents,
  drop column frame_large_cents,
  add column pickup_location text not null default '';
