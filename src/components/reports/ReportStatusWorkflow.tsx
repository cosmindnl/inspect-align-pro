import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { 
  FileEdit, 
  CheckCircle, 
  PenLine, 
  Archive,
  ArrowRight,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpdateReport } from "@/hooks/useReports";
import { toast } from "sonner";

type ReportStatus = "draft" | "validated" | "signed" | "archived";

interface ReportStatusWorkflowProps {
  reportId: string;
  currentStatus: ReportStatus;
  onStatusChange?: (newStatus: ReportStatus) => void;
}

const statusConfig: Record<ReportStatus, { 
  label: string; 
  icon: typeof FileEdit; 
  color: string;
  bgColor: string;
  nextStatus: ReportStatus | null;
  nextLabel: string | null;
  nextIcon: typeof FileEdit | null;
}> = {
  draft: { 
    label: "Ciornă", 
    icon: FileEdit, 
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    nextStatus: "validated",
    nextLabel: "Validează",
    nextIcon: CheckCircle
  },
  validated: { 
    label: "Validat", 
    icon: CheckCircle, 
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    nextStatus: "signed",
    nextLabel: "Semnează",
    nextIcon: PenLine
  },
  signed: { 
    label: "Semnat", 
    icon: PenLine, 
    color: "text-green-600",
    bgColor: "bg-green-100",
    nextStatus: "archived",
    nextLabel: "Arhivează",
    nextIcon: Archive
  },
  archived: { 
    label: "Arhivat", 
    icon: Archive, 
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    nextStatus: null,
    nextLabel: null,
    nextIcon: null
  },
};

const statusOrder: ReportStatus[] = ["draft", "validated", "signed", "archived"];

export function ReportStatusWorkflow({ 
  reportId, 
  currentStatus, 
  onStatusChange 
}: ReportStatusWorkflowProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ReportStatus | null>(null);
  const updateReport = useUpdateReport();

  const currentConfig = statusConfig[currentStatus];
  const currentIndex = statusOrder.indexOf(currentStatus);

  const handleAdvanceStatus = () => {
    if (currentConfig.nextStatus) {
      setPendingStatus(currentConfig.nextStatus);
      setIsConfirmOpen(true);
    }
  };

  const handleRevertStatus = (targetStatus: ReportStatus) => {
    setPendingStatus(targetStatus);
    setIsConfirmOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!pendingStatus) return;

    try {
      // Build update object with proper typing
      let validated_at: string | null | undefined = undefined;
      let signed_at: string | null | undefined = undefined;

      // Set timestamps based on status change
      if (pendingStatus === "validated") {
        validated_at = new Date().toISOString();
      } else if (pendingStatus === "signed") {
        signed_at = new Date().toISOString();
      } else if (pendingStatus === "draft") {
        // Clear timestamps when reverting to draft
        validated_at = null;
        signed_at = null;
      } else if (currentStatus === "signed" && pendingStatus !== "archived") {
        // Clear signed timestamp when reverting from signed
        signed_at = null;
      }

      await updateReport.mutateAsync({ 
        id: reportId, 
        status: pendingStatus,
        ...(validated_at !== undefined && { validated_at }),
        ...(signed_at !== undefined && { signed_at })
      });
      toast.success(`Statusul a fost schimbat în "${statusConfig[pendingStatus].label}"`);
      onStatusChange?.(pendingStatus);
    } catch (error: any) {
      toast.error("Eroare la schimbarea statusului: " + error.message);
    } finally {
      setIsConfirmOpen(false);
      setPendingStatus(null);
    }
  };

  const getConfirmationMessage = () => {
    if (!pendingStatus) return "";
    
    const isAdvancing = statusOrder.indexOf(pendingStatus) > currentIndex;
    
    if (isAdvancing) {
      if (pendingStatus === "validated") {
        return "Validarea raportului confirmă că toate datele sunt corecte. Doriți să continuați?";
      } else if (pendingStatus === "signed") {
        return "Semnarea raportului îl marchează ca final. Doriți să continuați?";
      } else if (pendingStatus === "archived") {
        return "Arhivarea raportului îl marchează ca închis. Doriți să continuați?";
      }
      return "Doriți să schimbați statusul raportului?";
    } else {
      return `Revenirea la statusul "${statusConfig[pendingStatus].label}" va anula progresul. Doriți să continuați?`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Progress */}
      <div className="flex items-center justify-between">
        {statusOrder.map((status, index) => {
          const config = statusConfig[status];
          const StatusIcon = config.icon;
          const isActive = status === currentStatus;
          const isCompleted = index < currentIndex;
          const isFuture = index > currentIndex;

          return (
            <div key={status} className="flex items-center">
              <button
                onClick={() => isCompleted && handleRevertStatus(status)}
                disabled={isFuture || isActive || updateReport.isPending}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all",
                  isCompleted && "cursor-pointer hover:opacity-80",
                  (isFuture || isActive) && "cursor-default"
                )}
              >
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                  isActive && cn(config.bgColor, config.color, "border-current"),
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isFuture && "bg-muted border-muted-foreground/20 text-muted-foreground"
                )}>
                  <StatusIcon className="h-5 w-5" />
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  isActive && config.color,
                  isCompleted && "text-primary",
                  isFuture && "text-muted-foreground"
                )}>
                  {config.label}
                </span>
              </button>
              
              {index < statusOrder.length - 1 && (
                <div className={cn(
                  "h-0.5 w-8 mx-2 transition-all",
                  index < currentIndex ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Action Button */}
      {currentConfig.nextStatus && (
        <Button 
          onClick={handleAdvanceStatus}
          disabled={updateReport.isPending}
          className="w-full"
          variant="default"
        >
          {updateReport.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : currentConfig.nextIcon && (
            <currentConfig.nextIcon className="mr-2 h-4 w-4" />
          )}
          {currentConfig.nextLabel}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}

      {currentStatus === "archived" && (
        <div className="text-center text-sm text-muted-foreground">
          Raportul este arhivat. Click pe un status anterior pentru a reveni.
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingStatus && statusOrder.indexOf(pendingStatus) > currentIndex 
                ? `Confirmă: ${statusConfig[pendingStatus]?.label}`
                : `Revenire la: ${pendingStatus && statusConfig[pendingStatus]?.label}`
              }
            </AlertDialogTitle>
            <AlertDialogDescription>
              {getConfirmationMessage()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateReport.isPending}>
              Anulează
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmStatusChange}
              disabled={updateReport.isPending}
            >
              {updateReport.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirmă
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
