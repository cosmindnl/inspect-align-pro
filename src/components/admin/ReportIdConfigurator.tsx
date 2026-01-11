import { useState, useEffect } from "react";
import { Save, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCompany, useUpdateCompany } from "@/hooks/useCompany";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export function ReportIdConfigurator() {
  const { data: company, isLoading } = useCompany();
  const updateCompany = useUpdateCompany();
  
  const [prefix, setPrefix] = useState("BV");
  const [yearFormat, setYearFormat] = useState("YYYY");
  const [sequenceDigits, setSequenceDigits] = useState("4");

  useEffect(() => {
    if (company) {
      setPrefix((company as any).report_prefix || "BV");
      setYearFormat((company as any).report_year_format || "YYYY");
      setSequenceDigits(String((company as any).report_sequence_digits || 4));
    }
  }, [company]);

  const generatePreview = () => {
    const year = yearFormat === "YY" ? "26" : "2026";
    const sequence = "1".padStart(parseInt(sequenceDigits), "0");
    return `${prefix}-${year}-${sequence}`;
  };

  const handleSave = async () => {
    try {
      await updateCompany.mutateAsync({
        report_prefix: prefix,
        report_year_format: yearFormat,
        report_sequence_digits: parseInt(sequenceDigits),
      } as any);
      toast.success("Configurația a fost salvată");
    } catch (error) {
      toast.error("Eroare la salvarea configurației");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurare Format ID Raport</CardTitle>
        <CardDescription>
          Personalizează formatul numărului de raport pentru compania ta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Prefix */}
        <div className="space-y-2">
          <Label htmlFor="prefix">Prefix</Label>
          <Input
            id="prefix"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value.toUpperCase().slice(0, 10))}
            placeholder="Ex: BV, PRAM, EVR"
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            Maxim 10 caractere. Exemplu: BV, PRAM, EVR
          </p>
        </div>

        {/* Year Format */}
        <div className="space-y-3">
          <Label>Format An</Label>
          <RadioGroup value={yearFormat} onValueChange={setYearFormat}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="YYYY" id="year-full" />
              <Label htmlFor="year-full" className="font-normal cursor-pointer">
                2026 (an complet)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="YY" id="year-short" />
              <Label htmlFor="year-short" className="font-normal cursor-pointer">
                26 (an prescurtat)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Sequence Digits */}
        <div className="space-y-3">
          <Label>Număr Cifre Secvență</Label>
          <RadioGroup value={sequenceDigits} onValueChange={setSequenceDigits}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="seq-3" />
              <Label htmlFor="seq-3" className="font-normal cursor-pointer">
                3 cifre (001-999)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="4" id="seq-4" />
              <Label htmlFor="seq-4" className="font-normal cursor-pointer">
                4 cifre (0001-9999)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="5" id="seq-5" />
              <Label htmlFor="seq-5" className="font-normal cursor-pointer">
                5 cifre (00001-99999)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Preview */}
        <div className="p-4 bg-muted rounded-lg">
          <Label className="text-sm text-muted-foreground">Preview</Label>
          <div className="text-2xl font-mono font-bold mt-1">
            {generatePreview()}
          </div>
        </div>

        {/* Warning */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Modificările se aplică doar rapoartelor noi. Rapoartele existente păstrează 
            formatul vechi al numărului.
          </AlertDescription>
        </Alert>

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={updateCompany.isPending}
          className="w-full sm:w-auto"
        >
          <Save className="h-4 w-4 mr-2" />
          {updateCompany.isPending ? "Se salvează..." : "Salvează Configurația"}
        </Button>
      </CardContent>
    </Card>
  );
}
