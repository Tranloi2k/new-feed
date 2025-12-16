import Header from "../components/Header";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import { getCurrentUser } from "../lib/services/auth";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header user={user} />
      <LeftSidebar />
      <RightSidebar />

      {/* Main Feed */}
      <main className="pt-16 lg:pl-64 xl:pr-64" role="feed">
        {children}
      </main>
    </div>
  );
}
