import { useReportAuditLogs } from "@/hooks/useAuditLogs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { History, ArrowRight, User, Clock } from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

interface ReportAuditLogProps {
  reportId: string;
}

const statusLabels: Record<string, string> = {
  draft: "Ciornă",
  validated: "Validat",
  signed: "Semnat",
  archived: "Arhivat",
};

const actionLabels: Record<string, string> = {
  status_change: "Schimbare status",
  created: "Creat",
  updated: "Actualizat",
  deleted: "Șters",
};

export function ReportAuditLog({ reportId }: ReportAuditLogProps) {
  const { data: logs, isLoading } = useReportAuditLogs(reportId);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try {
      return format(new Date(dateStr), "d MMM yyyy, HH:mm", { locale: ro });
    } catch {
      return "—";
    }
  };

  const getStatusLabel = (status: string) => {
    return statusLabels[status] || status;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            Jurnal Modificări
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4" />
          Jurnal Modificări
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs && logs.length > 0 ? (
          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-3">
              {logs.map((log) => {
                const oldStatus = (log.old_values as any)?.status;
                const newStatus = (log.new_values as any)?.status;
                const isStatusChange = log.action === "status_change";

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <History className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <span>{actionLabels[log.action] || log.action}</span>
                        {isStatusChange && oldStatus && newStatus && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <span className="px-2 py-0.5 rounded bg-muted text-xs">
                              {getStatusLabel(oldStatus)}
                            </span>
                            <ArrowRight className="h-3 w-3" />
                            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">
                              {getStatusLabel(newStatus)}
                            </span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(log.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nu există modificări înregistrate</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
