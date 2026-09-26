import type { Metadata } from "next";
import { PasswordResetForm } from "@/components/admin/PasswordForms";

export const metadata: Metadata = { title: "Mot de passe oublié", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <div className="login">
      <PasswordResetForm />
    </div>
  );
}
