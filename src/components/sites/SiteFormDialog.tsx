import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateSite, useUpdateSite } from "@/hooks/useSites";
import { Database } from "@/integrations/supabase/types";

type Site = Database['public']['Tables']['sites']['Row'];
type InstallationType = Database['public']['Enums']['installation_type'];

const installationTypes = [
  { value: "residential", label: "Rezidențial" },
  { value: "commercial", label: "Comercial" },
  { value: "industrial", label: "Industrial" },
  { value: "public", label: "Public" },
];

const formSchema = z.object({
  name: z.string().min(1, "Numele locației este obligatoriu"),
  address: z.string().optional(),
  city: z.string().optional(),
  county: z.string().optional(),
  installation_type: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface SiteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  site?: Site | null;
}

export function SiteFormDialog({ open, onOpenChange, clientId, site }: SiteFormDialogProps) {
  const createSite = useCreateSite();
  const updateSite = useUpdateSite();
  const isEditing = !!site;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      county: "",
      installation_type: "residential",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (site) {
        form.reset({
          name: site.name,
          address: site.address || "",
          city: site.city || "",
          county: site.county || "",
          installation_type: site.installation_type || "residential",
          notes: site.notes || "",
        });
      } else {
        form.reset({
          name: "",
          address: "",
          city: "",
          county: "",
          installation_type: "residential",
          notes: "",
        });
      }
    }
  }, [open, site, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const data = {
        name: values.name,
        address: values.address || null,
        city: values.city || null,
        county: values.county || null,
        installation_type: (values.installation_type as InstallationType) || null,
        notes: values.notes || null,
      };

      if (isEditing && site) {
        await updateSite.mutateAsync({ id: site.id, ...data });
        toast.success("Locația a fost actualizată");
      } else {
        await createSite.mutateAsync({ ...data, client_id: clientId });
        toast.success("Locația a fost adăugată");
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Eroare: " + error.message);
    }
  };

  const isPending = createSite.isPending || updateSite.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editare Locație" : "Adăugare Locație"}
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
                  <FormLabel>Nume locație *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Sediu Central" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Installation Type */}
            <FormField
              control={form.control}
              name="installation_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tip instalație</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează tipul" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {installationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresă</FormLabel>
                  <FormControl>
                    <Input placeholder="Strada, număr..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* City */}
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localitate</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: București" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* County */}
              <FormField
                control={form.control}
                name="county"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Județ</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Sector 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observații</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Note adiționale despre locație..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Anulează
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Se salvează...
                  </>
                ) : isEditing ? (
                  "Salvează"
                ) : (
                  "Adaugă"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
