import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      email,
      first_name,
      country_code,
      phone_number,
      marketing_consent = false,
      source,
    } = body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("leads").insert([
      {
        email: email.trim(),
        first_name: first_name?.trim() || null,
        country_code: country_code?.trim() || null,
        phone_number: phone_number?.trim() || null,
        marketing_consent: Boolean(marketing_consent),
        source: typeof source === "string" && source.trim() ? source.trim() : "main",
      },
    ]);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}