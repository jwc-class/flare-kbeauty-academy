/**
 * Applies supabase/setup_enrollments.sql (pg).
 * Prefer DATABASE_URL = Session pooler URI (IPv4). Direct db.*.supabase.co can be IPv6-only.
 */
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { Client } = require("pg");

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

function resolveDatabaseUrl() {
  if (process.env.DATABASE_URL?.trim()) return process.env.DATABASE_URL.trim();
  const pw = process.env.SUPABASE_DB_PASSWORD?.trim();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (pw && supabaseUrl) {
    let host;
    try {
      host = new URL(supabaseUrl).hostname;
    } catch {
      return null;
    }
    const projectRef = host.split(".")[0];
    return `postgresql://postgres:${encodeURIComponent(pw)}@db.${projectRef}.supabase.co:5432/postgres`;
  }
  return null;
}

function stripLeadingCommentLines(sql) {
  return sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .trim();
}

async function main() {
  const databaseUrl = resolveDatabaseUrl();
  if (!databaseUrl) {
    console.error("[apply-enrollments] DATABASE_URL or SUPABASE_DB_PASSWORD missing in .env.local");
    process.exit(1);
  }
  const u = new URL(databaseUrl.replace(/^postgresql:/i, "http:"));
  console.log("[apply-enrollments] Host:", u.hostname);
  if (!u.hostname.includes("pooler.supabase.com")) {
    console.log(
      "[apply-enrollments] Tip: if connection fails, use Session pooler URI (host contains pooler.supabase.com, port 6543)."
    );
  }

  const sqlPath = path.join(__dirname, "..", "supabase", "setup_enrollments.sql");
  const raw = fs.readFileSync(sqlPath, "utf8");
  const chunks = raw
    .split(/;\s*\r?\n/)
    .map((s) => stripLeadingCommentLines(s))
    .map((s) => s.trim())
    .filter(Boolean);

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    for (let i = 0; i < chunks.length; i++) {
      const stmt = chunks[i].endsWith(";") ? chunks[i] : `${chunks[i]};`;
      const preview = stmt.split(/\r?\n/)[0].slice(0, 72);
      await client.query(stmt);
      console.log(`[${i + 1}/${chunks.length}] OK ${preview}`);
    }
  } finally {
    await client.end();
  }
  console.log("[apply-enrollments] Done.");
}

main().catch((err) => {
  console.error("[apply-enrollments] Failed:", err.message);
  console.error(
    "\n---\n" +
      "IPv4만 되는 네트워크에서는 db.xxx.supabase.co(직접 연결) 대신\n" +
      "Supabase → Project Settings → Database → Connection string → Session mode\n" +
      "에서 복사한 URI를 DATABASE_URL로 넣으세요. (호스트에 pooler.supabase.com 포함, 포트 보통 6543)\n" +
      "비밀번호는 [YOUR-PASSWORD] 자리에 넣은 뒤 한 줄로 저장하세요.\n" +
      "---"
  );
  process.exit(1);
});
