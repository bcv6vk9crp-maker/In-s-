"use client";

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card stack">
      <h1 style={{ fontSize: 24 }}>Une erreur est survenue</h1>
      <p className="muted">L&apos;opération n&apos;a pas abouti. Réessayez ; si le problème persiste, notez ce message :</p>
      <pre style={{ whiteSpace: "pre-wrap", fontSize: 13 }}>{error.message}</pre>
      <div>
        <button type="button" className="btn btn-plum btn-small" onClick={reset}>
          Réessayer
        </button>
      </div>
    </div>
  );
}
