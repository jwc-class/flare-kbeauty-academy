import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-[var(--foreground)] mb-2">
        404
      </h1>
      <p className="text-[var(--muted)] mb-6">페이지를 찾을 수 없습니다.</p>
      <Link
        href="/"
        className="px-4 py-2 rounded-md bg-[var(--flare-red)] text-white hover:opacity-90 transition"
      >
        홈으로
      </Link>
    </div>
  );
}
