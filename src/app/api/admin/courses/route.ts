import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "../guard";

export async function GET(req: Request) {
  const err = await requireAdmin(req);
  if (err) return err;
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }
  try {
    const [coursesRes, purchasesRes] = await Promise.all([
      supabaseAdmin
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500),
      // NOTE: include all recorded purchases (including $1 test/low-ticket rows).
      supabaseAdmin
        .from("purchases")
        .select("course_id, amount")
        .limit(5000),
    ]);
    if (coursesRes.error) return NextResponse.json({ error: coursesRes.error.message }, { status: 500 });
    if (purchasesRes.error) return NextResponse.json({ error: purchasesRes.error.message }, { status: 500 });

    const agg = new Map<string, { purchases_count: number; revenue: number }>();
    (purchasesRes.data ?? []).forEach((p: { course_id: string; amount: number }) => {
      if (!p.course_id) return;
      const cur = agg.get(p.course_id) ?? { purchases_count: 0, revenue: 0 };
      cur.purchases_count += 1;
      cur.revenue += Number(p.amount ?? 0);
      agg.set(p.course_id, cur);
    });

    const list = (coursesRes.data ?? []).map((c: Record<string, unknown>) => {
      const courseId = String(c.id ?? "");
      const a = agg.get(courseId) ?? { purchases_count: 0, revenue: 0 };
      return {
        ...c,
        purchases_count: a.purchases_count,
        revenue: a.revenue,
      };
    });

    return NextResponse.json(list);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const err = await requireAdmin(req);
  if (err) return err;
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }
  try {
    const body = await req.json();
    const { data, error } = await supabaseAdmin.from("courses").insert({
      title: body.title ?? "",
      slug: body.slug ?? "",
      thumbnail_url: body.thumbnail_url ?? null,
      price: Number(body.price) ?? 0,
      currency: body.currency ?? "USD",
      short_description: body.short_description ?? null,
      sales_page_content: body.sales_page_content ?? null,
      instructor_name: body.instructor_name ?? null,
      status: body.status ?? "draft",
      paypal_link: body.paypal_link ?? null,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
