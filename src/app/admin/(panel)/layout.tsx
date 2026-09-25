import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/supabase/auth";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="admin">
      <AdminNav />
      <main className="admin-main">{children}</main>
    </div>
  );
}
