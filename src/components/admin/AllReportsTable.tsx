import { useState } from "react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ReportWithRelations } from "@/hooks/useReports";
import { ReportsBulkActions } from "./ReportsBulkActions";
import { Skeleton } from "@/components/ui/skeleton";

interface AllReportsTableProps {
  reports: ReportWithRelations[];
  isLoading: boolean;
}

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "secondary",
  validated: "outline",
  signed: "default",
  archived: "destructive",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  validated: "Validat",
  signed: "Semnat",
  archived: "Arhivat",
};

const REPORT_TYPE_LABELS: Record<string, string> = {
  ground: "Împământare",
  electrical: "Electric",
  solar: "Solar",
};

const CONFORMITY_LABELS: Record<string, { label: string; variant: "default" | "destructive" }> = {
  conformant: { label: "Conform", variant: "default" },
  nonconformant: { label: "Neconform", variant: "destructive" },
};

export function AllReportsTable({ reports, isLoading }: AllReportsTableProps) {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReports = reports.filter((report) => {
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesType = typeFilter === "all" || report.report_type === typeFilter;
    const matchesSearch = 
      !searchQuery ||
      report.report_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.sites?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.sites?.clients?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredReports.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    }
  };

  const getEngineerName = (report: ReportWithRelations) => {
    const profile = report.engineers?.profiles;
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
    }
    return "-";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Caută după nr. raport, site, client..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate statusurile</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="validated">Validat</SelectItem>
            <SelectItem value="signed">Semnat</SelectItem>
            <SelectItem value="archived">Arhivat</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tip" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate tipurile</SelectItem>
            <SelectItem value="ground">Împământare</SelectItem>
            <SelectItem value="electrical">Electric</SelectItem>
            <SelectItem value="solar">Solar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      <ReportsBulkActions 
        selectedIds={selectedIds} 
        onClearSelection={() => setSelectedIds([])} 
      />

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={filteredReports.length > 0 && selectedIds.length === filteredReports.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Nr. Raport</TableHead>
              <TableHead>Tip</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Inginer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Conformitate</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Acțiuni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  Nu s-au găsit rapoarte
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(report.id)}
                      onCheckedChange={(checked) => handleSelectOne(report.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {report.report_number || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {REPORT_TYPE_LABELS[report.report_type] || report.report_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{report.sites?.clients?.name || "-"}</TableCell>
                  <TableCell>{report.sites?.name || "-"}</TableCell>
                  <TableCell>{getEngineerName(report)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[report.status || "draft"]}>
                      {STATUS_LABELS[report.status || "draft"]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {report.conformity ? (
                      <Badge variant={CONFORMITY_LABELS[report.conformity].variant}>
                        {CONFORMITY_LABELS[report.conformity].label}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {report.inspection_date
                      ? format(new Date(report.inspection_date), "dd MMM yyyy", { locale: ro })
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/reports/${report.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Vezi detalii
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
