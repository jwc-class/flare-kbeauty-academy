"use client";

export type MemberLeadsSubmission = {
  id: string;
  submitted_at: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone_country_code: string | null;
  phone_number: string | null;
  marketing_consent: boolean;
  source: string | null;
};

export type MemberLeadsPayload = {
  profile: { id: string; email: string | null; full_name: string | null };
  submissions: MemberLeadsSubmission[];
};

type Props = {
  open: boolean;
  loading: boolean;
  error: string | null;
  data: MemberLeadsPayload | null;
  onClose: () => void;
};

function formatDate(s: string) {
  try {
    return new Date(s).toLocaleString("ko-KR");
  } catch {
    return s;
  }
}

function sortSubmissionsDesc(submissions: MemberLeadsSubmission[]) {
  return [...submissions].sort((a, b) => {
    const ta = new Date(a.submitted_at).getTime();
    const tb = new Date(b.submitted_at).getTime();
    if (tb !== ta) return tb - ta;
    return String(b.id).localeCompare(String(a.id));
  });
}

export function MemberLeadsModal({ open, loading, error, data, onClose }: Props) {
  if (!open) return null;

  const submissions = data ? sortSubmissionsDesc(data.submissions) : [];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />
      <div className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col rounded-2xl border border-[var(--border-subtle)] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">Leads 정보</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100"
          >
            닫기
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loading && <p className="text-sm text-[var(--muted)]">불러오는 중…</p>}
          {!loading && error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && !error && data && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">멤버</p>
                <p className="mt-1 text-body font-medium text-[var(--foreground)]">
                  {data.profile.full_name || "—"}
                </p>
                <p className="text-sm text-zinc-600">{data.profile.email}</p>
                <p className="mt-2 text-xs text-zinc-500">
                  아래는 이 이메일로 리드 폼에 제출된 기록입니다. 제출마다 별도로 저장됩니다.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  제출 이력
                  {submissions.length > 0 && (
                    <span className="ml-2 font-normal normal-case text-zinc-400">
                      ({submissions.length}건)
                    </span>
                  )}
                </p>
                {submissions.length === 0 ? (
                  <p className="mt-2 text-sm text-zinc-500">
                    이 이메일로 제출된 리드가 없습니다.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {submissions.map((s, index) => (
                      <li
                        key={s.id || `submission-${index}`}
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm"
                      >
                        <p className="font-medium text-[var(--foreground)]">
                          #{submissions.length - index} · {formatDate(s.submitted_at)}
                        </p>
                        <dl className="mt-2 space-y-1 text-xs text-zinc-600">
                          <div className="flex gap-2">
                            <dt className="w-16 shrink-0 text-zinc-400">이름</dt>
                            <dd>{[s.first_name, s.last_name].filter(Boolean).join(" ") || "—"}</dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="w-16 shrink-0 text-zinc-400">이메일</dt>
                            <dd className="break-all">{s.email || "—"}</dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="w-16 shrink-0 text-zinc-400">전화</dt>
                            <dd>{[s.phone_country_code, s.phone_number].filter(Boolean).join(" ") || "—"}</dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="w-16 shrink-0 text-zinc-400">마케팅</dt>
                            <dd>{s.marketing_consent ? "예" : "아니오"}</dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="w-16 shrink-0 text-zinc-400">source</dt>
                            <dd>{s.source ?? "—"}</dd>
                          </div>
                        </dl>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
