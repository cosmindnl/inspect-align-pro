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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateMeasurement, useUpdateMeasurement } from "@/hooks/useMeasurements";
import { Database } from "@/integrations/supabase/types";

type Measurement = Database['public']['Tables']['measurements']['Row'];

const measurementTypes = [
  { value: "resistance", label: "Rezistență de dispersie (Ω)" },
  { value: "insulation", label: "Rezistență de izolație (MΩ)" },
  { value: "continuity", label: "Continuitate (Ω)" },
  { value: "loop_impedance", label: "Impedanță buclă (Ω)" },
  { value: "rcd_time", label: "Timp declanșare RCD (ms)" },
  { value: "rcd_current", label: "Curent declanșare RCD (mA)" },
  { value: "voltage", label: "Tensiune (V)" },
  { value: "current", label: "Curent (A)" },
  { value: "power", label: "Putere (kW)" },
  { value: "other", label: "Altele" },
];

const formSchema = z.object({
  measurement_type: z.string().min(1, "Selectează tipul măsurătorii"),
  value: z.string().optional(),
  unit: z.string().optional(),
  limit_value: z.string().optional(),
  location_description: z.string().optional(),
  equipment_used: z.string().optional(),
  measurement_method: z.string().optional(),
  is_conformant: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MeasurementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  measurement?: Measurement | null;
}

export function MeasurementDialog({ open, onOpenChange, reportId, measurement }: MeasurementDialogProps) {
  const createMeasurement = useCreateMeasurement();
  const updateMeasurement = useUpdateMeasurement();
  const isEditing = !!measurement;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      measurement_type: "",
      value: "",
      unit: "",
      limit_value: "",
      location_description: "",
      equipment_used: "",
      measurement_method: "",
      is_conformant: false,
    },
  });

  useEffect(() => {
    if (open) {
      if (measurement) {
        form.reset({
          measurement_type: measurement.measurement_type,
          value: measurement.value?.toString() || "",
          unit: measurement.unit || "",
          limit_value: measurement.limit_value?.toString() || "",
          location_description: measurement.location_description || "",
          equipment_used: measurement.equipment_used || "",
          measurement_method: measurement.measurement_method || "",
          is_conformant: measurement.is_conformant ?? false,
        });
      } else {
        form.reset({
          measurement_type: "",
          value: "",
          unit: "",
          limit_value: "",
          location_description: "",
          equipment_used: "",
          measurement_method: "",
          is_conformant: false,
        });
      }
    }
  }, [open, measurement, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const data = {
        measurement_type: values.measurement_type,
        value: values.value ? parseFloat(values.value) : null,
        unit: values.unit || null,
        limit_value: values.limit_value ? parseFloat(values.limit_value) : null,
        location_description: values.location_description || null,
        equipment_used: values.equipment_used || null,
        measurement_method: values.measurement_method || null,
        is_conformant: values.is_conformant ?? null,
      };

      if (isEditing && measurement) {
        await updateMeasurement.mutateAsync({ id: measurement.id, ...data });
        toast.success("Măsurătoarea a fost actualizată");
      } else {
        await createMeasurement.mutateAsync({ ...data, report_id: reportId });
        toast.success("Măsurătoarea a fost adăugată");
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Eroare: " + error.message);
    }
  };

  const isPending = createMeasurement.isPending || updateMeasurement.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editare Măsurătoare" : "Adăugare Măsurătoare"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Measurement Type */}
            <FormField
              control={form.control}
              name="measurement_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tip măsurătoare *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează tipul" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {measurementTypes.map((type) => (
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

            <div className="grid grid-cols-3 gap-4">
              {/* Value */}
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valoare</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Unit */}
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unitate</FormLabel>
                    <FormControl>
                      <Input placeholder="Ω, V, A..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Limit */}
              <FormField
                control={form.control}
                name="limit_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limită</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location */}
            <FormField
              control={form.control}
              name="location_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Locație / Punct de măsură</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Tablou electric principal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Equipment */}
              <FormField
                control={form.control}
                name="equipment_used"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Echipament utilizat</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Fluke 1664FC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Method */}
              <FormField
                control={form.control}
                name="measurement_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metodă</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 2 poli" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Conformant */}
            <FormField
              control={form.control}
              name="is_conformant"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    Valoare conformă cu limita
                  </FormLabel>
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
