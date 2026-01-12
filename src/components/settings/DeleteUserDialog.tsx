import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle, Trash2 } from "lucide-react";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  onConfirm: () => Promise<void>;
  isPending: boolean;
}

export function DeleteUserDialog({
  open,
  onOpenChange,
  userName,
  onConfirm,
  isPending,
}: DeleteUserDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const confirmWord = "ȘTERGE";
  const isConfirmValid = confirmText === confirmWord;

  const handleConfirm = async () => {
    if (!isConfirmValid) return;
    await onConfirm();
    setConfirmText("");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setConfirmText("");
    }
    onOpenChange(open);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="rounded-full bg-destructive/10 p-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle className="text-destructive">
              Ștergere Permanentă Utilizator
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-4 text-left">
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <p className="font-medium text-destructive">
                ⚠️ ATENȚIE: Această acțiune nu poate fi anulată!
              </p>
            </div>
            
            <p>
              Utilizatorul <strong>{userName}</strong> va fi șters permanent din sistem.
            </p>

            <div className="space-y-2">
              <p className="font-medium text-foreground">Ce se întâmplă:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Contul va fi dezactivat imediat</li>
                <li>Rapoartele create de acest utilizator vor rămâne</li>
                <li>Inginerul asociat va fi marcat ca inactiv</li>
              </ul>
            </div>

            <div className="space-y-2 pt-2">
              <Label htmlFor="confirm-delete" className="text-foreground font-medium">
                Pentru confirmare, scrieți "{confirmWord}" mai jos:
              </Label>
              <Input
                id="confirm-delete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={confirmWord}
                className="font-mono"
                disabled={isPending}
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Anulează</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmValid || isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Trash2 className="mr-2 h-4 w-4" />
            Șterge Permanent
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
