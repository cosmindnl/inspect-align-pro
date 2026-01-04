import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Scale } from "lucide-react";

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

export function ConformityRulesManager() {
  const [rules, setRules] = useState<ConformityRules>(getStoredConformityRules());

  useEffect(() => {
    setRules(getStoredConformityRules());
  }, []);

  const handleRuleChange = (measurementType: string, rule: ConformityRule) => {
    const updated = { ...rules, [measurementType]: rule };
    setRules(updated);
    saveConformityRules(updated);
  };

  return (
    <div className="space-y-6">
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
