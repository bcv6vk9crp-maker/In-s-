import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/data";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <>
      <div className="admin-head">
        <h1>Réglages</h1>
      </div>
      <SettingsForm settings={settings} adminEmail={env.adminEmail} />
    </>
  );
}
