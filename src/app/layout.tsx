import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { getLocale } from "@/lib/locale";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext"],
});


export const metadata: Metadata = {
  title: { default: "Ines. B — Photographie", template: "%s · Ines. B" },
  description: "Tirages d'art photographiques d'Ines. B, en 20 × 30 et 40 × 60 cm, avec ou sans cadre.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={bricolage.variable}>
      <body>{children}</body>
    </html>
  );
}
