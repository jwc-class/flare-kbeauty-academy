"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminHeaders } from "@/lib/admin-auth";

type KPIs = {
  total_contacts: number;
  total_lead_submissions: number;
  total_purchases: number;
  total_revenue: number;
  published_courses: number;
  published_landing_pages: number;
};

type Time = {
  leads_last_7_days: number;
  purchases_last_7_days: number;
  revenue_last_30_days: number;
};

type Funnel = {
  conversion_rate_percent: number;
  avg_revenue_per_purchase: number;
  avg_revenue_per_lead: number;
};

type LandingPerf = { id: string; title: string; slug: string; channel: string; lead_submissions_count: number };
type CoursePerf = { id: string; title: string; slug: string; price: number; currency: string; purchases_count: number; revenue: number };
type RecentLead = { id: string; contact_display: string; landing_page_title: string; submitted_at: string };
type RecentPurchase = { id: string; contact_display: string; course_title: string; amount: number; currency: string; purchased_at: string };

type Dashboard = {
  kpis: KPIs;
  time: Time;
  funnel: Funnel;
  landing_performance: LandingPerf[];
  course_performance: CoursePerf[];
  recent_lead_submissions: RecentLead[];
  recent_purchases: RecentPurchase[];
};

function formatDate(s: string): string {
  try {
    return new Date(s).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return s;
  }
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminHeaders().then((headers) =>
      fetch("/api/admin/dashboard", { headers })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = json?.error ?? "Failed to load dashboard";
          throw new Error(typeof msg === "string" ? msg : "대시보드를 불러오지 못했습니다.");
        }
        return json;
      })
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "대시보드를 불러오지 못했습니다."))
      .finally(() => setLoading(false)));
  }, []);

  if (loading) {
    return <p className="text-body text-[var(--muted)]">로딩 중...</p>;
  }

  if (error) {
    return (
      <div>
        <h1 className="text-section-title text-[var(--foreground)] mb-2">Dashboard</h1>
        <p className="text-body text-red-600 mb-2">{error}</p>
        <p className="text-body text-[var(--muted)]">
          SUPABASE_SERVICE_ROLE_KEY가 설정되어 있는지 확인하세요.
        </p>
      </div>
    );
  }

  if (!data) return null;

  const { kpis, time, funnel, landing_performance, course_performance, recent_lead_submissions, recent_purchases } = data;

  return (
    <>
      <h1 className="text-section-title text-[var(--foreground)] mb-2">Funnel & Revenue Dashboard</h1>
      <p className="text-body text-[var(--muted)] mb-6">
        리드·매출·퍼널 지표와 랜딩/코스 성과를 한눈에 확인하세요.
      </p>

      {/* KPI Cards */}
      <section className="mb-8">
        <h2 className="text-card-title text-[var(--foreground)] mb-4">핵심 지표</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Link href="/admin/contacts" className="rounded-[10px] border border-zinc-200 bg-white p-4 hover:border-zinc-300 transition-colors">
            <p className="text-sm text-[var(--muted)] mb-1">Contacts</p>
            <p className="text-xl font-semibold text-[var(--foreground)]">{kpis.total_contacts}</p>
          </Link>
          <Link href="/admin/contacts" className="rounded-[10px] border border-zinc-200 bg-white p-4 hover:border-zinc-300 transition-colors">
            <p className="text-sm text-[var(--muted)] mb-1">Lead submissions</p>
            <p className="text-xl font-semibold text-[var(--foreground)]">{kpis.total_lead_submissions}</p>
          </Link>
          <Link href="/admin/purchases" className="rounded-[10px] border border-zinc-200 bg-white p-4 hover:border-zinc-300 transition-colors">
            <p className="text-sm text-[var(--muted)] mb-1">Purchases</p>
            <p className="text-xl font-semibold text-[var(--foreground)]">{kpis.total_purchases}</p>
          </Link>
          <div className="rounded-[10px] border border-zinc-200 bg-white p-4">
            <p className="text-sm text-[var(--muted)] mb-1">Total revenue</p>
            <p className="text-xl font-semibold text-[var(--foreground)]">{formatMoney(kpis.total_revenue, "USD")}</p>
          </div>
          <Link href="/admin/courses" className="rounded-[10px] border border-zinc-200 bg-white p-4 hover:border-zinc-300 transition-colors">
            <p className="text-sm text-[var(--muted)] mb-1">Published courses</p>
            <p className="text-xl font-semibold text-[var(--foreground)]">{kpis.published_courses}</p>
          </Link>
          <Link href="/admin/landing-pages" className="rounded-[10px] border border-zinc-200 bg-white p-4 hover:border-zinc-300 transition-colors">
            <p className="text-sm text-[var(--muted)] mb-1">Published LPs</p>
            <p className="text-xl font-semibold text-[var(--foreground)]">{kpis.published_landing_pages}</p>
          </Link>
        </div>
      </section>

      {/* Time-based + Funnel */}
      <section className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-[10px] border border-zinc-200 bg-white p-5">
          <h2 className="text-card-title text-[var(--foreground)] mb-4">최근 기간</h2>
          <ul className="space-y-2 text-body text-[var(--foreground)]">
            <li>리드 제출 (최근 7일): <strong>{time.leads_last_7_days}</strong></li>
            <li>구매 (최근 7일): <strong>{time.purchases_last_7_days}</strong></li>
            <li>매출 (최근 30일): <strong>{formatMoney(time.revenue_last_30_days, "USD")}</strong></li>
          </ul>
        </div>
        <div className="rounded-[10px] border border-zinc-200 bg-white p-5">
          <h2 className="text-card-title text-[var(--foreground)] mb-4">퍼널 지표</h2>
          <ul className="space-y-2 text-body text-[var(--foreground)]">
            <li>리드 → 구매 전환율: <strong>{funnel.conversion_rate_percent}%</strong></li>
            <li>구매당 평균 매출: <strong>{formatMoney(funnel.avg_revenue_per_purchase, "USD")}</strong></li>
            <li>리드당 평균 매출: <strong>{formatMoney(funnel.avg_revenue_per_lead, "USD")}</strong></li>
          </ul>
        </div>
      </section>

      {/* Landing page performance */}
      <section className="mb-8">
        <h2 className="text-card-title text-[var(--foreground)] mb-4">랜딩 페이지 성과</h2>
        <div className="overflow-x-auto rounded-[10px] border border-zinc-200 bg-white">
          {landing_performance.length === 0 ? (
            <p className="p-6 text-body text-[var(--muted)]">랜딩 페이지가 없거나 리드 제출이 없습니다.</p>
          ) : (
            <table className="w-full text-left text-body">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="p-3 font-semibold text-[var(--foreground)]">제목</th>
                  <th className="p-3 font-semibold text-[var(--foreground)]">슬러그</th>
                  <th className="p-3 font-semibold text-[var(--foreground)]">채널</th>
                  <th className="p-3 font-semibold text-[var(--foreground)]">리드 제출 수</th>
                </tr>
              </thead>
              <tbody>
                {landing_performance.map((lp) => (
                  <tr key={lp.id} className="border-b border-zinc-100">
                    <td className="p-3">
                      <Link href={`/admin/landing-pages/${lp.id}`} className="text-zinc-700 hover:text-[var(--flare-support-1)] hover:underline">
                        {lp.title}
                      </Link>
                    </td>
                    <td className="p-3 text-zinc-600">{lp.slug}</td>
                    <td className="p-3 text-zinc-600">{lp.channel}</td>
                    <td className="p-3 font-medium text-[var(--foreground)]">{lp.lead_submissions_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Course performance */}
      <section className="mb-8">
        <h2 className="text-card-title text-[var(--foreground)] mb-4">강의별 매출</h2>
        <div className="overflow-x-auto rounded-[10px] border border-zinc-200 bg-white">
          {course_performance.length === 0 ? (
            <p className="p-6 text-body text-[var(--muted)]">강의가 없습니다.</p>
          ) : (
            <table className="w-full text-left text-body">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="p-3 font-semibold text-[var(--foreground)]">강의</th>
                  <th className="p-3 font-semibold text-[var(--foreground)]">가격</th>
                  <th className="p-3 font-semibold text-[var(--foreground)]">구매 수</th>
                  <th className="p-3 font-semibold text-[var(--foreground)]">매출</th>
                </tr>
              </thead>
              <tbody>
                {course_performance.map((c) => (
                  <tr key={c.id} className="border-b border-zinc-100">
                    <td className="p-3">
                      <Link href={`/admin/courses/${c.id}`} className="text-zinc-700 hover:text-[var(--flare-support-1)] hover:underline">
                        {c.title}
                      </Link>
                    </td>
                    <td className="p-3 text-zinc-600">{formatMoney(c.price, c.currency)}</td>
                    <td className="p-3 font-medium text-[var(--foreground)]">{c.purchases_count}</td>
                    <td className="p-3 font-medium text-[var(--foreground)]">{formatMoney(c.revenue, c.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Recent activity */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-[10px] border border-zinc-200 bg-white overflow-hidden">
          <h2 className="text-card-title text-[var(--foreground)] p-4 pb-2">최근 리드 제출</h2>
          {recent_lead_submissions.length === 0 ? (
            <p className="p-4 text-body text-[var(--muted)]">최근 리드 제출이 없습니다.</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {recent_lead_submissions.slice(0, 10).map((r) => (
                <li key={r.id} className="p-3 text-body text-zinc-700">
                  <span className="font-medium text-[var(--foreground)]">{r.contact_display}</span>
                  {" · "}
                  {r.landing_page_title}
                  {" · "}
                  <span className="text-[var(--muted)] text-sm">{formatDate(r.submitted_at)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="p-3 border-t border-zinc-100">
            <Link href="/admin/contacts" className="text-body text-[var(--flare-support-1)] hover:underline">전체 연락처 →</Link>
          </div>
        </div>
        <div className="rounded-[10px] border border-zinc-200 bg-white overflow-hidden">
          <h2 className="text-card-title text-[var(--foreground)] p-4 pb-2">최근 구매</h2>
          {recent_purchases.length === 0 ? (
            <p className="p-4 text-body text-[var(--muted)]">최근 구매가 없습니다.</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {recent_purchases.slice(0, 10).map((p) => (
                <li key={p.id} className="p-3 text-body text-zinc-700">
                  <span className="font-medium text-[var(--foreground)]">{p.contact_display}</span>
                  {" · "}
                  {p.course_title}
                  {" · "}
                  <span className="font-medium">{formatMoney(p.amount, p.currency)}</span>
                  {" · "}
                  <span className="text-[var(--muted)] text-sm">{formatDate(p.purchased_at)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="p-3 border-t border-zinc-100">
            <Link href="/admin/purchases" className="text-body text-[var(--flare-support-1)] hover:underline">전체 구매 →</Link>
          </div>
        </div>
      </section>

      <p className="mt-8 text-body text-[var(--muted)]">
        리드·연락처는 <Link href="/admin/contacts" className="text-[var(--flare-support-1)] hover:underline">Contacts</Link>에서 확인할 수 있습니다.
      </p>
    </>
  );
}
