import { redirect } from "next/navigation";

export default function AdminContactsLegacyRedirectPage() {
  redirect("/admin/leads");
}
