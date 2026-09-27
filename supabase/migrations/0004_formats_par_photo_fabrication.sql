-- Ines. B — formats possibles par photo, texte de fabrication commun.
-- À exécuter après 0003.

-- Formats proposés pour chaque photo (un 60 × 90 demande un fichier de très bonne
-- qualité). null = tous les formats actifs.
alter table public.photos add column format_ids uuid[];

-- Texte affiché sur toutes les fiches : papier, délai, signature…
alter table public.settings
  add column fabrication_fr text not null default '',
  add column fabrication_en text not null default '';
