import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { History, User, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuditLogs } from "@/hooks/useAuditLogs";

const ACTION_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  CREATE: { label: "Creat", variant: "default" },
  UPDATE: { label: "Modificat", variant: "secondary" },
  DELETE: { label: "Șters", variant: "destructive" },
  STATUS_CHANGE: { label: "Status schimbat", variant: "outline" },
};

export function ReportsAuditLog() {
  const { data: logs, isLoading } = useAuditLogs("reports");

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <p>Nu există înregistrări în jurnal</p>
        <p className="text-sm">Modificările rapoartelor vor apărea aici</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-4">
        {logs.map((log) => {
          const actionInfo = ACTION_LABELS[log.action] || { label: log.action, variant: "outline" as const };
          
          return (
            <div
              key={log.id}
              className="flex items-start gap-4 p-4 rounded-lg border bg-card"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={actionInfo.variant}>
                    {actionInfo.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {log.created_at && format(new Date(log.created_at), "dd MMM yyyy, HH:mm", { locale: ro })}
                  </span>
                </div>
                
                <div className="mt-1 text-sm">
                  <span className="text-muted-foreground">Raport ID: </span>
                  <span className="font-mono text-xs">{log.record_id?.slice(0, 8)}...</span>
                </div>
                
                {log.new_values && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <details>
                      <summary className="cursor-pointer hover:text-foreground">
                        Vezi detalii modificări
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                        {JSON.stringify(log.new_values, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
