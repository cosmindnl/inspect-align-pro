import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, Building2, User, CheckCircle2 } from "lucide-react";

const companySchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, "Numele companiei trebuie să aibă cel puțin 2 caractere")
    .max(100, "Numele companiei nu poate depăși 100 caractere"),
  cui: z
    .string()
    .trim()
    .max(20, "CUI nu poate depăși 20 caractere")
    .optional()
    .or(z.literal("")),
  anreCertificate: z
    .string()
    .trim()
    .max(50, "Numărul certificatului nu poate depăși 50 caractere")
    .optional()
    .or(z.literal("")),
  firstName: z
    .string()
    .trim()
    .min(2, "Prenumele trebuie să aibă cel puțin 2 caractere")
    .max(50, "Prenumele nu poate depăși 50 caractere"),
  lastName: z
    .string()
    .trim()
    .min(2, "Numele trebuie să aibă cel puțin 2 caractere")
    .max(50, "Numele nu poate depăși 50 caractere"),
  phone: z
    .string()
    .trim()
    .max(20, "Numărul de telefon nu poate depăși 20 caractere")
    .regex(/^[0-9+\-\s()]*$/, "Număr de telefon invalid")
    .optional()
    .or(z.literal("")),
});

type CompanyFormValues = z.infer<typeof companySchema>;

const Onboarding = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get('invitation');
  const { user } = useAuth();

  // If someone arrives here with an invitation token, they should complete user creation/acceptance flow first.
  useEffect(() => {
    if (invitationToken) {
      navigate(`/auth?invitation=${invitationToken}`, { replace: true });
    }
  }, [invitationToken, navigate]);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: "",
      cui: "",
      anreCertificate: "",
      firstName: "",
      lastName: "",
      phone: "",
    },
  });

  const onSubmit = async (values: CompanyFormValues) => {
    if (!user) {
      toast.error("Nu ești autentificat");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create company
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: values.companyName,
          cui: values.cui || null,
          anre_certificate_number: values.anreCertificate || null,
          is_anre_certified: !!values.anreCertificate,
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // 2. Update profile with company and name
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          company_id: company.id,
          first_name: values.firstName,
          last_name: values.lastName,
          phone: values.phone || null,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // 3. Create engineer record
      const { data: engineer, error: engineerError } = await supabase
        .from("engineers")
        .insert({
          profile_id: user.id,
          company_id: company.id,
          anre_certificate_number: values.anreCertificate || null,
          is_active: true,
        })
        .select()
        .single();

      if (engineerError) throw engineerError;

      // 4. Assign engineer role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: user.id,
          role: "engineer",
        });

      if (roleError && !roleError.message.includes("duplicate")) {
        throw roleError;
      }

      setStep(3);
      toast.success("Configurare completă!");
      
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast.error(error.message || "Eroare la configurare. Încearcă din nou.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            <Building2 className="h-5 w-5" />
          </div>
          <div className={`w-16 h-1 rounded ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            <User className="h-5 w-5" />
          </div>
          <div className={`w-16 h-1 rounded ${step >= 3 ? "bg-primary" : "bg-muted"}`} />
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {step === 3 ? (
          <Card className="animate-fade-in">
            <CardContent className="pt-10 pb-10 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Configurare completă!</h2>
              <p className="text-muted-foreground">Vei fi redirecționat către dashboard...</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="animate-fade-in">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Bine ai venit!</CardTitle>
              <CardDescription>
                {step === 1 
                  ? "Configurează compania ta pentru a începe"
                  : "Completează datele profilului tău"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {step === 1 && (
                    <>
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Denumire companie *</FormLabel>
                            <FormControl>
                              <Input placeholder="SC Exemplu SRL" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                        name="anreCertificate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Număr certificat ANRE</FormLabel>
                            <FormControl>
                              <Input placeholder="ANRE-E-2024-001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="button" 
                        className="w-full mt-6"
                        onClick={() => {
                          form.trigger(["companyName", "cui", "anreCertificate"]).then((isValid) => {
                            if (isValid) setStep(2);
                          });
                        }}
                      >
                        Continuă
                      </Button>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prenume *</FormLabel>
                              <FormControl>
                                <Input placeholder="Ion" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nume *</FormLabel>
                              <FormControl>
                                <Input placeholder="Popescu" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
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
                      <div className="flex gap-3 mt-6">
                        <Button 
                          type="button" 
                          variant="outline"
                          className="flex-1"
                          onClick={() => setStep(1)}
                        >
                          Înapoi
                        </Button>
                        <Button type="submit" className="flex-1" disabled={isSubmitting}>
                          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Finalizează
                        </Button>
                      </div>
                    </>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
