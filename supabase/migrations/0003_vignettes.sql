-- Ines. B — vignette séparée pour la galerie.
-- La grande image (fiche) est filigranée sur toute sa surface ; la galerie affiche
-- une vignette plus petite, signée dans le coin. À exécuter après 0002.
alter table public.photos add column thumb_path text;
