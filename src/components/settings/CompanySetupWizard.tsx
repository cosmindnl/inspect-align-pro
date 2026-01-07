import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Building, CheckCircle, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const companySchema = z.object({
  name: z.string().min(2, "Denumirea trebuie să aibă cel puțin 2 caractere"),
  cui: z.string().optional(),
  registration_number: z.string().optional(),
  anre_certificate_number: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  county: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email invalid").optional().or(z.literal("")),
});

type CompanyFormValues = z.infer<typeof companySchema>;

interface CompanySetupWizardProps {
  onComplete?: () => void;
}

export function CompanySetupWizard({ onComplete }: CompanySetupWizardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      cui: "",
      registration_number: "",
      anre_certificate_number: "",
      address: "",
      city: "",
      county: "",
      phone: "",
      email: "",
    },
  });

  const onSubmit = async (values: CompanyFormValues) => {
    if (!user) {
      toast.error("Utilizator neautentificat");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create company
      const { data: newCompany, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: values.name,
          cui: values.cui || null,
          registration_number: values.registration_number || null,
          anre_certificate_number: values.anre_certificate_number || null,
          address: values.address || null,
          city: values.city || null,
          county: values.county || null,
          phone: values.phone || null,
          email: values.email || null,
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Update profile with company_id
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ company_id: newCompany.id })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update engineer record with company_id
      const { error: engineerError } = await supabase
        .from("engineers")
        .update({ company_id: newCompany.id })
        .eq("profile_id", user.id);

      if (engineerError) throw engineerError;

      // Refresh cached data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["profile", user.id] }),
        queryClient.invalidateQueries({ queryKey: ["company", user.id] }),
      ]);

      setIsComplete(true);
      toast.success("Compania a fost creată cu succes!");
      
      setTimeout(() => {
        onComplete?.();
      }, 1500);
    } catch (error: any) {
      console.error("Error creating company:", error);
      toast.error("Eroare la crearea companiei: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground">Companie creată!</h3>
        <p className="text-muted-foreground mt-2">
          Pagina se va actualiza automat...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Building className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Crează Compania</h3>
          <p className="text-sm text-muted-foreground">
            Configurează detaliile companiei tale
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2 mb-6">
        <div
          className={`h-2 flex-1 rounded-full ${
            step >= 1 ? "bg-primary" : "bg-muted"
          }`}
        />
        <div
          className={`h-2 flex-1 rounded-full ${
            step >= 2 ? "bg-primary" : "bg-muted"
          }`}
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Denumire Firmă *</FormLabel>
                    <FormControl>
                      <Input placeholder="SC Firma SRL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cui"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CUI</FormLabel>
                      <FormControl>
                        <Input placeholder="RO12345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registration_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reg. Com.</FormLabel>
                      <FormControl>
                        <Input placeholder="J40/1234/2020" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="anre_certificate_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certificat ANRE</FormLabel>
                    <FormControl>
                      <Input placeholder="Număr certificat" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                className="w-full mt-4"
                onClick={() => {
                  if (form.getValues("name").length >= 2) {
                    setStep(2);
                  } else {
                    form.trigger("name");
                  }
                }}
              >
                Continuă
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresă</FormLabel>
                    <FormControl>
                      <Input placeholder="Strada și numărul" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon</FormLabel>
                      <FormControl>
                        <Input placeholder="+40 XXX XXX XXX" {...field} />
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
                        <Input
                          type="email"
                          placeholder="contact@firma.ro"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Înapoi
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Se salvează...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Finalizează
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
