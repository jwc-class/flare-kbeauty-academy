"use client";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function AdminPageHeader({ title, description, action }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-section-title text-[var(--foreground)]">{title}</h1>
        {description && (
          <p className="mt-1 text-body text-[var(--muted)]">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
