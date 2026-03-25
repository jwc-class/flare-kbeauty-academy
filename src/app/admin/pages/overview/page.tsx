"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getAdminHeaders } from "@/lib/admin-auth";
import { AdminPageHeader } from "@/components/admin";

type RelationRow = { id: string; title: string; slug: string };

type LandingRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  primary_course_id: string | null;
  offer_page_id: string | null;
  courses?: RelationRow | RelationRow[] | null;
  offer_pages?: RelationRow | RelationRow[] | null;
};

type OfferRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  course_id: string | null;
  courses?: RelationRow | RelationRow[] | null;
};

type CourseRow = { id: string; title: string; slug: string; status: string };

function oneRel(rel: RelationRow | RelationRow[] | null | undefined): RelationRow | null {
  if (!rel) return null;
  return Array.isArray(rel) ? rel[0] ?? null : rel;
}

export default function AdminPagesOverviewPage() {
  const [landings, setLandings] = useState<LandingRow[]>([]);
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAdminHeaders();
      const [rL, rO, rC] = await Promise.all([
        fetch("/api/admin/landing-pages", { headers }),
        fetch("/api/admin/offer-pages", { headers }),
        fetch("/api/admin/courses", { headers }),
      ]);
      const [jL, jO, jC] = await Promise.all([
        rL.json().catch(() => ({})),
        rO.json().catch(() => ({})),
        rC.json().catch(() => ({})),
      ]);
      if (!rL.ok) throw new Error(typeof jL?.error === "string" ? jL.error : "랜딩 목록 실패");
      if (!rO.ok) throw new Error(typeof jO?.error === "string" ? jO.error : "오퍼 목록 실패");
      if (!rC.ok) throw new Error(typeof jC?.error === "string" ? jC.error : "코스 목록 실패");
      setLandings(Array.isArray(jL) ? jL : []);
      setOffers(Array.isArray(jO) ? jO : []);
      setCourses(Array.isArray(jC) ? jC : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "불러오기 실패");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const stats = useMemo(() => {
    const lpWithOffer = landings.filter((l) => l.offer_page_id).length;
    const lpWithCourse = landings.filter((l) => l.primary_course_id).length;
    const offerWithCourse = offers.filter((o) => o.course_id).length;
    return {
      lpWithOffer,
      lpWithCourse,
      offerWithCourse,
      publishedLp: landings.filter((l) => l.status === "published").length,
      publishedOffer: offers.filter((o) => o.status === "published").length,
      publishedCourse: courses.filter((c) => c.status === "published").length,
    };
  }, [landings, offers, courses]);

  const Arrow = ({ className = "" }: { className?: string }) => (
    <div
      className={`flex shrink-0 items-center justify-center text-zinc-400 ${className}`}
      aria-hidden
    >
      <span className="hidden text-2xl font-light lg:inline">→</span>
      <span className="inline text-2xl font-light lg:hidden">↓</span>
    </div>
  );

  const StepCard = ({
    num,
    title,
    path,
    description,
    href,
    accent,
  }: {
    num: string;
    title: string;
    path: string;
    description: string;
    href: string;
    accent: "pink" | "rose" | "orchid";
  }) => {
    const ring =
      accent === "pink"
        ? "ring-[color-mix(in_srgb,var(--brand-soft-3)_35%,transparent)]"
        : accent === "rose"
          ? "ring-[color-mix(in_srgb,var(--brand-primary-3)_28%,transparent)]"
          : "ring-[color-mix(in_srgb,var(--brand-primary-4)_22%,transparent)]";
    return (
      <Link
        href={href}
        className={`group flex flex-1 flex-col rounded-2xl border border-[var(--border-subtle)] bg-white p-5 shadow-sm ring-1 ${ring} transition hover:border-[var(--border-hover)] hover:shadow-md`}
      >
        <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--gradient-flare-subtle)] text-sm font-bold text-[var(--foreground)]">
          {num}
        </span>
        <h3 className="text-lg font-semibold text-[var(--foreground)] group-hover:text-[var(--flare-support-1)]">
          {title}
        </h3>
        <code className="mt-1 block text-xs text-zinc-500">{path}</code>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{description}</p>
        <span className="mt-4 text-sm font-medium text-[var(--flare-support-1)]">목록으로 이동 →</span>
      </Link>
    );
  };

  return (
    <>
      <AdminPageHeader
        title="Pages Overview"
        description="퍼널에 쓰이는 세 가지 페이지가 어떻게 이어지는지 한눈에 봅니다. 리드 제출 후 이동 경로와 CTA 연결을 설정할 때 참고하세요."
        action={
          <button
            type="button"
            onClick={() => fetchAll()}
            disabled={loading}
            className="rounded-[10px] border border-zinc-300 px-4 py-2 text-body text-[var(--foreground)] hover:bg-zinc-50 disabled:opacity-50"
          >
            새로고침
          </button>
        }
      />

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {/* 방문자 관점 플로우 */}
      <section className="mb-10 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-card-title text-[var(--foreground)]">방문자 관점: 일반적인 흐름</h2>
        <p className="mt-2 max-w-3xl text-body text-[var(--muted)]">
          광고·SNS 등에서 들어온 사용자는 보통 아래 순서로 이동합니다.
        </p>

        <div className="mt-8 flex flex-col items-stretch gap-2 lg:flex-row lg:items-stretch lg:gap-0">
          <div className="flex flex-1 flex-col rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-4 text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">1단계</p>
            <p className="mt-1 font-semibold text-[var(--foreground)]">랜딩 페이지</p>
            <p className="mt-2 text-sm text-zinc-600">이메일 등 리드 수집. 히어로·카피·썸네일로 전환.</p>
          </div>
          <Arrow className="lg:w-12 lg:px-1" />
          <div className="flex flex-1 flex-col rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-4 text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">2단계 (선택)</p>
            <p className="mt-1 font-semibold text-[var(--foreground)]">오퍼 페이지</p>
            <p className="mt-2 text-sm text-zinc-600">
              리드 제출 직후 브릿지. 유료 강의로 넘기기 전 설득·요약.
            </p>
          </div>
          <Arrow className="lg:w-12 lg:px-1" />
          <div className="flex flex-1 flex-col rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-4 text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">3단계</p>
            <p className="mt-1 font-semibold text-[var(--foreground)]">코스(강의) 페이지</p>
            <p className="mt-2 text-sm text-zinc-600">가격·결제·상세 설명. 실제 구매가 이루어지는 페이지.</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-[var(--surface-blush)]/60 px-4 py-3 text-sm text-[var(--foreground-soft)]">
          <strong className="text-[var(--foreground)]">팁:</strong> 랜딩에서 &quot;연결 오퍼 페이지&quot;를 지정하면 리드 제출 후 해당 오퍼로 보냅니다.
          지정하지 않으면 기본 감사 페이지(`/thank-you`)로 갑니다. 오퍼 페이지에는 &quot;연결 강의&quot;로 코스를 묶습니다.
        </div>
      </section>

      {/* DB 연결 다이어그램 */}
      <section className="mb-10 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-card-title text-[var(--foreground)]">어드민에서의 연결 관계</h2>
        <p className="mt-2 max-w-3xl text-body text-[var(--muted)]">
          아래는 각 테이블(페이지 종류) 사이에 저장되는 참조 필드입니다. 화살표 옆 문구가 DB·동작과 대응합니다.
        </p>

        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-4">
          <StepCard
            num="#1"
            title="Landing Pages"
            path="/lp/[slug]"
            description="퍼널 입구. 연결 오퍼 페이지(offer_page_id)와 참고용 주요 강의(primary_course_id)를 둘 수 있습니다."
            href="/admin/landing-pages"
            accent="pink"
          />
          <div className="flex flex-col items-center gap-1 lg:mt-24">
            <Arrow />
            <p className="max-w-[200px] text-center text-xs text-zinc-500">
              리드 제출 후 이동: <strong className="text-zinc-700">offer_page_id</strong>
            </p>
          </div>
          <StepCard
            num="#2"
            title="Offer Pages"
            path="/offers/[slug]"
            description="옵트인 직후 브릿지. 연결 강의(course_id)로 CTA 버튼이 코스 판매 페이지로 이어집니다."
            href="/admin/offer-pages"
            accent="rose"
          />
          <div className="flex flex-col items-center gap-1 lg:mt-24">
            <Arrow />
            <p className="max-w-[200px] text-center text-xs text-zinc-500">
              CTA 목적지: <strong className="text-zinc-700">course_id</strong>
            </p>
          </div>
          <StepCard
            num="#3"
            title="Courses"
            path="/courses/[slug]"
            description="실제 상품 페이지. 가격·PayPal·썸네일·본문을 관리합니다."
            href="/admin/courses"
            accent="orchid"
          />
        </div>

        <p className="mt-6 text-sm text-zinc-500">
          랜딩의 <strong>주요 강의</strong>는 리드 제출 리다이렉트와 무관할 수 있으며, 콘텐츠·맥락용으로 두는 경우가 많습니다.
        </p>
      </section>

      {/* 요약 통계 */}
      <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">게시된 랜딩</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{stats.publishedLp}</p>
          <p className="mt-1 text-xs text-zinc-500">전체 {landings.length}개</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">게시된 오퍼</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{stats.publishedOffer}</p>
          <p className="mt-1 text-xs text-zinc-500">전체 {offers.length}개</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">게시된 코스</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{stats.publishedCourse}</p>
          <p className="mt-1 text-xs text-zinc-500">전체 {courses.length}개</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:col-span-2 lg:col-span-3">
          <p className="text-sm font-medium text-[var(--foreground)]">연결 설정 현황</p>
          <ul className="mt-3 grid gap-2 text-sm text-zinc-600 sm:grid-cols-3">
            <li>
              오퍼가 연결된 랜딩: <strong className="text-[var(--foreground)]">{stats.lpWithOffer}</strong> /{" "}
              {landings.length}
            </li>
            <li>
              주요 강의가 있는 랜딩: <strong className="text-[var(--foreground)]">{stats.lpWithCourse}</strong> /{" "}
              {landings.length}
            </li>
            <li>
              강의가 연결된 오퍼: <strong className="text-[var(--foreground)]">{stats.offerWithCourse}</strong> /{" "}
              {offers.length}
            </li>
          </ul>
        </div>
      </section>

      {/* 랜딩별 연결 카드 */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-card-title text-[var(--foreground)]">랜딩별 연결 미리보기</h2>
        <p className="mt-2 text-sm text-zinc-500">
          최대 15개까지 표시합니다. 각 카드를 누르면 해당 종류 페이지의 어드민 편집 화면으로 이동합니다. 오퍼·주요 강의가 비어 있으면 랜딩 편집에서 연결할 수 있습니다.
        </p>
        {loading ? (
          <p className="mt-6 text-sm text-zinc-500">불러오는 중…</p>
        ) : landings.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-500">랜딩 페이지가 없습니다.</p>
        ) : (
          <ul className="mt-6 space-y-5">
            {landings.slice(0, 15).map((row) => {
              const offerRel = oneRel(row.offer_pages);
              const courseRel = oneRel(row.courses);
              const landingEdit = `/admin/landing-pages/${row.id}`;
              const offerEdit = offerRel ? `/admin/offer-pages/${offerRel.id}` : landingEdit;
              const courseEdit = courseRel ? `/admin/courses/${courseRel.id}` : landingEdit;

              const miniCardCls =
                "flex h-full min-h-[120px] flex-col rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] p-4 text-left shadow-sm transition hover:border-[var(--border-hover)] hover:bg-white hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--flare-support-2)]";

              return (
                <li
                  key={row.id}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 sm:p-5"
                >
                  <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    퍼널 묶음 · 상태{" "}
                    <span className="normal-case text-[var(--foreground)]">{row.status}</span>
                  </p>
                  <div className="grid gap-3 md:grid-cols-3">
                    <Link href={landingEdit} className={miniCardCls}>
                      <span className="text-xs font-semibold text-[var(--flare-support-1)]">
                        #1 Landing Pages
                      </span>
                      <span className="mt-2 line-clamp-2 font-semibold text-[var(--foreground)]">
                        {row.title}
                      </span>
                      <span className="mt-1 font-mono text-xs text-zinc-500">/lp/{row.slug}</span>
                      <span className="mt-auto pt-3 text-xs font-medium text-zinc-500">
                        편집으로 이동 →
                      </span>
                    </Link>

                    <Link href={offerEdit} className={miniCardCls}>
                      <span className="text-xs font-semibold text-[var(--flare-support-1)]">
                        #2 Offer Pages
                      </span>
                      {offerRel ? (
                        <>
                          <span className="mt-2 line-clamp-2 font-semibold text-[var(--foreground)]">
                            {offerRel.title}
                          </span>
                          <span className="mt-1 font-mono text-xs text-zinc-500">
                            /offers/{offerRel.slug}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="mt-2 text-sm font-medium text-zinc-500">오퍼 미연결</span>
                          <span className="mt-1 text-xs leading-relaxed text-zinc-400">
                            리드 제출 후 기본 감사 페이지 등. 랜딩에서 오퍼를 연결하세요.
                          </span>
                        </>
                      )}
                      <span className="mt-auto pt-3 text-xs font-medium text-zinc-500">
                        {offerRel ? "오퍼 편집으로 이동 →" : "랜딩에서 연결 · 이동 →"}
                      </span>
                    </Link>

                    <Link href={courseEdit} className={miniCardCls}>
                      <span className="text-xs font-semibold text-[var(--flare-support-1)]">
                        #3 Courses
                      </span>
                      {courseRel ? (
                        <>
                          <span className="mt-2 line-clamp-2 font-semibold text-[var(--foreground)]">
                            {courseRel.title}
                          </span>
                          <span className="mt-1 font-mono text-xs text-zinc-500">
                            /courses/{courseRel.slug}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="mt-2 text-sm font-medium text-zinc-500">주요 강의 미연결</span>
                          <span className="mt-1 text-xs leading-relaxed text-zinc-400">
                            랜딩의 &quot;연결 주요 강의&quot;에서 코스를 지정할 수 있습니다.
                          </span>
                        </>
                      )}
                      <span className="mt-auto pt-3 text-xs font-medium text-zinc-500">
                        {courseRel ? "코스 편집으로 이동 →" : "랜딩에서 연결 · 이동 →"}
                      </span>
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
