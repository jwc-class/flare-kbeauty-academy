"use client";

type AdminFormSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function AdminFormSection({ title, description, children }: AdminFormSectionProps) {
  return (
    <section className="rounded-[10px] border border-zinc-200 bg-white p-6 mb-6">
      <h2 className="text-card-title text-[var(--foreground)] mb-1">{title}</h2>
      {description && (
        <p className="text-body text-[var(--muted)] mb-4">{description}</p>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function AdminFormActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-zinc-100 mt-6">
      {children}
    </div>
  );
}
