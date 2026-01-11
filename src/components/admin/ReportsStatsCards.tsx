import { FileText, Clock, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportWithRelations } from "@/hooks/useReports";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

interface ReportsStatsCardsProps {
  reports: ReportWithRelations[];
}

const STATUS_COLORS = {
  draft: "hsl(var(--muted-foreground))",
  validated: "hsl(var(--chart-2))",
  signed: "hsl(var(--chart-1))",
  archived: "hsl(var(--chart-4))",
};

const TYPE_COLORS = {
  ground: "hsl(var(--chart-3))",
  electrical: "hsl(var(--chart-1))",
  solar: "hsl(var(--chart-2))",
};

export function ReportsStatsCards({ reports }: ReportsStatsCardsProps) {
  const totalReports = reports.length;
  const draftReports = reports.filter(r => r.status === 'draft').length;
  const validatedReports = reports.filter(r => r.status === 'validated').length;
  const signedReports = reports.filter(r => r.status === 'signed').length;
  const archivedReports = reports.filter(r => r.status === 'archived').length;
  
  const conformantReports = reports.filter(r => r.conformity === 'conformant').length;
  const nonConformantReports = reports.filter(r => r.conformity === 'nonconformant').length;
  const conformityRate = totalReports > 0 
    ? Math.round((conformantReports / totalReports) * 100) 
    : 0;

  const statusData = [
    { name: 'Draft', value: draftReports, color: STATUS_COLORS.draft },
    { name: 'Validate', value: validatedReports, color: STATUS_COLORS.validated },
    { name: 'Semnate', value: signedReports, color: STATUS_COLORS.signed },
    { name: 'Arhivate', value: archivedReports, color: STATUS_COLORS.archived },
  ].filter(d => d.value > 0);

  const typeData = [
    { name: 'Împământare', value: reports.filter(r => r.report_type === 'ground').length, fill: TYPE_COLORS.ground },
    { name: 'Electric', value: reports.filter(r => r.report_type === 'electrical').length, fill: TYPE_COLORS.electrical },
    { name: 'Solar', value: reports.filter(r => r.report_type === 'solar').length, fill: TYPE_COLORS.solar },
  ].filter(d => d.value > 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Reports */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Rapoarte</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalReports}</div>
          <p className="text-xs text-muted-foreground">
            {draftReports} draft, {signedReports} semnate
          </p>
        </CardContent>
      </Card>

      {/* Pending Reports */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">În Așteptare</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{draftReports + validatedReports}</div>
          <p className="text-xs text-muted-foreground">
            {draftReports} draft, {validatedReports} validate
          </p>
        </CardContent>
      </Card>

      {/* Conformity Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rata Conformitate</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{conformityRate}%</div>
          <p className="text-xs text-muted-foreground">
            {conformantReports} conforme, {nonConformantReports} neconforme
          </p>
        </CardContent>
      </Card>

      {/* Completed Reports */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Finalizate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{signedReports + archivedReports}</div>
          <p className="text-xs text-muted-foreground">
            {signedReports} semnate, {archivedReports} arhivate
          </p>
        </CardContent>
      </Card>

      {/* Status Distribution Chart */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Distribuție Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Type Distribution Chart */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Rapoarte pe Tip</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
