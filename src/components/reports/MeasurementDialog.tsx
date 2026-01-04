import { useEffect, useState } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Check, ChevronsUpDown, Plus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useCreateMeasurement, useUpdateMeasurement } from "@/hooks/useMeasurements";
import { useActiveEquipment } from "@/hooks/useEquipment";
import { Database } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { getConformityRule, measurementTypes } from "@/components/settings/ConformityRulesManager";
import { parseISO, differenceInDays } from "date-fns";

type Measurement = Database['public']['Tables']['measurements']['Row'];

// Re-export measurementTypes for backwards compatibility
export { measurementTypes } from "@/components/settings/ConformityRulesManager";

// Default units that can be extended by user
const defaultUnits = [
  { value: "Ω", label: "Ω (Ohm)" },
  { value: "MΩ", label: "MΩ (Megaohm)" },
  { value: "kΩ", label: "kΩ (Kiloohm)" },
  { value: "V", label: "V (Volt)" },
  { value: "A", label: "A (Amper)" },
  { value: "mA", label: "mA (Miliamper)" },
  { value: "kW", label: "kW (Kilowatt)" },
  { value: "W", label: "W (Watt)" },
  { value: "ms", label: "ms (Milisecunde)" },
  { value: "Hz", label: "Hz (Hertz)" },
  { value: "°C", label: "°C (Grade Celsius)" },
  { value: "%", label: "% (Procent)" },
];

// Storage key for custom units
const CUSTOM_UNITS_KEY = 'measurement_custom_units';

function getStoredCustomUnits(): string[] {
  try {
    const stored = localStorage.getItem(CUSTOM_UNITS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCustomUnit(unit: string) {
  const existing = getStoredCustomUnits();
  if (!existing.includes(unit)) {
    localStorage.setItem(CUSTOM_UNITS_KEY, JSON.stringify([...existing, unit]));
  }
}

function isEquipmentExpired(validUntil: string | null): boolean {
  if (!validUntil) return false;
  const today = new Date();
  const expiryDate = parseISO(validUntil);
  return differenceInDays(expiryDate, today) < 0;
}

function isEquipmentExpiringSoon(validUntil: string | null): boolean {
  if (!validUntil) return false;
  const today = new Date();
  const expiryDate = parseISO(validUntil);
  const days = differenceInDays(expiryDate, today);
  return days >= 0 && days <= 30;
}

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
  const { data: dbEquipment } = useActiveEquipment();
  const isEditing = !!measurement;
  
  // Unit combobox state
  const [unitOpen, setUnitOpen] = useState(false);
  const [customUnits, setCustomUnits] = useState<string[]>(getStoredCustomUnits());
  const [newUnitInput, setNewUnitInput] = useState("");

  // Equipment combobox state
  const [equipmentOpen, setEquipmentOpen] = useState(false);

  // Combined units list
  const allUnits = [
    ...defaultUnits,
    ...customUnits.map(u => ({ value: u, label: `${u} (personalizat)` }))
  ];

  // Equipment list from database
  const allEquipment = (dbEquipment || []).map(eq => ({
    value: eq.name,
    label: eq.manufacturer ? `${eq.manufacturer} ${eq.name}` : eq.name,
    expired: isEquipmentExpired(eq.verification_valid_until),
    expiringSoon: isEquipmentExpiringSoon(eq.verification_valid_until),
  }));

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

  const handleAddCustomUnit = () => {
    const trimmed = newUnitInput.trim();
    if (trimmed && !allUnits.some(u => u.value === trimmed)) {
      saveCustomUnit(trimmed);
      setCustomUnits(prev => [...prev, trimmed]);
      form.setValue("unit", trimmed);
      setNewUnitInput("");
      setUnitOpen(false);
      toast.success(`Unitatea "${trimmed}" a fost adăugată`);
    }
  };

  // Get selected equipment warning status
  const selectedEquipmentName = form.watch("equipment_used");
  const selectedEquipmentInfo = allEquipment.find(eq => eq.value === selectedEquipmentName);

  // Watch value and limit_value for auto-conformity calculation
  const watchedValue = form.watch("value");
  const watchedLimit = form.watch("limit_value");
  const watchedType = form.watch("measurement_type");

  useEffect(() => {
    // Only auto-calculate if both value and limit are provided
    if (watchedValue && watchedLimit && watchedType) {
      const numValue = parseFloat(watchedValue);
      const numLimit = parseFloat(watchedLimit);
      
      if (!isNaN(numValue) && !isNaN(numLimit)) {
        // Get the conformity rule from settings
        const rule = getConformityRule(watchedType);
        const isConformant = rule === "gte" 
          ? numValue >= numLimit 
          : numValue <= numLimit;
        
        form.setValue("is_conformant", isConformant);
      }
    }
  }, [watchedValue, watchedLimit, watchedType, form]);

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

              {/* Unit with Combobox */}
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Unitate</FormLabel>
                    <Popover open={unitOpen} onOpenChange={setUnitOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={unitOpen}
                            className={cn(
                              "w-full justify-between font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value || "Selectează..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0 bg-popover" align="start">
                        <Command>
                          <CommandInput 
                            placeholder="Caută unitate..." 
                            value={newUnitInput}
                            onValueChange={setNewUnitInput}
                          />
                          <CommandList>
                            <CommandEmpty>
                              <div className="p-2">
                                <p className="text-sm text-muted-foreground mb-2">
                                  Unitatea nu există
                                </p>
                                {newUnitInput.trim() && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full"
                                    onClick={handleAddCustomUnit}
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Adaugă "{newUnitInput.trim()}"
                                  </Button>
                                )}
                              </div>
                            </CommandEmpty>
                            <CommandGroup heading="Unități">
                              {allUnits.map((unit) => (
                                <CommandItem
                                  key={unit.value}
                                  value={unit.value}
                                  onSelect={(value) => {
                                    field.onChange(value);
                                    setUnitOpen(false);
                                    setNewUnitInput("");
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === unit.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {unit.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
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
              {/* Equipment Select */}
              <FormField
                control={form.control}
                name="equipment_used"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Echipament utilizat</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={cn(
                          selectedEquipmentInfo?.expired && "border-destructive",
                          selectedEquipmentInfo?.expiringSoon && "border-yellow-500"
                        )}>
                          <SelectValue placeholder="Selectează..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {allEquipment.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            Nu există echipamente. Adaugă din Setări.
                          </div>
                        ) : (
                          allEquipment.map((equipment) => (
                            <SelectItem 
                              key={equipment.value} 
                              value={equipment.value}
                              className={cn(
                                equipment.expired && "text-destructive",
                                equipment.expiringSoon && "text-yellow-600"
                              )}
                            >
                              <span className="flex items-center gap-2">
                                {equipment.expired && <AlertTriangle className="h-3 w-3" />}
                                {equipment.label}
                              </span>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {selectedEquipmentInfo?.expired && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Verificarea metrologică a expirat!
                      </p>
                    )}
                    {selectedEquipmentInfo?.expiringSoon && !selectedEquipmentInfo?.expired && (
                      <p className="text-xs text-yellow-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Verificarea expiră în curând
                      </p>
                    )}
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
