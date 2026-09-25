import "server-only";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variable d'environnement manquante : ${name}`);
  return value;
}

export const env = {
  get supabaseUrl() {
    return required("NEXT_PUBLIC_SUPABASE_URL");
  },
  get supabasePublishableKey() {
    return required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  },
  get supabaseSecretKey() {
    return required("SUPABASE_SECRET_KEY");
  },
  get adminEmail() {
    return required("ADMIN_EMAIL").trim().toLowerCase();
  },
  resendApiKey: process.env.RESEND_API_KEY || "",
  emailFrom: process.env.EMAIL_FROM || "Ines. B <onboarding@resend.dev>",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  cronSecret: process.env.CRON_SECRET || "",
};
