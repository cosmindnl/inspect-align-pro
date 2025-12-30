import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "Conform", value: 85, color: "hsl(152, 70%, 40%)" },
  { name: "Neconform", value: 15, color: "hsl(0, 72%, 51%)" },
];

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-sm font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function ComplianceChart() {
  return (
    <div className="rounded-xl bg-card p-6 shadow-card">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">Rata de Conformitate</h3>
        <p className="text-sm text-muted-foreground">Ultimele 30 de zile</p>
      </div>
      
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={90}
              innerRadius={50}
              fill="#8884d8"
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                boxShadow: "var(--shadow-md)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-success">142</p>
          <p className="text-xs text-muted-foreground">Verificări Conforme</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-destructive">25</p>
          <p className="text-xs text-muted-foreground">Neconforme</p>
        </div>
      </div>
    </div>
  );
}
