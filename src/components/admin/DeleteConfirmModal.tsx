"use client";

import { useEffect, useId, useState } from "react";

type DeleteConfirmModalProps = {
  open: boolean;
  title?: string;
  targetLabel: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteConfirmModal({
  open,
  title = "정말로 삭제하시겠어요?",
  targetLabel,
  loading = false,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [checked, setChecked] = useState(false);
  const checkboxId = useId();

  useEffect(() => {
    if (open) setChecked(false);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="닫기"
        onClick={onCancel}
        className="absolute inset-0 bg-black/45"
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-white p-5 shadow-xl">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
        <p className="mt-3 text-sm text-[var(--foreground-soft)]">
          아래 항목을 삭제하면 되돌릴 수 없습니다.
        </p>
        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          삭제 대상: <span className="font-medium">{targetLabel}</span>
        </p>

        <label
          htmlFor={checkboxId}
          className="mt-4 flex items-start gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-[var(--foreground)]"
        >
          <input
            id={checkboxId}
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5"
          />
          <span>삭제 정보를 정확히 확인했고, 이 작업이 되돌릴 수 없음을 이해했습니다.</span>
        </label>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-[10px] border border-zinc-300 px-4 py-2 text-body text-[var(--foreground)] hover:bg-zinc-50 disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!checked || loading}
            className="rounded-[10px] border border-red-200 bg-red-600 px-4 py-2 text-body font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "삭제중..." : "최종 삭제"}
          </button>
        </div>
      </div>
    </div>
  );
}
