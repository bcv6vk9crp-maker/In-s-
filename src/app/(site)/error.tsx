"use client";

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="empty">
      <span className="hand" style={{ fontSize: 28 }}>
        Oups…
      </span>
      <p className="muted">
        Un problème technique empêche l&apos;affichage de cette page. · A technical problem prevents this page from
        loading.
      </p>
      <button type="button" className="btn" onClick={reset}>
        Réessayer · Try again
      </button>
    </div>
  );
}
