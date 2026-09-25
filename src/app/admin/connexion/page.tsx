import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { currentAdminEmail } from "@/lib/supabase/auth";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

export default async function LoginPage() {
  if (await currentAdminEmail()) redirect("/admin");
  return (
    <div className="login">
      <LoginForm />
    </div>
  );
}
