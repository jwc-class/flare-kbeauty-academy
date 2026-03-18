"use client";

type AdminTableProps = {
  children: React.ReactNode;
  "aria-label"?: string;
};

export function AdminTable({ children, "aria-label": ariaLabel }: AdminTableProps) {
  return (
    <div className="overflow-x-auto rounded-[10px] border border-zinc-200 bg-white">
      <table className="w-full text-left text-body" aria-label={ariaLabel}>
        {children}
      </table>
    </div>
  );
}

export function AdminTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-zinc-200 bg-zinc-50">
        {children}
      </tr>
    </thead>
  );
}

export function AdminTh({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`p-4 font-semibold text-[var(--foreground)] ${className ?? ""}`}>
      {children}
    </th>
  );
}

export function AdminTableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function AdminTr({
  children,
  className,
}: { children: React.ReactNode; className?: string }) {
  return (
    <tr className={`border-b border-zinc-100 hover:bg-zinc-50 ${className ?? ""}`}>
      {children}
    </tr>
  );
}

export function AdminTd({
  children,
  className,
  colSpan,
}: { children: React.ReactNode; className?: string; colSpan?: number }) {
  return (
    <td className={`p-4 text-zinc-700 ${className ?? ""}`} colSpan={colSpan}>
      {children}
    </td>
  );
}
