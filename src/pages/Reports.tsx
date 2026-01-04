import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Pencil, 
  MoreHorizontal,
  Zap,
  Building2,
  Sun,
  FileText,
  ArrowRight,
  MapPin,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  Copy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Report {
  id: string;
  title: string;
  client: string;
  location: string;
  type: "ground" | "electrical" | "solar";
  status: "draft" | "validated" | "signed" | "archived";
  conformity: "conformant" | "nonconformant" | null;
  engineer: string;
  date: string;
}

const reports: Report[] = [
  {
    id: "BV-2024-001",
    title: "Verificare priză de pământ - Hală industrială",
    client: "SC Metalurg SRL",
    location: "București, Sector 4",
    type: "ground",
    status: "signed",
    conformity: "conformant",
    engineer: "Ion Marinescu",
    date: "28 Dec 2024",
  },
  {
    id: "RV-2024-042",
    title: "Instalație electrică nouă - Bloc rezidențial A1",
    client: "Dezvoltator Imobiliar SA",
    location: "Cluj-Napoca",
    type: "electrical",
    status: "validated",
    conformity: "conformant",
    engineer: "Maria Ionescu",
    date: "27 Dec 2024",
  },
  {
    id: "PV-2024-015",
    title: "Sistem fotovoltaic 50kW on-grid",
    client: "Fermă Ecologică SRL",
    location: "Timișoara",
    type: "solar",
    status: "draft",
    conformity: null,
    engineer: "Ion Marinescu",
    date: "26 Dec 2024",
  },
  {
    id: "BV-2024-002",
    title: "Verificare periodică priză de pământ",
    client: "Fabrica de Pâine SA",
    location: "Brașov",
    type: "ground",
    status: "validated",
    conformity: "nonconformant",
    engineer: "Maria Ionescu",
    date: "25 Dec 2024",
  },
  {
    id: "RV-2024-043",
    title: "Revizie instalație electrică - Hotel",
    client: "Hotel Carpați SRL",
    location: "Sinaia",
    type: "electrical",
    status: "signed",
    conformity: "conformant",
    engineer: "Ion Marinescu",
    date: "24 Dec 2024",
  },
  {
    id: "PV-2024-014",
    title: "Parc fotovoltaic 200kW",
    client: "Green Energy SRL",
    location: "Constanța",
    type: "solar",
    status: "signed",
    conformity: "conformant",
    engineer: "Maria Ionescu",
    date: "23 Dec 2024",
  },
  {
    id: "RV-2024-041",
    title: "Instalație electrică - Spațiu comercial",
    client: "Mall Center SA",
    location: "Iași",
    type: "electrical",
    status: "archived",
    conformity: "conformant",
    engineer: "Ion Marinescu",
    date: "20 Dec 2024",
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

const reportTypes = [
  {
    type: "ground",
    title: "Priză de Pământ",
    description: "Buletin verificare conform IEC 61557",
    icon: Zap,
    href: "/reports/ground/new",
    gradient: "from-warning/20 to-warning/5",
    iconBg: "bg-warning/20 text-warning",
  },
  {
    type: "electrical",
    title: "Instalație Electrică",
    description: "Raport verificare IEC 60364",
    icon: Building2,
    href: "/reports/electrical/new",
    gradient: "from-primary/20 to-primary/5",
    iconBg: "bg-primary/20 text-primary",
  },
  {
    type: "solar",
    title: "Sistem Fotovoltaic",
    description: "Verificare conform IEC 62446",
    icon: Sun,
    href: "/reports/solar/new",
    gradient: "from-accent/20 to-accent/5",
    iconBg: "bg-accent/20 text-accent",
  },
];

const Reports = () => {
  const [isNewReportOpen, setIsNewReportOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleSelectReportType = (href: string, title: string) => {
    setIsNewReportOpen(false);
    toast.info(`Se deschide formularul pentru ${title}...`);
    // Navigate to the report creation page (to be implemented)
    // navigate(href);
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setIsViewDialogOpen(true);
  };

  const handleEditReport = (report: Report) => {
    toast.info(`Deschidere formular editare pentru ${report.id}...`);
  };

  const handleDownloadPdf = (report: Report) => {
    toast.success(`Se descarcă PDF pentru ${report.id}...`);
  };

  const handleDuplicateReport = (report: Report) => {
    toast.success(`Raportul ${report.id} a fost duplicat.`);
  };

  return (
    <>
    <AppLayout
      title="Rapoarte"
      subtitle="Gestionează toate rapoartele de verificare"
    >
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-in">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Caută după ID, client, locație..."
            className="pl-9"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tip verificare" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate tipurile</SelectItem>
            <SelectItem value="ground">Prize de pământ</SelectItem>
            <SelectItem value="electrical">Instalații electrice</SelectItem>
            <SelectItem value="solar">Sisteme fotovoltaice</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate</SelectItem>
            <SelectItem value="draft">Ciornă</SelectItem>
            <SelectItem value="validated">Validat</SelectItem>
            <SelectItem value="signed">Semnat</SelectItem>
            <SelectItem value="archived">Arhivat</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
        <Button variant="accent" className="ml-auto" onClick={() => setIsNewReportOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Raport Nou
        </Button>
      </div>

      {/* Reports Table */}
      <div className="rounded-xl bg-card shadow-card overflow-hidden animate-slide-up">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[120px]">ID</TableHead>
              <TableHead>Raport</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Tip</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Conformitate</TableHead>
              <TableHead>Inginer</TableHead>
              <TableHead className="text-right">Data</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => {
              const TypeIcon = typeConfig[report.type].icon;
              
              return (
                <TableRow key={report.id} className="group">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {report.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg bg-muted",
                        typeConfig[report.type].color
                      )}>
                        <TypeIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground line-clamp-1">
                          {report.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {report.location}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{report.client}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {typeConfig[report.type].label}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={report.status as "draft" | "validated" | "archived"}>
                      {statusLabels[report.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {report.conformity ? (
                      <Badge variant={report.conformity}>
                        {report.conformity === "conformant" ? "Conform" : "Neconform"}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{report.engineer}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {report.date}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewReport(report)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Vizualizează
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditReport(report)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editează
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadPdf(report)}>
                          <Download className="mr-2 h-4 w-4" />
                          Descarcă PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateReport(report)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplică
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-muted-foreground">
          Afișare 1-7 din 167 rapoarte
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Anterior
          </Button>
          <Button variant="outline" size="sm">
            Următorul
          </Button>
        </div>
      </div>
    </AppLayout>

      {/* New Report Dialog */}
      <Dialog open={isNewReportOpen} onOpenChange={setIsNewReportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Creare Raport Nou</DialogTitle>
            <DialogDescription>
              Selectează tipul de verificare pentru noul raport
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-4">
            {reportTypes.map((reportType) => (
              <button
                key={reportType.type}
                onClick={() => handleSelectReportType(reportType.href, reportType.title)}
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
        </DialogContent>
      </Dialog>

      {/* View Report Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedReport && (
                <>
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg bg-muted",
                    typeConfig[selectedReport.type].color
                  )}>
                    {(() => {
                      const TypeIcon = typeConfig[selectedReport.type].icon;
                      return <TypeIcon className="h-5 w-5" />;
                    })()}
                  </div>
                  <div>
                    <span className="text-lg">{selectedReport.title}</span>
                    <p className="text-sm font-normal text-muted-foreground">{selectedReport.id}</p>
                  </div>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6 pt-4">
              {/* Status and Conformity */}
              <div className="flex gap-3">
                <Badge variant={selectedReport.status as "draft" | "validated" | "archived"}>
                  {statusLabels[selectedReport.status]}
                </Badge>
                {selectedReport.conformity && (
                  <Badge variant={selectedReport.conformity}>
                    {selectedReport.conformity === "conformant" ? (
                      <><CheckCircle2 className="mr-1 h-3 w-3" /> Conform</>
                    ) : (
                      <><XCircle className="mr-1 h-3 w-3" /> Neconform</>
                    )}
                  </Badge>
                )}
              </div>

              <Separator />

              {/* Report Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4" /> Client
                  </p>
                  <p className="font-medium">{selectedReport.client}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Locație
                  </p>
                  <p className="font-medium">{selectedReport.location}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" /> Inginer verificator
                  </p>
                  <p className="font-medium">{selectedReport.engineer}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Data verificării
                  </p>
                  <p className="font-medium">{selectedReport.date}</p>
                </div>
              </div>

              <Separator />

              {/* Type-specific info placeholder */}
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground mb-2">Tip verificare</p>
                <p className="font-medium">{typeConfig[selectedReport.type].label}</p>
                <p className="text-sm text-muted-foreground mt-3">
                  Detaliile complete ale măsurătorilor vor fi disponibile după implementarea bazei de date.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => handleEditReport(selectedReport)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editează
                </Button>
                <Button variant="accent" className="flex-1" onClick={() => handleDownloadPdf(selectedReport)}>
                  <Download className="mr-2 h-4 w-4" />
                  Descarcă PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Reports;
