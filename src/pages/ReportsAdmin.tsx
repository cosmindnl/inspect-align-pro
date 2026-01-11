import { BarChart3, FileText, Trash2, History, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/layout/AppLayout";
import { useReports } from "@/hooks/useReports";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";
import { ReportsStatsCards } from "@/components/admin/ReportsStatsCards";
import { AllReportsTable } from "@/components/admin/AllReportsTable";
import { DeletedReportsTable } from "@/components/admin/DeletedReportsTable";
import { ReportsAuditLog } from "@/components/admin/ReportsAuditLog";
import { ReportIdConfigurator } from "@/components/admin/ReportIdConfigurator";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsAdmin() {
  const { data: reports, isLoading: reportsLoading } = useReports();
  const { data: userRoles, isLoading: roleLoading } = useUserRole();

  // Check if user is admin
  if (roleLoading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!userRoles?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administrare Rapoarte</h1>
          <p className="text-muted-foreground">
            Gestionează toate rapoartele, configurează formatul ID și vizualizează jurnalul de audit
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="stats" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Statistici</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Rapoarte</span>
            </TabsTrigger>
            <TabsTrigger value="trash" className="gap-2">
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Coș Gunoi</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Audit</span>
            </TabsTrigger>
            <TabsTrigger value="config" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configurare</span>
            </TabsTrigger>
          </TabsList>

          {/* Statistics Tab */}
          <TabsContent value="stats">
            <ReportsStatsCards reports={reports || []} />
          </TabsContent>

          {/* All Reports Tab */}
          <TabsContent value="reports">
            <AllReportsTable reports={reports || []} isLoading={reportsLoading} />
          </TabsContent>

          {/* Deleted Reports Tab */}
          <TabsContent value="trash">
            <DeletedReportsTable />
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit">
            <ReportsAuditLog />
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config">
            <div className="max-w-2xl">
              <ReportIdConfigurator />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
