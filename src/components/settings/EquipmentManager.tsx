import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Wrench } from "lucide-react";
import { toast } from "sonner";

// Default equipment list
export const defaultEquipment = [
  "Fluke 1664FC",
  "Fluke 1663",
  "Fluke 1662",
  "Metrel MI 3152",
  "Metrel MI 3155",
  "Megger MIT515",
  "Megger MFT1845",
  "Sonel MPI-530",
  "Sonel MPI-525",
  "Kyoritsu KEW 6016",
  "Kyoritsu KEW 4106",
  "Hioki IR4056",
  "Chauvin Arnoux CA 6117",
  "Amprobe Telaris 0100",
];

// Storage key for custom equipment
export const CUSTOM_EQUIPMENT_KEY = 'measurement_custom_equipment';

export function getStoredCustomEquipment(): string[] {
  try {
    const stored = localStorage.getItem(CUSTOM_EQUIPMENT_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveCustomEquipment(equipment: string[]) {
  localStorage.setItem(CUSTOM_EQUIPMENT_KEY, JSON.stringify(equipment));
}

export function EquipmentManager() {
  const [customEquipment, setCustomEquipment] = useState<string[]>(getStoredCustomEquipment());
  const [newEquipment, setNewEquipment] = useState("");

  const handleAddEquipment = () => {
    const trimmed = newEquipment.trim();
    if (!trimmed) {
      toast.error("Introduceți denumirea echipamentului");
      return;
    }
    
    const allEquipment = [...defaultEquipment, ...customEquipment];
    if (allEquipment.some(e => e.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Acest echipament există deja");
      return;
    }

    const updated = [...customEquipment, trimmed];
    setCustomEquipment(updated);
    saveCustomEquipment(updated);
    setNewEquipment("");
    toast.success(`Echipamentul "${trimmed}" a fost adăugat`);
  };

  const handleRemoveEquipment = (equipment: string) => {
    const updated = customEquipment.filter(e => e !== equipment);
    setCustomEquipment(updated);
    saveCustomEquipment(updated);
    toast.success(`Echipamentul "${equipment}" a fost șters`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEquipment();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Echipamente de Măsură</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Gestionează lista de echipamente de măsură disponibile pentru rapoarte. 
          Echipamentele personalizate vor fi disponibile în dialogul de adăugare măsurători.
        </p>
      </div>

      {/* Add new equipment */}
      <div className="space-y-2">
        <Label htmlFor="newEquipment">Adaugă echipament nou</Label>
        <div className="flex gap-2">
          <Input
            id="newEquipment"
            value={newEquipment}
            onChange={(e) => setNewEquipment(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ex: Fluke 1664FC"
            className="flex-1"
          />
          <Button onClick={handleAddEquipment} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Adaugă
          </Button>
        </div>
      </div>

      {/* Custom equipment list */}
      {customEquipment.length > 0 && (
        <div className="space-y-3">
          <Label>Echipamente personalizate</Label>
          <div className="flex flex-wrap gap-2">
            {customEquipment.map((equipment) => (
              <Badge 
                key={equipment} 
                variant="secondary"
                className="pl-3 pr-1 py-1.5 text-sm flex items-center gap-1"
              >
                <Wrench className="h-3 w-3 mr-1" />
                {equipment}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-1 hover:bg-destructive/20 hover:text-destructive"
                  onClick={() => handleRemoveEquipment(equipment)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Default equipment list */}
      <div className="space-y-3">
        <Label className="text-muted-foreground">Echipamente predefinite</Label>
        <div className="flex flex-wrap gap-2">
          {defaultEquipment.map((equipment) => (
            <Badge 
              key={equipment} 
              variant="outline"
              className="py-1.5 text-sm text-muted-foreground"
            >
              <Wrench className="h-3 w-3 mr-1.5" />
              {equipment}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Acestea sunt echipamente predefinite și nu pot fi șterse.
        </p>
      </div>
    </div>
  );
}
