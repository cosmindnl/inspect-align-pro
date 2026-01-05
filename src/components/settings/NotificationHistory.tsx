import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, AlertCircle, CheckCircle2, XCircle, History } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface NotificationLog {
  id: string;
  company_id: string;
  notification_type: string;
  recipients: string[];
  equipment_count: number;
  equipment_ids: string[] | null;
  status: string;
  error_message: string | null;
  sent_at: string;
  created_at: string;
}

export function NotificationHistory() {
  const { data: profile } = useProfile();

  const { data: logs, isLoading, error } = useQuery({
    queryKey: ["notification-logs", profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return [];

      const { data, error } = await supabase
        .from("notification_logs")
        .select("*")
        .eq("company_id", profile.company_id)
        .order("sent_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as NotificationLog[];
    },
    enabled: !!profile?.company_id,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Trimis
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Eșuat
          </Badge>
        );
      case "error":
        return (
          <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-orange-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Eroare
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case "equipment_expiry":
        return "Expirare Echipamente";
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
        <p>Eroare la încărcarea istoricului</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <History className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Istoric Notificări</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Vizualizează notificările automate trimise de sistem pentru echipamentele cu verificare în expirare.
      </p>
      
      <Separator className="my-4" />

      {!logs || logs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Mail className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">Nicio notificare trimisă</p>
          <p className="text-sm mt-1">
            Notificările vor apărea aici când sistemul trimite alerte pentru echipamentele în expirare.
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Destinatari</TableHead>
                <TableHead className="text-center">Echipamente</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    <div className="font-medium">
                      {format(new Date(log.sent_at), "d MMM yyyy", { locale: ro })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(log.sent_at), "HH:mm")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {getNotificationTypeLabel(log.notification_type)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px]">
                      {log.recipients.length > 0 ? (
                        <div className="space-y-1">
                          {log.recipients.slice(0, 2).map((email, i) => (
                            <div key={i} className="text-xs truncate" title={email}>
                              {email}
                            </div>
                          ))}
                          {log.recipients.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{log.recipients.length - 2} alții
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{log.equipment_count}</Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(log.status)}
                    {log.error_message && (
                      <div className="text-xs text-destructive mt-1 max-w-[150px] truncate" title={log.error_message}>
                        {log.error_message}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
