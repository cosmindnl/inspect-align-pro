import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useCreateClient } from "@/hooks/useClients";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type ClientType = Database["public"]["Enums"]["client_type"];

const clientFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Numele trebuie să aibă cel puțin 2 caractere")
    .max(100, "Numele nu poate depăși 100 caractere"),
  client_type: z.enum(["company", "individual"] as const, {
    required_error: "Selectează tipul clientului",
  }),
  cui: z
    .string()
    .trim()
    .max(20, "CUI nu poate depăși 20 caractere")
    .optional()
    .or(z.literal("")),
  contact_person: z
    .string()
    .trim()
    .max(100, "Numele persoanei de contact nu poate depăși 100 caractere")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Adresa de email nu este validă")
    .max(255, "Email-ul nu poate depăși 255 caractere")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .max(20, "Numărul de telefon nu poate depăși 20 caractere")
    .regex(/^[0-9+\-\s()]*$/, "Numărul de telefon conține caractere invalide")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .trim()
    .max(200, "Adresa nu poate depăși 200 caractere")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .trim()
    .max(100, "Orașul nu poate depăși 100 caractere")
    .optional()
    .or(z.literal("")),
  county: z
    .string()
    .trim()
    .max(100, "Județul nu poate depăși 100 caractere")
    .optional()
    .or(z.literal("")),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

export function ClientFormDialog({
  open,
  onOpenChange,
  companyId,
}: ClientFormDialogProps) {
  const createClient = useCreateClient();
  
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      client_type: "company",
      cui: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      county: "",
    },
  });

  const onSubmit = async (values: ClientFormValues) => {
    try {
      await createClient.mutateAsync({
        company_id: companyId,
        name: values.name,
        client_type: values.client_type as ClientType,
        cui: values.cui || null,
        contact_person: values.contact_person || null,
        email: values.email || null,
        phone: values.phone || null,
        address: values.address || null,
        city: values.city || null,
        county: values.county || null,
      });
      
      toast.success("Client adăugat cu succes!");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Eroare la adăugarea clientului. Verifică permisiunile.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Client Nou</DialogTitle>
          <DialogDescription>
            Completează datele pentru a adăuga un client nou în baza de date.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Denumire *</FormLabel>
                    <FormControl>
                      <Input placeholder="SC Exemplu SRL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tip client *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selectează" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="company">Persoană juridică</SelectItem>
                        <SelectItem value="individual">Persoană fizică</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cui"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CUI / CNP</FormLabel>
                    <FormControl>
                      <Input placeholder="RO12345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_person"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Persoană de contact</FormLabel>
                    <FormControl>
                      <Input placeholder="Ion Popescu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contact@exemplu.ro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="0721234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Adresă</FormLabel>
                    <FormControl>
                      <Input placeholder="Str. Exemplu nr. 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Oraș</FormLabel>
                    <FormControl>
                      <Input placeholder="București" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="county"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Județ</FormLabel>
                    <FormControl>
                      <Input placeholder="București" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Anulează
              </Button>
              <Button type="submit" disabled={createClient.isPending}>
                {createClient.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Adaugă client
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
