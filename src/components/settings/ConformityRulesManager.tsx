import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Scale, FileText, Zap, Sun, Target } from "lucide-react";
import { useReports } from "@/hooks/useReports";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

// Measurement types - shared with MeasurementDialog
export const measurementTypes = [
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

// Conformity rule types
export type ConformityRule = "lte" | "gte"; // less than or equal / greater than or equal

export interface ConformityRules {
  [measurementType: string]: ConformityRule;
}

// Default rules - insulation should be >= limit, others <= limit
export const defaultConformityRules: ConformityRules = {
  resistance: "lte",
  insulation: "gte",
  continuity: "lte",
  loop_impedance: "lte",
  rcd_time: "lte",
  rcd_current: "lte",
  voltage: "lte",
  current: "lte",
  power: "lte",
  other: "lte",
};

// Storage key
const CONFORMITY_RULES_KEY = "measurement_conformity_rules";

export function getStoredConformityRules(): ConformityRules {
  try {
    const stored = localStorage.getItem(CONFORMITY_RULES_KEY);
    if (stored) {
      return { ...defaultConformityRules, ...JSON.parse(stored) };
    }
    return defaultConformityRules;
  } catch {
    return defaultConformityRules;
  }
}

export function saveConformityRules(rules: ConformityRules) {
  localStorage.setItem(CONFORMITY_RULES_KEY, JSON.stringify(rules));
}

export function getConformityRule(measurementType: string): ConformityRule {
  const rules = getStoredConformityRules();
  return rules[measurementType] || "lte";
}

const reportTypeConfig = {
  ground: { icon: Target, label: "Priză de Pământ", color: "text-amber-600" },
  electrical: { icon: Zap, label: "Verificare Electrică", color: "text-blue-600" },
  solar: { icon: Sun, label: "Instalație Solară", color: "text-yellow-500" },
};

const statusLabels: Record<string, string> = {
  draft: "Ciornă",
  validated: "Validat",
  signed: "Semnat",
  archived: "Arhivat",
};

export function ConformityRulesManager() {
  const [rules, setRules] = useState<ConformityRules>(getStoredConformityRules());
  const { data: reports, isLoading: reportsLoading } = useReports();

  useEffect(() => {
    setRules(getStoredConformityRules());
  }, []);

  const handleRuleChange = (measurementType: string, rule: ConformityRule) => {
    const updated = { ...rules, [measurementType]: rule };
    setRules(updated);
    saveConformityRules(updated);
  };

  // Group reports by type
  const reportsByType = reports?.reduce((acc, report) => {
    const type = report.report_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(report);
    return acc;
  }, {} as Record<string, typeof reports>) || {};

  return (
    <div className="space-y-8">
      {/* Reports by Category Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Rapoarte pe Categorii
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Lista rapoartelor create, grupate pe tipul de verificare.
        </p>

        {reportsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {(["ground", "electrical", "solar"] as const).map((type) => {
              const config = reportTypeConfig[type];
              const Icon = config.icon;
              const typeReports = reportsByType[type] || [];

              return (
                <div key={type} className="rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={`h-5 w-5 ${config.color}`} />
                    <h4 className="font-medium">{config.label}</h4>
                    <Badge variant="secondary" className="ml-auto">
                      {typeReports.length} rapoarte
                    </Badge>
                  </div>

                  {typeReports.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      Niciun raport în această categorie.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {typeReports.map((report) => (
                        <div
                          key={report.id}
                          className="flex items-center justify-between p-2 rounded bg-muted/50 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs">
                              {report.report_number}
                            </span>
                            <span className="text-muted-foreground">
                              {report.sites?.clients?.name || "—"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                report.conformity === "conformant"
                                  ? "default"
                                  : report.conformity === "nonconformant"
                                  ? "destructive"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {report.conformity === "conformant"
                                ? "Conform"
                                : report.conformity === "nonconformant"
                                ? "Neconform"
                                : "—"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {statusLabels[report.status || "draft"]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {report.created_at &&
                                format(new Date(report.created_at), "d MMM yyyy", {
                                  locale: ro,
                                })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Conformity Rules Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Reguli de Conformitate</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Configurează regula de conformitate pentru fiecare tip de măsurătoare. 
          Aceasta determină cum se compară valoarea măsurată cu limita pentru a stabili conformitatea automată.
        </p>
      </div>

      <div className="space-y-4">
        {measurementTypes.map((type) => (
          <div
            key={type.value}
            className="flex items-center justify-between p-3 rounded-lg border bg-card"
          >
            <div className="flex items-center gap-3">
              <Scale className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">{type.label}</p>
                <p className="text-xs text-muted-foreground">
                  {rules[type.value] === "gte" 
                    ? "Valoarea trebuie să fie ≥ limită pentru a fi conformă"
                    : "Valoarea trebuie să fie ≤ limită pentru a fi conformă"
                  }
                </p>
              </div>
            </div>
            <Select
              value={rules[type.value] || "lte"}
              onValueChange={(value: ConformityRule) => handleRuleChange(type.value, value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lte">
                  <span className="flex items-center gap-2">
                    ≤ Mai mică
                  </span>
                </SelectItem>
                <SelectItem value="gte">
                  <span className="flex items-center gap-2">
                    ≥ Mai mare
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm">
        <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
        <div>
          <p className="font-medium">Exemplu:</p>
          <p className="text-muted-foreground">
            Pentru <Badge variant="outline" className="mx-1">Rezistență de izolație</Badge> 
            regula <Badge variant="secondary" className="mx-1">≥ Mai mare</Badge> înseamnă că o valoare de 
            500 MΩ este conformă dacă limita minimă este 1 MΩ.
          </p>
        </div>
      </div>
    </div>
  );
}
