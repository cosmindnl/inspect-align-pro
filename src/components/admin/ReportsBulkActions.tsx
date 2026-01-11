import { useState } from "react";
import { Check, Trash2, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useBulkUpdateStatus, useBulkDeleteReports } from "@/hooks/useDeletedReports";
import { toast } from "sonner";

interface ReportsBulkActionsProps {
  selectedIds: string[];
  onClearSelection: () => void;
}

export function ReportsBulkActions({ selectedIds, onClearSelection }: ReportsBulkActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  
  const bulkUpdateStatus = useBulkUpdateStatus();
  const bulkDelete = useBulkDeleteReports();

  const handleStatusChange = async () => {
    if (!selectedStatus || selectedIds.length === 0) return;
    
    try {
      await bulkUpdateStatus.mutateAsync({ ids: selectedIds, status: selectedStatus });
      toast.success(`${selectedIds.length} rapoarte actualizate la status "${selectedStatus}"`);
      setSelectedStatus("");
      onClearSelection();
    } catch (error) {
      toast.error("Eroare la actualizarea statusului");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDelete.mutateAsync(selectedIds);
      toast.success(`${selectedIds.length} rapoarte mutate în coșul de gunoi`);
      onClearSelection();
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error("Eroare la ștergerea rapoartelor");
    }
  };

  const handleExportCSV = () => {
    // Export logic will be implemented here
    toast.info("Export CSV în curs de dezvoltare");
  };

  if (selectedIds.length === 0) return null;

  return (
    <>
      <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
        <span className="text-sm font-medium">
          {selectedIds.length} rapoarte selectate
        </span>
        
        <div className="flex items-center gap-2 ml-auto">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[160px] h-8">
              <SelectValue placeholder="Schimbă status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="validated">Validat</SelectItem>
              <SelectItem value="signed">Semnat</SelectItem>
              <SelectItem value="archived">Arhivat</SelectItem>
            </SelectContent>
          </Select>
          
          {selectedStatus && (
            <Button 
              size="sm" 
              onClick={handleStatusChange}
              disabled={bulkUpdateStatus.isPending}
            >
              <Check className="h-4 w-4 mr-1" />
              Aplică
            </Button>
          )}
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleExportCSV}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          
          <Button 
            size="sm" 
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Șterge
          </Button>
          
          <Button 
            size="sm" 
            variant="ghost"
            onClick={onClearSelection}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmare ștergere</AlertDialogTitle>
            <AlertDialogDescription>
              Ești sigur că vrei să ștergi {selectedIds.length} rapoarte? 
              Acestea vor fi mutate în coșul de gunoi și pot fi restaurate ulterior.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
