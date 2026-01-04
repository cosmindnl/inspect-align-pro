import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { toast } from "sonner";
import { 
  Zap, 
  Building2, 
  Sun, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  CalendarIcon,
  MapPin,
  User
} from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useSitesByClient } from "@/hooks/useSites";
import { useCreateReport } from "@/hooks/useReports";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type ReportType = Database['public']['Enums']['report_type'];

interface NewReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const reportTypes = [
  {
    type: "ground" as ReportType,
    title: "Priză de Pământ",
    description: "Buletin verificare conform IEC 61557",
    icon: Zap,
    gradient: "from-warning/20 to-warning/5",
    iconBg: "bg-warning/20 text-warning",
  },
  {
    type: "electrical" as ReportType,
    title: "Instalație Electrică",
    description: "Raport verificare IEC 60364",
    icon: Building2,
    gradient: "from-primary/20 to-primary/5",
    iconBg: "bg-primary/20 text-primary",
  },
  {
    type: "solar" as ReportType,
    title: "Sistem Fotovoltaic",
    description: "Verificare conform IEC 62446",
    icon: Sun,
    gradient: "from-accent/20 to-accent/5",
    iconBg: "bg-accent/20 text-accent",
  },
];

export function NewReportDialog({ open, onOpenChange }: NewReportDialogProps) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  const [inspectionDate, setInspectionDate] = useState<Date>(new Date());
  const [engineerId, setEngineerId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { data: clients, isLoading: clientsLoading } = useClients();
  const { data: sites, isLoading: sitesLoading } = useSitesByClient(selectedClientId);
  const createReport = useCreateReport();

  // Fetch engineer ID based on current user
  useEffect(() => {
    const fetchEngineerId = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from("engineers")
        .select("id")
        .eq("profile_id", user.id)
        .maybeSingle();
      
      if (data) {
        setEngineerId(data.id);
      }
    };
    
    fetchEngineerId();
  }, [user?.id]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setStep(1);
      setSelectedType(null);
      setSelectedClientId("");
      setSelectedSiteId("");
      setInspectionDate(new Date());
    }
  }, [open]);

  // Reset site when client changes
  useEffect(() => {
    setSelectedSiteId("");
  }, [selectedClientId]);

  const handleSelectType = (type: ReportType) => {
    setSelectedType(type);
    setStep(2);
  };

  const handleBack = () => {
    if (step === 2) {
      setSelectedType(null);
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  const handleNextStep = () => {
    if (step === 2 && selectedClientId && selectedSiteId) {
      setStep(3);
    }
  };

  const handleCreateReport = async () => {
    if (!selectedType || !selectedSiteId) {
      toast.error("Completează toate câmpurile obligatorii");
      return;
    }

    try {
      await createReport.mutateAsync({
        report_type: selectedType,
        site_id: selectedSiteId,
        inspection_date: format(inspectionDate, "yyyy-MM-dd"),
        engineer_id: engineerId,
        status: "draft",
      });
      
      toast.success("Raportul a fost creat cu succes!");
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Eroare la crearea raportului: " + error.message);
    }
  };

  const selectedTypeConfig = reportTypes.find(t => t.type === selectedType);
  const selectedClient = clients?.find(c => c.id === selectedClientId);
  const selectedSite = sites?.find(s => s.id === selectedSiteId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Creare Raport Nou"}
            {step === 2 && "Selectează Locația"}
            {step === 3 && "Confirmare"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Selectează tipul de verificare pentru noul raport"}
            {step === 2 && "Alege clientul și locația pentru verificare"}
            {step === 3 && "Verifică detaliile și confirmă crearea raportului"}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Select Report Type */}
        {step === 1 && (
          <div className="space-y-3 pt-4">
            {reportTypes.map((reportType) => (
              <button
                key={reportType.type}
                onClick={() => handleSelectType(reportType.type)}
                className={cn(
                  "group w-full flex items-center gap-4 rounded-lg p-4 text-left transition-all",
                  "bg-gradient-to-r hover:shadow-md",
                  reportType.gradient
                )}
              >
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", reportType.iconBg)}>
                  <reportType.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{reportType.title}</p>
                  <p className="text-sm text-muted-foreground">{reportType.description}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Select Client and Site */}
        {step === 2 && (
          <div className="space-y-4 pt-4">
            {/* Selected Type Badge */}
            {selectedTypeConfig && (
              <div className={cn(
                "flex items-center gap-3 rounded-lg p-3",
                "bg-gradient-to-r",
                selectedTypeConfig.gradient
              )}>
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", selectedTypeConfig.iconBg)}>
                  <selectedTypeConfig.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">{selectedTypeConfig.title}</p>
                  <p className="text-xs text-muted-foreground">{selectedTypeConfig.description}</p>
                </div>
              </div>
            )}

            {/* Client Selection */}
            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger id="client">
                  <SelectValue placeholder={clientsLoading ? "Se încarcă..." : "Selectează clientul"} />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {client.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Site Selection */}
            <div className="space-y-2">
              <Label htmlFor="site">Locație / Punct de lucru *</Label>
              <Select 
                value={selectedSiteId} 
                onValueChange={setSelectedSiteId}
                disabled={!selectedClientId}
              >
                <SelectTrigger id="site">
                  <SelectValue placeholder={
                    !selectedClientId 
                      ? "Selectează mai întâi clientul" 
                      : sitesLoading 
                        ? "Se încarcă..." 
                        : sites?.length === 0 
                          ? "Nicio locație disponibilă"
                          : "Selectează locația"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {sites?.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{site.name}</span>
                        {site.city && (
                          <span className="text-muted-foreground">({site.city})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedClientId && sites?.length === 0 && !sitesLoading && (
                <p className="text-sm text-muted-foreground">
                  Acest client nu are locații. Adaugă o locație din pagina clientului.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Înapoi
              </Button>
              <Button 
                onClick={handleNextStep}
                disabled={!selectedClientId || !selectedSiteId}
              >
                Continuă
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-4 pt-4">
            {/* Summary */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              {/* Report Type */}
              {selectedTypeConfig && (
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", selectedTypeConfig.iconBg)}>
                    <selectedTypeConfig.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tip verificare</p>
                    <p className="font-medium text-sm">{selectedTypeConfig.title}</p>
                  </div>
                </div>
              )}
              
              {/* Client */}
              {selectedClient && (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Client</p>
                    <p className="font-medium text-sm">{selectedClient.name}</p>
                  </div>
                </div>
              )}
              
              {/* Site */}
              {selectedSite && (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Locație</p>
                    <p className="font-medium text-sm">
                      {selectedSite.name}
                      {selectedSite.city && `, ${selectedSite.city}`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Inspection Date */}
            <div className="space-y-2">
              <Label>Data inspecției</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !inspectionDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {inspectionDate ? format(inspectionDate, "PPP", { locale: ro }) : "Selectează data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={inspectionDate}
                    onSelect={(date) => date && setInspectionDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Înapoi
              </Button>
              <Button 
                variant="accent"
                onClick={handleCreateReport}
                disabled={createReport.isPending}
              >
                {createReport.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Se creează...
                  </>
                ) : (
                  "Crează Raportul"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
