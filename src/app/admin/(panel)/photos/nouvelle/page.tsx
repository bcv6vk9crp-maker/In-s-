import Link from "next/link";
import { PhotoForm } from "@/components/admin/PhotoForm";
import { getCollections, getFormats } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function NewPhotoPage() {
  const [collections, formats] = await Promise.all([
    getCollections({ onlyVisible: false }),
    getFormats({ onlyActive: false }),
  ]);
  return (
    <>
      <p>
        <Link href="/admin/photos" className="muted">
          ← Photos
        </Link>
      </p>
      <h1>Nouvelle photo</h1>
      <PhotoForm photo={null} collections={collections} formats={formats} />
    </>
  );
}
