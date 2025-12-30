import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Download, MoreVertical, Zap, Building2, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Report {
  id: string;
  title: string;
  client: string;
  type: "ground" | "electrical" | "solar";
  status: "draft" | "validated" | "signed" | "archived";
  conformity: "conformant" | "nonconformant" | null;
  date: string;
}

const reports: Report[] = [
  {
    id: "BV-2024-001",
    title: "Verificare priză de pământ - Hală industrială",
    client: "SC Metalurg SRL",
    type: "ground",
    status: "signed",
    conformity: "conformant",
    date: "28 Dec 2024",
  },
  {
    id: "RV-2024-042",
    title: "Instalație electrică nouă - Bloc rezidențial",
    client: "Dezvoltator Imobiliar SA",
    type: "electrical",
    status: "validated",
    conformity: "conformant",
    date: "27 Dec 2024",
  },
  {
    id: "PV-2024-015",
    title: "Sistem fotovoltaic 50kW",
    client: "Fermă Ecologică SRL",
    type: "solar",
    status: "draft",
    conformity: null,
    date: "26 Dec 2024",
  },
  {
    id: "BV-2024-002",
    title: "Verificare periodică priză de pământ",
    client: "Fabrica de Pâine SA",
    type: "ground",
    status: "validated",
    conformity: "nonconformant",
    date: "25 Dec 2024",
  },
  {
    id: "RV-2024-043",
    title: "Revizie instalație electrică",
    client: "Hotel Carpați SRL",
    type: "electrical",
    status: "signed",
    conformity: "conformant",
    date: "24 Dec 2024",
  },
];

const typeConfig = {
  ground: { icon: Zap, label: "Priză de pământ", color: "text-warning" },
  electrical: { icon: Building2, label: "Instalație electrică", color: "text-primary" },
  solar: { icon: Sun, label: "Fotovoltaic", color: "text-accent" },
};

const statusLabels = {
  draft: "Ciornă",
  validated: "Validat",
  signed: "Semnat",
  archived: "Arhivat",
};

export function RecentReports() {
  return (
    <div className="rounded-xl bg-card shadow-card">
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h3 className="font-semibold text-foreground">Rapoarte Recente</h3>
          <p className="text-sm text-muted-foreground">Ultimele verificări efectuate</p>
        </div>
        <Button variant="ghost" size="sm">
          Vezi toate
        </Button>
      </div>
      
      <div className="divide-y">
        {reports.map((report) => {
          const TypeIcon = typeConfig[report.type].icon;
          
          return (
            <div
              key={report.id}
              className="group flex items-center gap-4 p-4 transition-colors hover:bg-muted/30"
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg bg-muted",
                typeConfig[report.type].color
              )}>
                <TypeIcon className="h-5 w-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground truncate">
                    {report.title}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-mono text-xs">{report.id}</span>
                  <span>•</span>
                  <span>{report.client}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {report.conformity && (
                  <Badge variant={report.conformity}>
                    {report.conformity === "conformant" ? "Conform" : "Neconform"}
                  </Badge>
                )}
                <Badge variant={report.status as "draft" | "validated" | "archived"}>
                  {statusLabels[report.status]}
                </Badge>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {report.date}
                </span>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      Vizualizează
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Descarcă PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="mr-2 h-4 w-4" />
                      Editează
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
