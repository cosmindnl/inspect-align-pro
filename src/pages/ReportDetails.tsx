import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowLeft,
  Pencil,
  Download,
  Trash2,
  Plus,
  Zap,
  Building2,
  Sun,
  MapPin,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  Thermometer,
  Clock,
  FileText,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReport, useDeleteReport } from "@/hooks/useReports";
import { useMeasurements, useDeleteMeasurement } from "@/hooks/useMeasurements";
import { useCompany } from "@/hooks/useCompany";
import { EditReportDialog } from "@/components/reports/EditReportDialog";
import { MeasurementDialog } from "@/components/reports/MeasurementDialog";
import { ReportStatusWorkflow } from "@/components/reports/ReportStatusWorkflow";
import { DeleteReportDialog } from "@/components/reports/DeleteReportDialog";
import { generateReportPDF } from "@/lib/generateReportPDF";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { toast } from "sonner";

const typeConfig = {
  ground: { icon: Zap, label: "Priză de pământ", color: "text-warning", bg: "bg-warning/10" },
  electrical: { icon: Building2, label: "Instalație electrică", color: "text-primary", bg: "bg-primary/10" },
  solar: { icon: Sun, label: "Fotovoltaic", color: "text-accent", bg: "bg-accent/10" },
};

const statusLabels = {
  draft: "Ciornă",
  validated: "Validat",
  signed: "Semnat",
  archived: "Arhivat",
};

const ReportDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isMeasurementOpen, setIsMeasurementOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<any>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { data: report, isLoading: reportLoading } = useReport(id || "");
  const { data: measurements, isLoading: measurementsLoading } = useMeasurements(id || "");
  const { data: company } = useCompany();
  const deleteReport = useDeleteReport();
  const deleteMeasurement = useDeleteMeasurement();

  const handleDownloadPDF = async () => {
    if (!report) return;
    setIsGeneratingPDF(true);
    try {
      await generateReportPDF(report as any, measurements || [], company);
      toast.success("PDF generat cu succes");
    } catch (error: any) {
      toast.error("Eroare la generarea PDF: " + error.message);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!id) return;
    try {
      await deleteReport.mutateAsync(id);
      toast.success("Raportul a fost șters");
      navigate("/reports");
    } catch (error: any) {
      toast.error("Eroare la ștergerea raportului: " + error.message);
    }
  };

  const handleDeleteMeasurement = async (measurementId: string) => {
    if (!id) return;
    try {
      await deleteMeasurement.mutateAsync({ id: measurementId, reportId: id });
      toast.success("Măsurătoarea a fost ștearsă");
    } catch (error: any) {
      toast.error("Eroare la ștergerea măsurătorii: " + error.message);
    }
  };

  const handleEditMeasurement = (measurement: any) => {
    setEditingMeasurement(measurement);
    setIsMeasurementOpen(true);
  };

  const handleAddMeasurement = () => {
    setEditingMeasurement(null);
    setIsMeasurementOpen(true);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try {
      return format(new Date(dateStr), "d MMMM yyyy", { locale: ro });
    } catch {
      return "—";
    }
  };

  const getEngineerName = () => {
    if (!report?.engineers?.profiles) return "—";
    const { first_name, last_name } = report.engineers.profiles;
    return [first_name, last_name].filter(Boolean).join(" ") || "—";
  };

  if (reportLoading) {
    return (
      <AppLayout title="Detalii Raport" subtitle="Se încarcă...">
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!report) {
    return (
      <AppLayout title="Raport negăsit" subtitle="Acest raport nu există sau a fost șters">
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Raportul nu a fost găsit</p>
          <Button onClick={() => navigate("/reports")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Înapoi la rapoarte
          </Button>
        </div>
      </AppLayout>
    );
  }

  const TypeIcon = typeConfig[report.report_type]?.icon || Building2;
  const typeInfo = typeConfig[report.report_type];

  return (
    <>
      <AppLayout
        title={
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/reports")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", typeInfo?.bg)}>
              <TypeIcon className={cn("h-5 w-5", typeInfo?.color)} />
            </div>
            <div>
              <span className="text-lg font-semibold">{report.report_number || "Raport nou"}</span>
              <p className="text-sm font-normal text-muted-foreground">{typeInfo?.label}</p>
            </div>
          </div>
        }
        subtitle=""
      >
        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          <Button variant="outline" onClick={() => setIsEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editează
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
            {isGeneratingPDF ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Descarcă PDF
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Șterge
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Workflow */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Status Raport</CardTitle>
              </CardHeader>
              <CardContent>
                <ReportStatusWorkflow 
                  reportId={report.id}
                  currentStatus={report.status as "draft" | "validated" | "signed" | "archived"}
                />
                {report.conformity && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Conformitate</p>
                    <Badge variant={report.conformity} className="text-sm">
                      {report.conformity === "conformant" ? (
                        <><CheckCircle2 className="mr-1 h-3 w-3" /> Conform</>
                      ) : (
                        <><XCircle className="mr-1 h-3 w-3" /> Neconform</>
                      )}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Measurements */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Măsurători</CardTitle>
                <Button size="sm" onClick={handleAddMeasurement}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adaugă
                </Button>
              </CardHeader>
              <CardContent>
                {measurementsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : measurements && measurements.length > 0 ? (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead>Tip</TableHead>
                          <TableHead>Valoare</TableHead>
                          <TableHead>Limită</TableHead>
                          <TableHead>Locație</TableHead>
                          <TableHead>Conformitate</TableHead>
                          <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {measurements.map((measurement) => (
                          <TableRow key={measurement.id}>
                            <TableCell className="font-medium">
                              {measurement.measurement_type}
                            </TableCell>
                            <TableCell>
                              {measurement.value !== null 
                                ? `${measurement.value} ${measurement.unit || ""}`
                                : "—"}
                            </TableCell>
                            <TableCell>
                              {measurement.limit_value !== null 
                                ? `${measurement.limit_value} ${measurement.unit || ""}`
                                : "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {measurement.location_description || "—"}
                            </TableCell>
                            <TableCell>
                              {measurement.is_conformant !== null ? (
                                measurement.is_conformant ? (
                                  <Badge variant="conformant" className="text-xs">
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    OK
                                  </Badge>
                                ) : (
                                  <Badge variant="nonconformant" className="text-xs">
                                    <XCircle className="mr-1 h-3 w-3" />
                                    NOK
                                  </Badge>
                                )
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleEditMeasurement(measurement)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteMeasurement(measurement.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nu există măsurători înregistrate</p>
                    <p className="text-sm">Adaugă prima măsurătoare folosind butonul de mai sus</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Observations & Recommendations */}
            {(report.observations || report.recommendations) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Observații și Recomandări</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {report.observations && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Observații</p>
                      <p className="text-sm">{report.observations}</p>
                    </div>
                  )}
                  {report.recommendations && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Recomandări</p>
                      <p className="text-sm">{report.recommendations}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Location Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Locație</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{report.sites?.name || "—"}</p>
                    <p className="text-sm text-muted-foreground">
                      {[report.sites?.address, report.sites?.city].filter(Boolean).join(", ") || "—"}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Client</p>
                    <p className="font-medium text-sm">{report.sites?.clients?.name || "—"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inspection Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Detalii Inspecție</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Data inspecției</p>
                    <p className="font-medium text-sm">{formatDate(report.inspection_date)}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Inginer</p>
                    <p className="font-medium text-sm">{getEngineerName()}</p>
                  </div>
                </div>
                {report.ambient_temperature !== null && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <Thermometer className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Temperatură ambientală</p>
                        <p className="font-medium text-sm">{report.ambient_temperature}°C</p>
                      </div>
                    </div>
                  </>
                )}
                {report.weather_conditions && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Condiții meteo</p>
                        <p className="font-medium text-sm">{report.weather_conditions}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Istoric</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Creat</span>
                  <span>{formatDate(report.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Actualizat</span>
                  <span>{formatDate(report.updated_at)}</span>
                </div>
                {report.validated_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Validat</span>
                    <span>{formatDate(report.validated_at)}</span>
                  </div>
                )}
                {report.signed_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Semnat</span>
                    <span>{formatDate(report.signed_at)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>

      {/* Dialogs */}
      <EditReportDialog 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen}
        report={report}
      />
      
      <MeasurementDialog
        open={isMeasurementOpen}
        onOpenChange={setIsMeasurementOpen}
        reportId={id || ""}
        measurement={editingMeasurement}
      />

      <DeleteReportDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteReport}
        isDeleting={deleteReport.isPending}
      />
    </>
  );
};

export default ReportDetails;
