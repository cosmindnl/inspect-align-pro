import { useState } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, Search, CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: string;
}

// Mock notifications - in a real app these would come from a hook/API
const notifications = [
  {
    id: "1",
    type: "success",
    title: "Raport validat",
    message: "Raportul BV-2026-0001 a fost validat cu succes.",
    time: "Acum 5 min",
  },
  {
    id: "2",
    type: "warning",
    title: "Echipament expiră curând",
    message: "Multimetrul Fluke 1587 expiră în 30 de zile.",
    time: "Acum 1 oră",
  },
  {
    id: "3",
    type: "info",
    title: "Client nou adăugat",
    message: "Clientul SC Exemplu SRL a fost adăugat.",
    time: "Ieri",
  },
];

const notificationIcons = {
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
};

const notificationColors = {
  success: "text-green-500",
  warning: "text-amber-500",
  info: "text-blue-500",
};

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleViewAll = () => {
    setPopoverOpen(false);
    setDialogOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          {/* Top Header */}
          <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-sm px-6">
            <SidebarTrigger className="-ml-2" />
            
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Caută rapoarte, clienți..."
                  className="pl-9 bg-muted/50 border-0 focus-visible:ring-accent"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent animate-pulse" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-80 p-0 bg-popover border shadow-lg" 
                  align="end"
                  sideOffset={8}
                >
                  <div className="p-3 border-b">
                    <h4 className="font-semibold text-sm">Notificări</h4>
                  </div>
                  <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Nu ai notificări noi.
                      </div>
                    ) : (
                      <div className="divide-y">
                        {notifications.map((notification) => {
                          const Icon = notificationIcons[notification.type as keyof typeof notificationIcons];
                          const colorClass = notificationColors[notification.type as keyof typeof notificationColors];
                          
                          return (
                            <div
                              key={notification.id}
                              className="p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                            >
                              <div className="flex gap-3">
                                <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${colorClass}`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium">
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-muted-foreground/70 mt-1">
                                    {notification.time}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                  <div className="p-2 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-xs"
                      onClick={handleViewAll}
                    >
                      Vezi toate notificările
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6">
            {(title || subtitle) && (
              <div className="mb-6">
                {title && (
                  <h1 className="text-2xl font-semibold text-foreground">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-muted-foreground mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            {children}
          </main>
        </SidebarInset>
      </div>

      {/* Full Notifications Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Toate Notificările</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Nu ai notificări.
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => {
                  const Icon = notificationIcons[notification.type as keyof typeof notificationIcons];
                  const colorClass = notificationColors[notification.type as keyof typeof notificationColors];
                  
                  return (
                    <div
                      key={notification.id}
                      className="p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex gap-3">
                        <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${colorClass}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-2">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
