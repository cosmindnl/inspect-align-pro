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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUpdateReport, ReportWithRelations } from "@/hooks/useReports";
import { Database } from "@/integrations/supabase/types";

type ReportStatus = Database['public']['Enums']['report_status'];
type ConformityStatus = Database['public']['Enums']['conformity_status'];

const formSchema = z.object({
  inspection_date: z.date(),
  status: z.string(),
  conformity: z.string().optional(),
  ambient_temperature: z.string().optional(),
  weather_conditions: z.string().optional(),
  observations: z.string().optional(),
  recommendations: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: ReportWithRelations;
}

export function EditReportDialog({ open, onOpenChange, report }: EditReportDialogProps) {
  const updateReport = useUpdateReport();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inspection_date: report.inspection_date ? new Date(report.inspection_date) : new Date(),
      status: report.status || "draft",
      conformity: report.conformity || "",
      ambient_temperature: report.ambient_temperature?.toString() || "",
      weather_conditions: report.weather_conditions || "",
      observations: report.observations || "",
      recommendations: report.recommendations || "",
    },
  });

  useEffect(() => {
    if (open && report) {
      form.reset({
        inspection_date: report.inspection_date ? new Date(report.inspection_date) : new Date(),
        status: report.status || "draft",
        conformity: report.conformity || "",
        ambient_temperature: report.ambient_temperature?.toString() || "",
        weather_conditions: report.weather_conditions || "",
        observations: report.observations || "",
        recommendations: report.recommendations || "",
      });
    }
  }, [open, report, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      await updateReport.mutateAsync({
        id: report.id,
        inspection_date: format(values.inspection_date, "yyyy-MM-dd"),
        status: values.status as ReportStatus,
        conformity: values.conformity ? values.conformity as ConformityStatus : null,
        ambient_temperature: values.ambient_temperature ? parseFloat(values.ambient_temperature) : null,
        weather_conditions: values.weather_conditions || null,
        observations: values.observations || null,
        recommendations: values.recommendations || null,
      });
      toast.success("Raportul a fost actualizat");
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Eroare la actualizare: " + error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editare Raport</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Inspection Date */}
            <FormField
              control={form.control}
              name="inspection_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data inspecției</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP", { locale: ro }) : "Selectează data"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Ciornă</SelectItem>
                        <SelectItem value="validated">Validat</SelectItem>
                        <SelectItem value="signed">Semnat</SelectItem>
                        <SelectItem value="archived">Arhivat</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conformity */}
              <FormField
                control={form.control}
                name="conformity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conformitate</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selectează" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="conformant">Conform</SelectItem>
                        <SelectItem value="non_conformant">Neconform</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Temperature */}
              <FormField
                control={form.control}
                name="ambient_temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperatură (°C)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="Ex: 22.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Weather */}
              <FormField
                control={form.control}
                name="weather_conditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condiții meteo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Însorit" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Observations */}
            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observații</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observații despre inspecție..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recommendations */}
            <FormField
              control={form.control}
              name="recommendations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recomandări</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Recomandări pentru client..."
                      className="resize-none"
                      rows={3}
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
              <Button type="submit" disabled={updateReport.isPending}>
                {updateReport.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Se salvează...
                  </>
                ) : (
                  "Salvează"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
