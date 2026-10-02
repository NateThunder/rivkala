import AdminShell from "./admin-shell";
import AdminLogin from "./admin-login";
import { getAdminSession } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin | Rivkala",
};

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) return <AdminLogin />;
  return <AdminShell username={session.username} />;
}
