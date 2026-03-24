"use client";

import { useRef, useState } from "react";
import { getAdminHeaders } from "@/lib/admin-auth";

type Props = {
  label?: string;
  value: string;
  entity: "course" | "landing-page" | "offer-page";
  onChange: (url: string) => void;
};

const inputCls =
  "w-full rounded-[8px] border border-zinc-300 px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-[var(--flare-support-2)]";

export function AdminThumbnailField({
  label = "썸네일",
  value,
  entity,
  onChange,
}: Props) {
  const ref = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePick = () => {
    ref.current?.click();
  };

  const handleFileChange = async (file?: File) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const headers = await getAdminHeaders();
      delete headers["Content-Type"];
      const formData = new FormData();
      formData.append("entity", entity);
      formData.append("file", file);
      const res = await fetch("/api/admin/uploads/thumbnail", {
        method: "POST",
        headers,
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data?.error === "string" ? data.error : "업로드 실패");
        return;
      }
      onChange(typeof data?.publicUrl === "string" ? data.publicUrl : "");
    } catch {
      setError("업로드 실패");
    } finally {
      setUploading(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div>
      <label className="block text-body font-medium text-[var(--foreground)] mb-1">{label}</label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          className={inputCls}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... 또는 업로드 버튼으로 선택"
        />
        <button
          type="button"
          onClick={handlePick}
          disabled={uploading}
          className="rounded-[10px] border border-zinc-300 px-4 py-2 text-body text-[var(--foreground)] hover:bg-zinc-50 disabled:opacity-50"
        >
          {uploading ? "업로드중..." : "이미지 업로드"}
        </button>
        <input
          ref={ref}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0])}
        />
      </div>
      <p className="mt-1 text-sm text-[var(--muted)]">PNG/JPG, 최대 5MB, 권장 1600x900px (16:9, 가로형)</p>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {value && (
        <div className="mt-3 overflow-hidden rounded-[10px] border border-zinc-200 bg-zinc-50">
          <img src={value} alt="thumbnail preview" className="h-auto w-full object-cover" />
        </div>
      )}
    </div>
  );
}
