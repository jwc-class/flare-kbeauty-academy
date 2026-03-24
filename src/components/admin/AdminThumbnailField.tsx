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
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const handlePick = () => {
    ref.current?.click();
  };

  const uploadFile = async (file: File) => {
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

  const handleFileChange = async (file?: File) => {
    if (!file) return;
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setError("PNG/JPG 파일만 업로드할 수 있습니다.");
      return;
    }
    setError(null);
    setSelectedFile(file);
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    const nextSrc = URL.createObjectURL(file);
    setCropSrc(nextSrc);
  };

  const cancelCrop = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setSelectedFile(null);
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
  };

  const createCroppedFile = async (file: File): Promise<File> => {
    const bitmap = await createImageBitmap(file);
    const iw = bitmap.width;
    const ih = bitmap.height;
    const targetRatio = 16 / 9;
    const isWider = iw / ih > targetRatio;
    const baseCropWidth = isWider ? ih * targetRatio : iw;
    const baseCropHeight = isWider ? ih : iw / targetRatio;

    const cropWidth = baseCropWidth / zoom;
    const cropHeight = baseCropHeight / zoom;

    const maxShiftX = (iw - cropWidth) / 2;
    const maxShiftY = (ih - cropHeight) / 2;
    const centerX = iw / 2 + (offsetX / 100) * maxShiftX;
    const centerY = ih / 2 + (offsetY / 100) * maxShiftY;

    const sx = Math.max(0, Math.min(iw - cropWidth, centerX - cropWidth / 2));
    const sy = Math.max(0, Math.min(ih - cropHeight, centerY - cropHeight / 2));

    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 900;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable");

    ctx.drawImage(bitmap, sx, sy, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("이미지 변환에 실패했습니다."))),
        "image/jpeg",
        0.92
      );
    });
    return new File([blob], `thumb-${Date.now()}.jpg`, { type: "image/jpeg" });
  };

  const handleCropAndUpload = async () => {
    if (!selectedFile) return;
    try {
      const cropped = await createCroppedFile(selectedFile);
      await uploadFile(cropped);
      cancelCrop();
    } catch {
      setError("크롭 업로드에 실패했습니다.");
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
      {cropSrc && (
        <div className="mt-3 rounded-[10px] border border-zinc-200 bg-white p-3">
          <p className="mb-2 text-sm font-medium text-[var(--foreground)]">크롭 미리보기 (16:9)</p>
          <div className="relative aspect-video w-full overflow-hidden rounded-[10px] border border-zinc-200 bg-zinc-100">
            <img
              src={cropSrc}
              alt="crop preview"
              className="h-full w-full object-cover"
              style={{
                objectPosition: `${50 + offsetX * 0.5}% ${50 + offsetY * 0.5}%`,
                transform: `scale(${zoom})`,
                transformOrigin: "center center",
              }}
            />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className="text-sm text-[var(--foreground)]">
              확대
              <input
                type="range"
                min={1}
                max={2.5}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="mt-1 w-full"
              />
            </label>
            <label className="text-sm text-[var(--foreground)]">
              좌우 위치
              <input
                type="range"
                min={-100}
                max={100}
                step={1}
                value={offsetX}
                onChange={(e) => setOffsetX(Number(e.target.value))}
                className="mt-1 w-full"
              />
            </label>
            <label className="text-sm text-[var(--foreground)]">
              상하 위치
              <input
                type="range"
                min={-100}
                max={100}
                step={1}
                value={offsetY}
                onChange={(e) => setOffsetY(Number(e.target.value))}
                className="mt-1 w-full"
              />
            </label>
          </div>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={cancelCrop}
              disabled={uploading}
              className="rounded-[10px] border border-zinc-300 px-3 py-1.5 text-sm text-[var(--foreground)] hover:bg-zinc-50 disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleCropAndUpload}
              disabled={uploading}
              className="btn-cta disabled:opacity-50"
            >
              {uploading ? "업로드중..." : "크롭 후 업로드"}
            </button>
          </div>
        </div>
      )}
      {value && (
        <div className="mt-3 overflow-hidden rounded-[10px] border border-zinc-200 bg-zinc-50">
          <img src={value} alt="thumbnail preview" className="h-auto w-full object-cover" />
        </div>
      )}
    </div>
  );
}
