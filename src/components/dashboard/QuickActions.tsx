import { Zap, Building2, Sun, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  gradient: string;
  iconBg: string;
}

const actions: QuickAction[] = [
  {
    title: "Priză de Pământ",
    description: "Buletin verificare conform IEC 61557",
    icon: Zap,
    href: "/reports/ground/new",
    gradient: "from-warning/20 to-warning/5",
    iconBg: "bg-warning/20 text-warning",
  },
  {
    title: "Instalație Electrică",
    description: "Raport verificare IEC 60364",
    icon: Building2,
    href: "/reports/electrical/new",
    gradient: "from-primary/20 to-primary/5",
    iconBg: "bg-primary/20 text-primary",
  },
  {
    title: "Sistem Fotovoltaic",
    description: "Verificare conform IEC 62446",
    icon: Sun,
    href: "/reports/solar/new",
    gradient: "from-accent/20 to-accent/5",
    iconBg: "bg-accent/20 text-accent",
  },
];

export function QuickActions() {
  return (
    <div className="rounded-xl bg-card p-6 shadow-card">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">Creare Rapidă</h3>
        <p className="text-sm text-muted-foreground">Începe un nou raport de verificare</p>
      </div>
      
      <div className="space-y-3">
        {actions.map((action) => (
          <button
            key={action.title}
            className={cn(
              "group w-full flex items-center gap-4 rounded-lg p-4 text-left transition-all",
              "bg-gradient-to-r hover:shadow-md",
              action.gradient
            )}
          >
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", action.iconBg)}>
              <action.icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{action.title}</p>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
          </button>
        ))}
      </div>
    </div>
  );
}
