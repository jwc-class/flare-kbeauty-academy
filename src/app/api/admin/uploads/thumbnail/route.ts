import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "../../guard";

const BUCKET = "thumbnails";
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg"]);

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function POST(req: Request) {
  const err = await requireAdmin(req);
  if (err) return err;

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }

  try {
    const form = await req.formData();
    const entity = String(form.get("entity") ?? "");
    const file = form.get("file");

    if (!["course", "landing-page", "offer-page"].includes(entity)) {
      return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Only PNG/JPG files are allowed" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Max file size is 5MB" }, { status: 400 });
    }

    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = (buckets ?? []).some((b) => b.name === BUCKET);
    if (!exists) {
      const { error: createErr } = await supabaseAdmin.storage.createBucket(BUCKET, {
        public: true,
        allowedMimeTypes: ["image/png", "image/jpeg"],
        fileSizeLimit: `${MAX_BYTES}`,
      });
      if (createErr && !createErr.message.toLowerCase().includes("already exists")) {
        return NextResponse.json({ error: createErr.message }, { status: 500 });
      }
    }

    const ext = file.type === "image/png" ? "png" : "jpg";
    const path = `${entity}/${Date.now()}-${sanitizeName(file.name || "thumbnail")}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error: uploadErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, bytes, {
        contentType: file.type,
        upsert: false,
      });
    if (uploadErr) {
      return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    }

    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({
      publicUrl: data.publicUrl,
      path,
      recommendation: "권장 썸네일: 1600x900px (16:9), PNG/JPG",
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
