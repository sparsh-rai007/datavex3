import RequireAdmin from "@/lib/requireAdmin";
import AdminBookings from "./AdminBookings";

export default function Page() {
  return (
    <RequireAdmin>
      <AdminBookings />
    </RequireAdmin>
  );
}
