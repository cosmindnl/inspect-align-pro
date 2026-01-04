import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
  MapPin,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  Copy,
  FileX
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useReports, ReportWithRelations } from "@/hooks/useReports";
import { NewReportDialog } from "@/components/reports/NewReportDialog";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

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


const Reports = () => {
  const navigate = useNavigate();
  const [isNewReportOpen, setIsNewReportOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportWithRelations | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: reports, isLoading, error } = useReports();

  const filteredReports = reports?.filter(report => {
    const matchesSearch = searchQuery === "" || 
      report.report_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.sites?.clients?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.sites?.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "all" || report.report_type === typeFilter;
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  }) ?? [];


  const handleViewReport = (report: ReportWithRelations) => {
    navigate(`/reports/${report.id}`);
  };

  const handleEditReport = (report: ReportWithRelations) => {
    navigate(`/reports/${report.id}`);
  };

  const handleDownloadPdf = (report: ReportWithRelations) => {
    toast.success(`Se descarcă PDF pentru ${report.report_number}...`);
  };

  const handleDuplicateReport = (report: ReportWithRelations) => {
    toast.success(`Raportul ${report.report_number} a fost duplicat.`);
  };

  const getEngineerName = (report: ReportWithRelations) => {
    if (!report.engineers?.profiles) return "—";
    const { first_name, last_name } = report.engineers.profiles;
    return [first_name, last_name].filter(Boolean).join(" ") || "—";
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try {
      return format(new Date(dateStr), "d MMM yyyy", { locale: ro });
    } catch {
      return "—";
    }
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <FileX className="h-10 w-10 mb-2" />
                      <p>Nu există rapoarte</p>
                      <p className="text-sm">Creează primul raport folosind butonul "Raport Nou"</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => {
                  const TypeIcon = typeConfig[report.report_type]?.icon || Building2;
                  
                  return (
                    <TableRow key={report.id} className="group">
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {report.report_number || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg bg-muted",
                            typeConfig[report.report_type]?.color
                          )}>
                            <TypeIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground line-clamp-1">
                              {report.sites?.name || "Locație necunoscută"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {report.sites?.city || "—"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {report.sites?.clients?.name || "—"}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {typeConfig[report.report_type]?.label || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={report.status as "draft" | "validated" | "archived"}>
                          {statusLabels[report.status as keyof typeof statusLabels] || report.status}
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
                      <TableCell className="text-sm">{getEngineerName(report)}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatDate(report.inspection_date)}
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
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Afișare {filteredReports.length} rapoarte
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled>
              Următorul
            </Button>
          </div>
        </div>
      </AppLayout>

      {/* New Report Dialog */}
      <NewReportDialog open={isNewReportOpen} onOpenChange={setIsNewReportOpen} />

      {/* View Report Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedReport && (
                <>
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg bg-muted",
                    typeConfig[selectedReport.report_type]?.color
                  )}>
                    {(() => {
                      const TypeIcon = typeConfig[selectedReport.report_type]?.icon || Building2;
                      return <TypeIcon className="h-5 w-5" />;
                    })()}
                  </div>
                  <div>
                    <span className="text-lg">{selectedReport.sites?.name || "Raport"}</span>
                    <p className="text-sm font-normal text-muted-foreground">{selectedReport.report_number}</p>
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
                  {statusLabels[selectedReport.status as keyof typeof statusLabels] || selectedReport.status}
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
                  <p className="font-medium">{selectedReport.sites?.clients?.name || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Locație
                  </p>
                  <p className="font-medium">
                    {[selectedReport.sites?.address, selectedReport.sites?.city].filter(Boolean).join(", ") || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" /> Inginer verificator
                  </p>
                  <p className="font-medium">{getEngineerName(selectedReport)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Data verificării
                  </p>
                  <p className="font-medium">{formatDate(selectedReport.inspection_date)}</p>
                </div>
              </div>

              <Separator />

              {/* Observations */}
              {selectedReport.observations && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Observații</p>
                  <p className="text-sm">{selectedReport.observations}</p>
                </div>
              )}

              {/* Recommendations */}
              {selectedReport.recommendations && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Recomandări</p>
                  <p className="text-sm">{selectedReport.recommendations}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => handleDownloadPdf(selectedReport)}>
                  <Download className="mr-2 h-4 w-4" />
                  Descarcă PDF
                </Button>
                <Button onClick={() => handleEditReport(selectedReport)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editează
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
