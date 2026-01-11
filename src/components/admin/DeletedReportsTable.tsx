import { useState } from "react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { RotateCcw, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeletedReports, useRestoreReport, usePermanentDeleteReport } from "@/hooks/useDeletedReports";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const REPORT_TYPE_LABELS: Record<string, string> = {
  ground: "Împământare",
  electrical: "Electric",
  solar: "Solar",
};

export function DeletedReportsTable() {
  const { data: deletedReports, isLoading } = useDeletedReports();
  const restoreReport = useRestoreReport();
  const permanentDelete = usePermanentDeleteReport();
  
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

  const handleRestore = async (id: string) => {
    try {
      await restoreReport.mutateAsync(id);
      toast.success("Raport restaurat cu succes");
    } catch (error) {
      toast.error("Eroare la restaurarea raportului");
    }
  };

  const handlePermanentDelete = async () => {
    if (!reportToDelete) return;
    
    try {
      await permanentDelete.mutateAsync(reportToDelete);
      toast.success("Raport șters permanent");
      setReportToDelete(null);
    } catch (error) {
      toast.error("Eroare la ștergerea permanentă");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!deletedReports || deletedReports.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <p>Coșul de gunoi este gol</p>
        <p className="text-sm">Rapoartele șterse vor apărea aici</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nr. Raport</TableHead>
            <TableHead>Tip</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Site</TableHead>
            <TableHead>Data ștergere</TableHead>
            <TableHead className="text-right">Acțiuni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deletedReports.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-medium">
                {report.report_number || "-"}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {REPORT_TYPE_LABELS[report.report_type] || report.report_type}
                </Badge>
              </TableCell>
              <TableCell>{report.sites?.clients?.name || "-"}</TableCell>
              <TableCell>{report.sites?.name || "-"}</TableCell>
              <TableCell>
                {report.deleted_at 
                  ? format(new Date(report.deleted_at), "dd MMM yyyy, HH:mm", { locale: ro })
                  : "-"
                }
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRestore(report.id)}
                    disabled={restoreReport.isPending}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Restaurează
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setReportToDelete(report.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!reportToDelete} onOpenChange={() => setReportToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Ștergere permanentă
            </AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune este ireversibilă. Raportul și toate datele asociate 
              (măsurători, fișiere) vor fi șterse definitiv din baza de date.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePermanentDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Șterge permanent
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
