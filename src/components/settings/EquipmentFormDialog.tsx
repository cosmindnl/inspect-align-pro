import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload, FileText, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Equipment,
  useCreateEquipment,
  useUpdateEquipment,
  equipmentCategories,
  knownManufacturers,
} from "@/hooks/useEquipment";

const formSchema = z.object({
  name: z.string().min(1, "Denumirea este obligatorie"),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  verification_valid_until: z.string().optional(),
  verification_certificate_number: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface EquipmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment?: Equipment | null;
}

export function EquipmentFormDialog({
  open,
  onOpenChange,
  equipment,
}: EquipmentFormDialogProps) {
  const createEquipment = useCreateEquipment();
  const updateEquipment = useUpdateEquipment();
  const isEditing = !!equipment;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [existingCertificateUrl, setExistingCertificateUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [removeCertificate, setRemoveCertificate] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      manufacturer: "",
      model: "",
      serial_number: "",
      verification_valid_until: "",
      verification_certificate_number: "",
      category: "",
      notes: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      setCertificateFile(null);
      setRemoveCertificate(false);
      
      if (equipment) {
        form.reset({
          name: equipment.name,
          manufacturer: equipment.manufacturer || "",
          model: equipment.model || "",
          serial_number: equipment.serial_number || "",
          verification_valid_until: equipment.verification_valid_until || "",
          verification_certificate_number: equipment.verification_certificate_number || "",
          category: equipment.category || "",
          notes: equipment.notes || "",
          is_active: equipment.is_active ?? true,
        });
        setExistingCertificateUrl(equipment.certificate_url);
      } else {
        form.reset({
          name: "",
          manufacturer: "",
          model: "",
          serial_number: "",
          verification_valid_until: "",
          verification_certificate_number: "",
          category: "",
          notes: "",
          is_active: true,
        });
        setExistingCertificateUrl(null);
      }
    }
  }, [open, equipment, form]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Fișierul este prea mare. Maxim 10MB.");
        return;
      }
      setCertificateFile(file);
      setRemoveCertificate(false);
    }
  };

  const handleRemoveCertificate = () => {
    setCertificateFile(null);
    setRemoveCertificate(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadCertificate = async (file: File, equipmentId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${equipmentId}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('equipment-certificates')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('equipment-certificates')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsUploading(true);
      
      const data = {
        name: values.name,
        manufacturer: values.manufacturer || null,
        model: values.model || null,
        serial_number: values.serial_number || null,
        verification_valid_until: values.verification_valid_until || null,
        verification_certificate_number: values.verification_certificate_number || null,
        category: values.category || null,
        notes: values.notes || null,
        is_active: values.is_active,
        certificate_url: removeCertificate ? null : existingCertificateUrl,
      };

      let savedEquipment: Equipment;

      if (isEditing && equipment) {
        savedEquipment = await updateEquipment.mutateAsync({ id: equipment.id, ...data });
      } else {
        savedEquipment = await createEquipment.mutateAsync(data);
      }

      // Upload certificate if a new file was selected
      if (certificateFile) {
        const certificateUrl = await uploadCertificate(certificateFile, savedEquipment.id);
        await updateEquipment.mutateAsync({ id: savedEquipment.id, certificate_url: certificateUrl });
      }

      toast.success(isEditing ? "Echipamentul a fost actualizat" : "Echipamentul a fost adăugat");
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Eroare: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const isPending = createEquipment.isPending || updateEquipment.isPending || isUploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editare Echipament" : "Adăugare Echipament"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Denumire echipament *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Fluke 1664FC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Manufacturer */}
              <FormField
                control={form.control}
                name="manufacturer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Producător</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selectează..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {knownManufacturers.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Model */}
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 1664FC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Serial Number */}
            <FormField
              control={form.control}
              name="serial_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Număr de serie</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 12345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Verification Date */}
              <FormField
                control={form.control}
                name="verification_valid_until"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verificare valabilă până la</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Certificate Number */}
              <FormField
                control={form.control}
                name="verification_certificate_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nr. certificat verificare</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: BVM-12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Certificate Upload */}
            <div className="space-y-2">
              <FormLabel>Certificat verificare (PDF/imagine)</FormLabel>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />
              
              {!certificateFile && !existingCertificateUrl && !removeCertificate && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Încarcă certificat
                </Button>
              )}

              {certificateFile && (
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="flex-1 text-sm truncate">{certificateFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleRemoveCertificate}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {existingCertificateUrl && !certificateFile && !removeCertificate && (
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="flex-1 text-sm">Certificat încărcat</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    asChild
                  >
                    <a href={existingCertificateUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={handleRemoveCertificate}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {removeCertificate && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Certificatul va fi șters</span>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() => {
                      setRemoveCertificate(false);
                      setExistingCertificateUrl(equipment?.certificate_url || null);
                    }}
                  >
                    Anulează
                  </Button>
                </div>
              )}
            </div>

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categorie</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează categoria..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {equipmentCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observații</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observații suplimentare..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Is Active */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Echipament activ</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Echipamentele inactive nu vor apărea în lista de selecție
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Anulează
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Salvează" : "Adaugă"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
