import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentReports } from "@/components/dashboard/RecentReports";
import { ComplianceChart } from "@/components/dashboard/ComplianceChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { FileText, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

const Index = () => {
  return (
    <AppLayout
      title="Dashboard"
      subtitle="Privire de ansamblu asupra verificărilor electrice"
    >
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6 animate-fade-in">
        <StatsCard
          title="Total Rapoarte"
          value={167}
          subtitle="Luna aceasta"
          icon={FileText}
          trend={{ value: 12, isPositive: true }}
          variant="default"
        />
        <StatsCard
          title="Conforme"
          value={142}
          subtitle="85% din total"
          icon={CheckCircle2}
          variant="success"
        />
        <StatsCard
          title="Neconforme"
          value={25}
          subtitle="Necesită atenție"
          icon={AlertTriangle}
          variant="warning"
        />
        <StatsCard
          title="În Așteptare"
          value={8}
          subtitle="Draft-uri active"
          icon={Clock}
          variant="accent"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Reports List - spans 2 columns */}
        <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <RecentReports />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <ComplianceChart />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <QuickActions />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <ActivityTimeline />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
