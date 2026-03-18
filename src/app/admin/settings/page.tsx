"use client";

import { AdminPageHeader } from "@/components/admin";

export default function AdminSettingsPage() {
  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="관리자 설정 및 연동. Prompt 2에서 API 키, 알림, 역할 등 확장."
      />
      <div className="rounded-[10px] border border-zinc-200 bg-white p-8 text-center">
        <p className="text-body text-[var(--muted)]">
          설정 페이지는 추후 추가됩니다. (API 키, 알림, 통합 등)
        </p>
      </div>
    </>
  );
}
