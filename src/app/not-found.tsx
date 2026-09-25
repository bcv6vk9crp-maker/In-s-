import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container empty">
      <span className="hand" style={{ fontSize: 30 }}>
        Page introuvable
      </span>
      <p className="muted">Cette page n&apos;existe pas ou plus. · This page does not exist.</p>
      <Link href="/" className="btn">
        Retour à la galerie
      </Link>
    </main>
  );
}
