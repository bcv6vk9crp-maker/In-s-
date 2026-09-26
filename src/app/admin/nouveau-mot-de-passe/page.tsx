import type { Metadata } from "next";
import { NewPasswordForm } from "@/components/admin/PasswordForms";
import { requireAdmin } from "@/lib/supabase/auth";

export const metadata: Metadata = { title: "Nouveau mot de passe", robots: { index: false } };

export default async function NewPasswordPage() {
  await requireAdmin();
  return (
    <div className="login">
      <NewPasswordForm />
    </div>
  );
}
