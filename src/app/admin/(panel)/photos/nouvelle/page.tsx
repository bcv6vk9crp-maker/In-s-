import Link from "next/link";
import { PhotoForm } from "@/components/admin/PhotoForm";
import { getCollections } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function NewPhotoPage() {
  const collections = await getCollections({ onlyVisible: false });
  return (
    <>
      <p>
        <Link href="/admin/photos" className="muted">
          ← Photos
        </Link>
      </p>
      <h1>Nouvelle photo</h1>
      <PhotoForm photo={null} collections={collections} />
    </>
  );
}
