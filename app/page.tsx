import { CountdownBanner } from "@/components/dashboard/CountdownBanner";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { TodayTasksPreview } from "@/components/dashboard/TodayTasksPreview";
import { ProgressOverview } from "@/components/dashboard/ProgressOverview";
import { BuddyGreeting } from "@/components/dashboard/BuddyGreeting";

export default function HomePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <CountdownBanner />
      <DashboardStats />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodayTasksPreview />
        <ProgressOverview />
      </div>
      <BuddyGreeting />
    </div>
  );
}
