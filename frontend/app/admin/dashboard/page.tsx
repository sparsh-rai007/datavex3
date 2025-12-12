import RequireAdmin from '@/lib/requireAdmin';
import DashboardPage from './DashboardPage';

export default function Page() {
  return (
    <RequireAdmin>
      <DashboardPage />
    </RequireAdmin>
  );
}
