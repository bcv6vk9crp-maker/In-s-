"use client";

import { useActionState, useState, useTransition } from "react";
import { savePhoto } from "@/app/admin/actions";
import type { Collection, Photo } from "@/lib/data";

const MAX_EDGE = 1600;
const THUMB_EDGE = 900;
const WATERMARK = "© Ines. B";

type Rendered = { blob: Blob; width: number; height: number; url: string };
type Processed = { large: Rendered; thumb: Rendered };

function toJpeg(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Conversion impossible"))), "image/jpeg", quality),
  );
}

/** Signature discrète en bas à droite. */
function drawCornerMark(ctx: CanvasRenderingContext2D, width: number, height: number, family: string) {
  const fontSize = Math.max(14, Math.round(Math.max(width, height) * 0.022));
  ctx.save();
  ctx.font = `600 ${fontSize}px ${family}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = fontSize / 4;
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  const margin = Math.round(fontSize * 0.9);
  ctx.fillText(WATERMARK, width - margin, height - margin);
  ctx.restore();
}

/**
 * Filigrane répété en diagonale sur toute la photo : une capture d'écran de la
 * grande image reste marquée partout. Texte clair cerné de sombre pour rester
 * visible sur les zones claires (neige, ciel) comme sur les zones sombres.
 */
function drawTiledMark(ctx: CanvasRenderingContext2D, width: number, height: number, family: string) {
  const fontSize = Math.max(18, Math.round(Math.max(width, height) * 0.032));
  ctx.save();
  ctx.font = `600 ${fontSize}px ${family}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(1, fontSize / 22);
  ctx.strokeStyle = "rgba(0, 0, 0, 0.16)";
  ctx.fillStyle = "rgba(255, 255, 255, 0.26)";
  ctx.translate(width / 2, height / 2);
  ctx.rotate(-Math.PI / 7);
  const stepX = ctx.measureText(WATERMARK).width * 1.7;
  const stepY = fontSize * 3.6;
  const reach = Math.hypot(width, height) / 2 + stepX;
  for (let row = 0, y = -reach; y <= reach; y += stepY, row++) {
    const offset = row % 2 ? stepX / 2 : 0; // quinconce
    for (let x = -reach + offset; x <= reach; x += stepX) {
      ctx.strokeText(WATERMARK, x, y);
      ctx.fillText(WATERMARK, x, y);
    }
  }
  ctx.restore();
}

async function render(bitmap: ImageBitmap, maxEdge: number, tiled: boolean, family: string): Promise<Rendered> {
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible");
  ctx.drawImage(bitmap, 0, 0, width, height);
  if (tiled) drawTiledMark(ctx, width, height, family);
  drawCornerMark(ctx, width, height, family);
  let blob = await toJpeg(canvas, 0.85);
  if (blob.size > 3 * 1024 * 1024) blob = await toJpeg(canvas, 0.72);
  return { blob, width, height, url: URL.createObjectURL(blob) };
}

/**
 * Prépare les deux versions dans le navigateur d'Ines (l'original ne quitte jamais
 * son ordinateur) : une vignette pour la galerie, signée dans le coin, et une grande
 * image pour la fiche, filigranée sur toute sa surface.
 */
async function processImage(file: File): Promise<Processed> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  await document.fonts.ready;
  const family = getComputedStyle(document.body).fontFamily;
  try {
    const large = await render(bitmap, MAX_EDGE, true, family);
    const thumb = await render(bitmap, THUMB_EDGE, false, family);
    return { large, thumb };
  } finally {
    bitmap.close();
  }
}

