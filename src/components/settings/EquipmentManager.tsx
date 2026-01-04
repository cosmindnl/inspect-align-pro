import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Pencil, Trash2, AlertTriangle, CheckCircle, XCircle, Loader2, Download, FileSpreadsheet, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Equipment, useEquipment, useDeleteEquipment } from "@/hooks/useEquipment";
import { EquipmentFormDialog } from "./EquipmentFormDialog";
import { format, differenceInDays, parseISO } from "date-fns";
import { ro } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function exportToExcel(equipment: Equipment[]) {
  const headers = ["Denumire", "Producător", "Model", "Număr serie", "Categorie", "Verificare valabilă până", "Nr. certificat", "Status", "Observații"];
  
  const rows = equipment.map(eq => {
    const status = eq.verification_valid_until 
      ? (differenceInDays(parseISO(eq.verification_valid_until), new Date()) < 0 ? "Expirat" : "Valid")
      : "Nespecificat";
    
    return [
      eq.name,
      eq.manufacturer || "",
      eq.model || "",
      eq.serial_number || "",
      eq.category || "",
      eq.verification_valid_until ? format(parseISO(eq.verification_valid_until), "dd.MM.yyyy") : "",
      eq.verification_certificate_number || "",
      status,
      eq.notes || ""
    ];
  });

  const csvContent = [
    headers.join(";"),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(";"))
  ].join("\n");

  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `echipamente_${format(new Date(), "yyyy-MM-dd")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function exportToPDF(equipment: Equipment[]) {
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text("Lista Echipamente de Măsură", 14, 20);
  doc.setFontSize(10);
  doc.text(`Generat: ${format(new Date(), "dd.MM.yyyy HH:mm")}`, 14, 28);

  const tableData = equipment.map(eq => {
    const status = eq.verification_valid_until 
      ? (differenceInDays(parseISO(eq.verification_valid_until), new Date()) < 0 ? "Expirat" : "Valid")
      : "-";
    
    return [
      eq.name,
      eq.serial_number || "-",
      eq.verification_valid_until ? format(parseISO(eq.verification_valid_until), "dd.MM.yyyy") : "-",
      status
    ];
  });

  autoTable(doc, {
    startY: 35,
    head: [["Denumire", "Nr. serie", "Verificare până", "Status"]],
    body: tableData,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  doc.save(`echipamente_${format(new Date(), "yyyy-MM-dd")}.pdf`);
}

function getVerificationStatus(validUntil: string | null) {
  if (!validUntil) return { status: "unknown", label: "Nespecificat", variant: "outline" as const };
  
  const today = new Date();
  const expiryDate = parseISO(validUntil);
  const daysUntilExpiry = differenceInDays(expiryDate, today);
  
  if (daysUntilExpiry < 0) {
    return { status: "expired", label: "Expirat", variant: "destructive" as const };
  } else if (daysUntilExpiry <= 30) {
    return { status: "expiring", label: `Expiră în ${daysUntilExpiry} zile`, variant: "warning" as const };
  } else {
    return { status: "valid", label: "Valid", variant: "success" as const };
  }
}

export function EquipmentManager() {
  const { data: equipment, isLoading } = useEquipment();
  const deleteEquipment = useDeleteEquipment();
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(null);

  const handleEdit = (eq: Equipment) => {
    setEditingEquipment(eq);
    setFormOpen(true);
  };

  const handleDelete = (eq: Equipment) => {
    setEquipmentToDelete(eq);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!equipmentToDelete) return;
    
    try {
      await deleteEquipment.mutateAsync(equipmentToDelete.id);
      toast.success("Echipamentul a fost șters");
      setDeleteDialogOpen(false);
      setEquipmentToDelete(null);
    } catch (error: any) {
      toast.error("Eroare la ștergere: " + error.message);
    }
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingEquipment(null);
    }
  };

  const handleExportPDF = () => {
    if (!equipment || equipment.length === 0) {
      toast.error("Nu există echipamente de exportat");
      return;
    }
    exportToPDF(equipment);
    toast.success("Lista a fost exportată în PDF");
  };

  const handleExportExcel = () => {
    if (!equipment || equipment.length === 0) {
      toast.error("Nu există echipamente de exportat");
      return;
    }
    exportToExcel(equipment);
    toast.success("Lista a fost exportată în Excel (CSV)");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Echipamente de Măsură</h3>
          <p className="text-sm text-muted-foreground">
            Gestionează lista de echipamente de măsură și verificările metrologice.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {equipment && equipment.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportPDF}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportExcel}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export Excel (CSV)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adaugă echipament
          </Button>
        </div>
      </div>

      {equipment && equipment.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Denumire</TableHead>
                <TableHead>Număr serie</TableHead>
                <TableHead>Verificare metrologică</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.map((eq) => {
                const verificationStatus = getVerificationStatus(eq.verification_valid_until);
                return (
                  <TableRow key={eq.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{eq.name}</p>
                        {(eq.manufacturer || eq.model) && (
                          <p className="text-sm text-muted-foreground">
                            {[eq.manufacturer, eq.model].filter(Boolean).join(" - ")}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {eq.serial_number || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {eq.verification_valid_until ? (
                        <div className="space-y-1">
                          <p className="text-sm">
                            {format(parseISO(eq.verification_valid_until), "dd MMM yyyy", { locale: ro })}
                          </p>
                          <div className="flex items-center gap-2">
                            {eq.verification_certificate_number && (
                              <span className="text-xs text-muted-foreground">
                                Cert: {eq.verification_certificate_number}
                              </span>
                            )}
                            {eq.certificate_url && (
                              <a
                                href={eq.certificate_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Vezi
                              </a>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {verificationStatus.status === "expired" && (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                        {verificationStatus.status === "expiring" && (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                        {verificationStatus.status === "valid" && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        <Badge
                          variant={
                            verificationStatus.variant === "success"
                              ? "default"
                              : verificationStatus.variant === "warning"
                              ? "secondary"
                              : verificationStatus.variant
                          }
                          className={
                            verificationStatus.variant === "success"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : verificationStatus.variant === "warning"
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                              : ""
                          }
                        >
                          {verificationStatus.label}
                        </Badge>
                        {!eq.is_active && (
                          <Badge variant="outline" className="text-muted-foreground">
                            Inactiv
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(eq)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(eq)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <p className="text-muted-foreground mb-4">
            Nu ai adăugat niciun echipament încă.
          </p>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adaugă primul echipament
          </Button>
        </div>
      )}

      <EquipmentFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        equipment={editingEquipment}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge echipament</AlertDialogTitle>
            <AlertDialogDescription>
              Ești sigur că vrei să ștergi echipamentul "{equipmentToDelete?.name}"?
              Această acțiune nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteEquipment.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
