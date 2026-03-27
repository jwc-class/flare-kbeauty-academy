"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSession } from "@/lib/auth";
import type { CourseLessonPublic } from "@/types/enrollment";

type LearnPayload = {
  hasFullAccess: boolean;
  course: {
    id: string;
    title: string | null;
    slug: string | null;
    thumbnail_url: string | null;
    short_description: string | null;
  };
  lessons: CourseLessonPublic[];
};

const DEFAULT_IMAGE = "https://placehold.co/800x600/FAF9F6/1a1a1a?text=Course";

export default function LearnCoursePage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LearnPayload | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError("Invalid course.");
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const session = await getSession();
      const token = session?.access_token;
      if (!token) {
        if (!cancelled) {
          setError("signin");
          setLoading(false);
        }
        return;
      }
      const res = await fetch(`/api/learn/${encodeURIComponent(slug)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (!cancelled) {
          if (res.status === 403) setError("forbidden");
          else if (res.status === 404) setError("notfound");
          else setError(typeof json?.error === "string" ? json.error : "Failed to load.");
          setLoading(false);
        }
        return;
      }
      if (!cancelled) {
        setData(json as LearnPayload);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header />
        <main className="pt-24 pb-16 px-4">
          <p className="mx-auto max-w-[960px] text-body text-[var(--muted)]">Loading…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error === "signin") {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header />
        <main className="pt-24 pb-16 px-4 text-center">
          <h1 className="text-section-title text-[var(--foreground)]">Sign in required</h1>
          <p className="mt-4 text-body text-zinc-600">Log in to access your course.</p>
          <Link href="/account" className="mt-6 inline-block text-body text-[var(--flare-support-1)] hover:underline">
            Go to account
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (error === "forbidden") {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header />
        <main className="pt-24 pb-16 px-4 text-center max-w-lg mx-auto">
          <h1 className="text-section-title text-[var(--foreground)]">No access yet</h1>
          <p className="mt-4 text-body text-zinc-600">
            Purchase this course to unlock all lessons. If the instructor added free preview lessons in the admin, you
            can watch those without purchasing.
          </p>
          <Link
            href={slug ? `/courses/${encodeURIComponent(slug)}` : "/"}
            className="mt-6 inline-block rounded-[10px] bg-[var(--foreground)] px-5 py-2.5 text-body text-white hover:opacity-90"
          >
            View course page
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header />
        <main className="pt-24 pb-16 px-4 text-center">
          <p className="text-body text-zinc-600">{error ?? "Something went wrong."}</p>
          <Link href="/account" className="mt-4 inline-block text-[var(--flare-support-1)] hover:underline">
            Back to account
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const { course, lessons, hasFullAccess } = data;
  const thumb = course.thumbnail_url || DEFAULT_IMAGE;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="mx-auto max-w-[960px]">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
            <div className="aspect-video w-full max-w-md shrink-0 overflow-hidden rounded-[10px] border border-zinc-200 bg-zinc-100">
              <Image
                src={thumb}
                alt={course.title ?? ""}
                width={640}
                height={360}
                className="h-full w-full object-cover"
                unoptimized={thumb.startsWith("http") && !thumb.includes("placehold")}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">
                {hasFullAccess ? "Your course" : "Preview"}
              </p>
              <h1 className="mt-1 text-section-title text-[var(--foreground)]">{course.title ?? "Course"}</h1>
              {course.short_description && (
                <p className="mt-3 text-body text-zinc-600">{course.short_description}</p>
              )}
            </div>
          </div>

          <section className="mt-12 border-t border-zinc-200 pt-10">
            <h2 className="text-card-title text-[var(--foreground)]">Lessons</h2>
            {lessons.length === 0 ? (
              <p className="mt-4 text-body text-zinc-600">
                Curriculum will appear here once lessons are published in the admin.
              </p>
            ) : (
              <ol className="mt-6 space-y-3">
                {lessons.map((lesson, i) => (
                  <li
                    key={lesson.id}
                    className="flex gap-4 rounded-[10px] border border-zinc-200 bg-white px-4 py-3"
                  >
                    <span className="text-sm tabular-nums text-zinc-400 w-6 shrink-0">{i + 1}</span>
                    <div>
                      <p className="text-body font-medium text-[var(--foreground)]">{lesson.title}</p>
                      {lesson.description && (
                        <p className="mt-1 text-sm text-zinc-600">{lesson.description}</p>
                      )}
                      {lesson.video_ref && (
                        <p className="mt-2 text-xs text-zinc-500">Video: {lesson.video_provider ?? "link"} configured</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <div className="mt-10">
            <Link href="/account" className="text-body text-[var(--flare-support-1)] hover:underline">
              ← Back to account
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}