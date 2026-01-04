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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDeleteSite } from "@/hooks/useSites";
import { Database } from "@/integrations/supabase/types";

type Site = Database['public']['Tables']['sites']['Row'];

interface DeleteSiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site: Site | null;
}

export function DeleteSiteDialog({ open, onOpenChange, site }: DeleteSiteDialogProps) {
  const deleteSite = useDeleteSite();

  const handleDelete = async () => {
    if (!site) return;
    
    try {
      await deleteSite.mutateAsync(site.id);
      toast.success("Locația a fost ștearsă");
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Eroare la ștergerea locației: " + error.message);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ești sigur că vrei să ștergi această locație?</AlertDialogTitle>
          <AlertDialogDescription>
            Locația "{site?.name}" va fi ștearsă permanent. Rapoartele asociate vor rămâne
            în sistem dar vor fi deconectate de această locație.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteSite.isPending}>Anulează</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteSite.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteSite.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Se șterge...
              </>
            ) : (
              "Șterge locația"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
