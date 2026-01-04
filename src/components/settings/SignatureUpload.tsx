import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Upload, 
  Trash2, 
  Loader2, 
  PenLine,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentEngineer, useUpdateEngineerSignature } from "@/hooks/useEngineer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SignatureUpload() {
  const { user } = useAuth();
  const { data: engineer, isLoading } = useCurrentEngineer();
  const updateSignature = useUpdateEngineerSignature();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Vă rugăm să încărcați o imagine");
      return;
    }

    // Validate file size (max 1MB for signatures)
    if (file.size > 1 * 1024 * 1024) {
      toast.error("Imaginea trebuie să fie mai mică de 1MB");
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/signature.${fileExt}`;

      // Delete existing signature first
      const { data: existingFiles } = await supabase.storage
        .from('signatures')
        .list(user.id);

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `${user.id}/${f.name}`);
        await supabase.storage
          .from('signatures')
          .remove(filesToDelete);
      }

      // Upload new signature
      const { error: uploadError } = await supabase.storage
        .from('signatures')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('signatures')
        .getPublicUrl(fileName);

      // Update engineer record
      await updateSignature.mutateAsync(publicUrl);
      
      toast.success("Semnătura a fost încărcată cu succes");
    } catch (error: any) {
      toast.error("Eroare la încărcare: " + error.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!user?.id) return;

    setIsUploading(true);
    try {
      // Delete all files in user's signature folder
      const { data: files } = await supabase.storage
        .from('signatures')
        .list(user.id);

      if (files && files.length > 0) {
        const filesToDelete = files.map(f => `${user.id}/${f.name}`);
        await supabase.storage
          .from('signatures')
          .remove(filesToDelete);
      }

      // Update engineer record
      await updateSignature.mutateAsync(null);
      
      toast.success("Semnătura a fost ștearsă");
    } catch (error: any) {
      toast.error("Eroare la ștergere: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!engineer) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Nu aveți un profil de inginer asociat. Contactați administratorul.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <Label className="mb-3 block">Semnătură Digitală</Label>
      <p className="text-sm text-muted-foreground mb-4">
        Încărcați o imagine cu semnătura dvs. pentru a fi afișată pe rapoartele semnate.
      </p>
      
      <div className="flex items-start gap-4">
        <div className="relative h-24 w-48 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted/50">
          {engineer.signature_url ? (
            <img 
              src={engineer.signature_url} 
              alt="Semnătura dvs." 
              className="h-full w-full object-contain p-2"
            />
          ) : (
            <PenLine className="h-8 w-8 text-muted-foreground/50" />
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {engineer.signature_url ? 'Schimbă Semnătura' : 'Încarcă Semnătura'}
          </Button>
          {engineer.signature_url && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={isUploading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Șterge Semnătura
            </Button>
          )}
          <p className="text-xs text-muted-foreground">
            PNG sau JPG cu fundal transparent. Max 1MB.
          </p>
        </div>
      </div>
    </div>
  );
}
