import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "../guard";

/** Completed payment statuses we count as revenue */
const COMPLETED_STATUSES = ["completed", "COMPLETED"];

function isCompleted(status: string | null | undefined): boolean {
  return status != null && COMPLETED_STATUSES.includes(status.trim());
}

export async function GET(req: Request) {
  const err = await requireAdmin(req);
  if (err) return err;

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Server not configured for admin (SUPABASE_SERVICE_ROLE_KEY)" },
      { status: 503 }
    );
  }

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgoIso = sevenDaysAgo.toISOString();
    const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();

    const [
      contactsRes,
      leadSubsRes,
      purchasesRes,
      coursesRes,
      leadMagnetsRes,
      landingPagesRes,
      purchasesForRevenue,
      leadSubsLast7,
      purchasesLast7,
      purchasesLast30ForRevenue,
      leadSubmissionsWithPages,
      purchasesWithCourses,
      leadSubmissionsByMagnet,
      recentLeadSubs,
      recentPurchases,
    ] = await Promise.all([
      supabaseAdmin.from("contacts").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("lead_submissions").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("purchases").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("courses").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabaseAdmin.from("lead_magnets").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("landing_pages").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabaseAdmin.from("purchases").select("amount, payment_status"),
      supabaseAdmin.from("lead_submissions").select("id", { count: "exact", head: true }).gte("submitted_at", sevenDaysAgoIso),
      supabaseAdmin.from("purchases").select("id", { count: "exact", head: true }).gte("purchased_at", sevenDaysAgoIso),
      supabaseAdmin.from("purchases").select("amount, payment_status").gte("purchased_at", thirtyDaysAgoIso),
      supabaseAdmin.from("lead_submissions").select("landing_page_id").not("landing_page_id", "is", null),
      supabaseAdmin.from("purchases").select("course_id, amount, payment_status"),
      supabaseAdmin.from("lead_submissions").select("lead_magnet_id").not("lead_magnet_id", "is", null),
      supabaseAdmin
        .from("lead_submissions")
        .select("id, submitted_at, contact_id, landing_page_id, lead_magnet_id")
        .order("submitted_at", { ascending: false })
        .limit(15),
      supabaseAdmin
        .from("purchases")
        .select("id, amount, currency, purchased_at, contact_id, course_id")
        .order("purchased_at", { ascending: false })
        .limit(15),
    ]);

    const totalContacts = contactsRes.count ?? 0;
    const totalLeadSubmissions = leadSubsRes.count ?? 0;
    const totalPurchases = purchasesRes.count ?? 0;
    const publishedCourses = coursesRes.count ?? 0;
    const publishedLandingPages = landingPagesRes.count ?? 0;

    const totalRevenue = (purchasesForRevenue.data ?? []).reduce(
      (sum, p) => (isCompleted(p.payment_status) ? sum + Number(p.amount ?? 0) : sum),
      0
    );
    const completedPurchases = (purchasesForRevenue.data ?? []).filter((p) => isCompleted(p.payment_status)).length;
    const revenueLast30Days = (purchasesLast30ForRevenue.data ?? []).reduce(
      (sum, p) => (isCompleted(p.payment_status) ? sum + Number(p.amount ?? 0) : sum),
      0
    );

    const leadsLast7Days = leadSubsLast7.count ?? 0;
    const purchasesLast7Days = purchasesLast7.count ?? 0;

    const conversionRate =
      totalLeadSubmissions > 0 ? (totalPurchases / totalLeadSubmissions) * 100 : 0;
    const avgRevenuePerPurchase = totalPurchases > 0 ? totalRevenue / totalPurchases : 0;
    const avgRevenuePerLead = totalLeadSubmissions > 0 ? totalRevenue / totalLeadSubmissions : 0;

    const landingPageIds = new Map<string, number>();
    (leadSubmissionsWithPages.data ?? []).forEach((r: { landing_page_id?: string }) => {
      if (r.landing_page_id) {
        landingPageIds.set(r.landing_page_id, (landingPageIds.get(r.landing_page_id) ?? 0) + 1);
      }
    });

    const courseAgg = new Map<string, { count: number; revenue: number }>();
    (purchasesWithCourses.data ?? []).forEach((p: { course_id?: string; amount?: number; payment_status?: string }) => {
      if (!p.course_id) return;
      const cur = courseAgg.get(p.course_id) ?? { count: 0, revenue: 0 };
      cur.count += 1;
      if (isCompleted(p.payment_status)) cur.revenue += Number(p.amount ?? 0);
      courseAgg.set(p.course_id, cur);
    });

    const leadMagnetCounts = new Map<string, number>();
    (leadSubmissionsByMagnet.data ?? []).forEach((r: { lead_magnet_id?: string }) => {
      if (r.lead_magnet_id) {
        leadMagnetCounts.set(r.lead_magnet_id, (leadMagnetCounts.get(r.lead_magnet_id) ?? 0) + 1);
      }
    });

    const landingPagesList = await supabaseAdmin
      .from("landing_pages")
      .select("id, title, slug, channel")
      .order("title");
    const coursesList = await supabaseAdmin.from("courses").select("id, title, slug, price, currency").order("title");
    const leadMagnetsList = await supabaseAdmin.from("lead_magnets").select("id, title, slug").order("title");

    const landingPerformance = (landingPagesList.data ?? []).map((lp: { id: string; title: string; slug: string; channel: string | null }) => ({
      id: lp.id,
      title: lp.title,
      slug: lp.slug,
      channel: lp.channel ?? "—",
      lead_submissions_count: landingPageIds.get(lp.id) ?? 0,
    }));

    const coursePerformance = (coursesList.data ?? []).map((c: { id: string; title: string; slug: string; price: number; currency: string }) => {
      const agg = courseAgg.get(c.id) ?? { count: 0, revenue: 0 };
      return {
        id: c.id,
        title: c.title,
        slug: c.slug,
        price: Number(c.price ?? 0),
        currency: c.currency ?? "USD",
        purchases_count: agg.count,
        revenue: agg.revenue,
      };
    });

    const leadMagnetPerformance = (leadMagnetsList.data ?? []).map((lm: { id: string; title: string; slug: string }) => ({
      id: lm.id,
      title: lm.title,
      slug: lm.slug,
      lead_submissions_count: leadMagnetCounts.get(lm.id) ?? 0,
    }));

    const contactIds = new Set<string>();
    (recentLeadSubs.data ?? []).forEach((r: { contact_id?: string }) => r.contact_id && contactIds.add(r.contact_id));
    (recentPurchases.data ?? []).forEach((p: { contact_id?: string }) => p.contact_id && contactIds.add(p.contact_id));

    const contactIdList = Array.from(contactIds);
    let contactsMap: Record<string, { email: string; first_name: string | null; last_name: string | null }> = {};
    if (contactIdList.length > 0) {
      const { data: contactsData } = await supabaseAdmin
        .from("contacts")
        .select("id, email, first_name, last_name")
        .in("id", contactIdList);
      (contactsData ?? []).forEach((c: { id: string; email: string; first_name: string | null; last_name: string | null }) => {
        contactsMap[c.id] = { email: c.email, first_name: c.first_name, last_name: c.last_name };
      });
    }

    const lpIds = Array.from(new Set((recentLeadSubs.data ?? []).map((r: { landing_page_id?: string }) => r.landing_page_id).filter(Boolean)));
    let lpMap: Record<string, string> = {};
    if (lpIds.length > 0) {
      const { data: lpData } = await supabaseAdmin.from("landing_pages").select("id, title").in("id", lpIds);
      (lpData ?? []).forEach((p: { id: string; title: string }) => { lpMap[p.id] = p.title; });
    }

    const lmIds = Array.from(new Set((recentLeadSubs.data ?? []).map((r: { lead_magnet_id?: string }) => r.lead_magnet_id).filter(Boolean)));
    let lmMap: Record<string, string> = {};
    if (lmIds.length > 0) {
      const { data: lmData } = await supabaseAdmin.from("lead_magnets").select("id, title").in("id", lmIds);
      (lmData ?? []).forEach((m: { id: string; title: string }) => { lmMap[m.id] = m.title; });
    }

    const courseIds = Array.from(new Set((recentPurchases.data ?? []).map((p: { course_id?: string }) => p.course_id).filter(Boolean)));
    let courseMap: Record<string, string> = {};
    if (courseIds.length > 0) {
      const { data: courseData } = await supabaseAdmin.from("courses").select("id, title").in("id", courseIds);
      (courseData ?? []).forEach((c: { id: string; title: string }) => { courseMap[c.id] = c.title; });
    }

    const recentLeads = (recentLeadSubs.data ?? []).map((r: { id: string; contact_id: string; landing_page_id: string | null; lead_magnet_id: string | null; submitted_at: string }) => {
      const c = contactsMap[r.contact_id];
      const name = c ? [c.first_name, c.last_name].filter(Boolean).join(" ") || c.email : "—";
      return {
        id: r.id,
        contact_display: name,
        landing_page_title: r.landing_page_id ? lpMap[r.landing_page_id] ?? "—" : "—",
        lead_magnet_title: r.lead_magnet_id ? lmMap[r.lead_magnet_id] ?? "—" : "—",
        submitted_at: r.submitted_at,
      };
    });

    const recentPurchasesList = (recentPurchases.data ?? []).map((p: { id: string; contact_id: string; course_id: string; amount: number; currency: string; purchased_at: string }) => {
      const c = contactsMap[p.contact_id];
      const name = c ? [c.first_name, c.last_name].filter(Boolean).join(" ") || c.email : "—";
      return {
        id: p.id,
        contact_display: name,
        course_title: courseMap[p.course_id] ?? "—",
        amount: Number(p.amount ?? 0),
        currency: p.currency ?? "USD",
        purchased_at: p.purchased_at,
      };
    });

    return NextResponse.json({
      kpis: {
        total_contacts: totalContacts,
        total_lead_submissions: totalLeadSubmissions,
        total_purchases: totalPurchases,
        total_revenue: Math.round(totalRevenue * 100) / 100,
        published_courses: publishedCourses,
        published_landing_pages: publishedLandingPages,
      },
      time: {
        leads_last_7_days: leadsLast7Days,
        purchases_last_7_days: purchasesLast7Days,
        revenue_last_30_days: Math.round(revenueLast30Days * 100) / 100,
      },
      funnel: {
        conversion_rate_percent: Math.round(conversionRate * 100) / 100,
        avg_revenue_per_purchase: Math.round(avgRevenuePerPurchase * 100) / 100,
        avg_revenue_per_lead: Math.round(avgRevenuePerLead * 100) / 100,
      },
      landing_performance: landingPerformance,
      course_performance: coursePerformance,
      lead_magnet_performance: leadMagnetPerformance,
      recent_lead_submissions: recentLeads,
      recent_purchases: recentPurchasesList,
    });
  } catch (e) {
    console.error("[admin dashboard]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