export function PhotoForm({ photo, collections }: { photo: Photo | null; collections: Collection[] }) {
  const [state, formAction, saving] = useActionState(savePhoto.bind(null, photo?.id ?? null), undefined);
  const [processed, setProcessed] = useState<Processed | null>(null);
  const [processing, setProcessing] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const pending = saving || processing;

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setImageError(null);
    if (processed) {
      URL.revokeObjectURL(processed.large.url);
      URL.revokeObjectURL(processed.thumb.url);
    }
    setProcessed(null);
    if (!file) return;
    setProcessing(true);
    try {
      setProcessed(await processImage(file));
    } catch {
      setImageError("Cette image n'a pas pu être lue. Essayez un fichier JPEG ou PNG.");
    } finally {
      setProcessing(false);
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!photo && !processed) {
      setImageError("Choisissez une image.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    fd.delete("source");
    if (processed) {
      fd.set("image", new File([processed.large.blob], "photo.jpg", { type: "image/jpeg" }));
      fd.set("thumb", new File([processed.thumb.blob], "vignette.jpg", { type: "image/jpeg" }));
      fd.set("width", String(processed.large.width));
      fd.set("height", String(processed.large.height));
    }
    startTransition(() => formAction(fd));
  }

  const preview = processed?.large.url ?? photo?.image_url;

  return (
    <form className="card form-grid" onSubmit={onSubmit}>
      <div className="field-row" style={{ alignItems: "start" }}>
        <div className="form-grid">
          <label className="field">
            <span>{photo ? "Remplacer l'image" : "Image"}</span>
            <input id="source" name="source" type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} />
            <span className="hint">
              Envoyez l&apos;original : le site prépare une vignette pour la galerie et une grande image de {MAX_EDGE} px
              couverte du filigrane « {WATERMARK} », automatiquement. L&apos;original n&apos;est jamais mis en ligne.
            </span>
          </label>
          {processing && <p className="muted">Préparation de l&apos;image…</p>}
          {imageError && <p className="alert">{imageError}</p>}
        </div>
        {preview && (
          <div className="photo-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Aperçu" />
          </div>
        )}
      </div>

      <div className="field-row">
        <label className="field">
          <span>Titre (français)</span>
          <input id="title_fr" name="title_fr" required maxLength={120} defaultValue={photo?.title_fr} />
        </label>
        <label className="field">
          <span>Titre (anglais)</span>
          <input id="title_en" name="title_en" maxLength={120} defaultValue={photo?.title_en} />
          <span className="hint">Facultatif : le titre français est utilisé sinon.</span>
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span>Description (français)</span>
          <textarea id="description_fr" name="description_fr" maxLength={3000} defaultValue={photo?.description_fr} />
        </label>
        <label className="field">
          <span>Description (anglais)</span>
          <textarea id="description_en" name="description_en" maxLength={3000} defaultValue={photo?.description_en} />
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span>Année</span>
          <input id="year" name="year" inputMode="numeric" maxLength={4} defaultValue={photo?.year ?? ""} />
        </label>
        <label className="field">
          <span>Ordre d&apos;affichage</span>
          <input id="position" name="position" inputMode="numeric" defaultValue={photo?.position ?? 0} />
          <span className="hint">Les plus petits nombres apparaissent en premier.</span>
        </label>
      </div>

      <fieldset className="fieldset">
        <legend>Collections</legend>
        {collections.length === 0 ? (
          <p className="muted">Aucune collection. Vous pouvez en créer dans l&apos;onglet Collections.</p>
        ) : (
          <div className="checks">
            {collections.map((c) => (
              <label key={c.id} className="check">
                <input
                  type="checkbox"
                  name="collections"
                  value={c.id}
                  defaultChecked={photo?.collection_ids.includes(c.id)}
                />
                <span>{c.name_fr}</span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <label className="check">
        <input id="visible" type="checkbox" name="visible" defaultChecked={photo?.visible ?? true} />
        <span>Visible sur le site</span>
      </label>

      {state?.error && <p className="alert">{state.error}</p>}
      <div>
        <button className="btn btn-plum" disabled={pending}>
          {saving ? "Enregistrement…" : photo ? "Enregistrer" : "Ajouter la photo"}
        </button>
      </div>
    </form>
  );
}
