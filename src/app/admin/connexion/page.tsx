import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { currentAdminEmail } from "@/lib/supabase/auth";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

export default async function LoginPage(props: PageProps<"/admin/connexion">) {
  if (await currentAdminEmail()) redirect("/admin");
  const { lien } = await props.searchParams;
  return (
    <div className="login">
      <LoginForm expiredLink={lien === "expire"} />
    </div>
  );
}
