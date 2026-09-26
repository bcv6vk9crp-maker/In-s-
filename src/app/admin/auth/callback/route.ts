import { NextResponse, type NextRequest } from "next/server";
import { authClient } from "@/lib/supabase/auth";

// Lien reçu par email (mot de passe oublié) : ouvre la session puis mène au choix du nouveau mot de passe.
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const target = "/admin/nouveau-mot-de-passe";

  if (code) {
    const supabase = await authClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(target, url.origin));
  }
  return NextResponse.redirect(new URL("/admin/connexion?lien=expire", url.origin));
}
