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
import { useDeleteClient } from "@/hooks/useClients";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type Client = Database["public"]["Tables"]["clients"]["Row"];

interface DeleteClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
}

export function DeleteClientDialog({
  open,
  onOpenChange,
  client,
}: DeleteClientDialogProps) {
  const deleteClient = useDeleteClient();

  const handleDelete = async () => {
    if (!client) return;

    try {
      await deleteClient.mutateAsync(client.id);
      toast.success("Client șters cu succes!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Eroare la ștergerea clientului. Verifică permisiunile.");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmare ștergere</AlertDialogTitle>
          <AlertDialogDescription>
            Ești sigur că vrei să ștergi clientul <strong>{client?.name}</strong>?
            <br />
            <br />
            Această acțiune nu poate fi anulată. Toate datele asociate cu acest client vor fi marcate ca șterse.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Anulează</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteClient.isPending}
          >
            {deleteClient.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Șterge client
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
