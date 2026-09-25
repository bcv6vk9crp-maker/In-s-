import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";

/** Client lié aux cookies de session, utilisé uniquement pour la connexion d'Ines. */
export async function authClient() {
  const cookieStore = await cookies();
  return createServerClient(env.supabaseUrl, env.supabasePublishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Appelé depuis un composant serveur : le proxy rafraîchit la session.
        }
      },
    },
  });
}

export async function currentAdminEmail(): Promise<string | null> {
  const supabase = await authClient();
  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email.toLowerCase() : null;
  return email && email === env.adminEmail ? email : null;
}

/** À appeler en tête de chaque page et action de l'espace admin. */
export async function requireAdmin(): Promise<string> {
  const email = await currentAdminEmail();
  if (!email) redirect("/admin/connexion");
  return email;
}
