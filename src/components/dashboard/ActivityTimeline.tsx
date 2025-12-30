import { CheckCircle2, FileText, AlertTriangle, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  action: string;
  subject: string;
  user: string;
  time: string;
  type: "created" | "validated" | "warning" | "sent";
}

const activities: Activity[] = [
  {
    id: "1",
    action: "a validat",
    subject: "RV-2024-042",
    user: "Ion Marinescu",
    time: "Acum 2 ore",
    type: "validated",
  },
  {
    id: "2",
    action: "a creat",
    subject: "PV-2024-015",
    user: "Maria Ionescu",
    time: "Acum 4 ore",
    type: "created",
  },
  {
    id: "3",
    action: "a marcat ca neconform",
    subject: "BV-2024-002",
    user: "Ion Marinescu",
    time: "Ieri, 16:30",
    type: "warning",
  },
  {
    id: "4",
    action: "a trimis clientului",
    subject: "BV-2024-001",
    user: "Ion Marinescu",
    time: "Ieri, 14:00",
    type: "sent",
  },
];

const iconConfig = {
  created: { icon: FileText, color: "text-primary", bg: "bg-primary/10" },
  validated: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  sent: { icon: Send, color: "text-accent", bg: "bg-accent/10" },
};

export function ActivityTimeline() {
  return (
    <div className="rounded-xl bg-card p-6 shadow-card">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">Activitate Recentă</h3>
        <p className="text-sm text-muted-foreground">Ultimele acțiuni în sistem</p>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const config = iconConfig[activity.type];
          const Icon = config.icon;
          
          return (
            <div key={activity.id} className="flex gap-3">
              <div className="relative flex flex-col items-center">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", config.bg)}>
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>
                {index !== activities.length - 1 && (
                  <div className="w-px flex-1 bg-border mt-2" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <p className="text-sm text-foreground">
                  <span className="font-medium">{activity.user}</span>{" "}
                  {activity.action}{" "}
                  <span className="font-mono text-xs text-accent">{activity.subject}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
