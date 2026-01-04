import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  MapPin, 
  MoreVertical,
  Building2,
  Home,
  Factory,
  Landmark,
  Pencil,
  Trash2
} from "lucide-react";
import { useSitesByClient } from "@/hooks/useSites";
import { SiteFormDialog } from "./SiteFormDialog";
import { DeleteSiteDialog } from "./DeleteSiteDialog";
import { Database } from "@/integrations/supabase/types";

type Client = Database['public']['Tables']['clients']['Row'];
type Site = Database['public']['Tables']['sites']['Row'];

const installationTypeConfig = {
  residential: { icon: Home, label: "Rezidențial", color: "bg-blue-100 text-blue-700" },
  commercial: { icon: Building2, label: "Comercial", color: "bg-green-100 text-green-700" },
  industrial: { icon: Factory, label: "Industrial", color: "bg-orange-100 text-orange-700" },
  public: { icon: Landmark, label: "Public", color: "bg-purple-100 text-purple-700" },
};

interface ClientSitesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
}

export function ClientSitesDialog({ open, onOpenChange, client }: ClientSitesDialogProps) {
  const [isSiteFormOpen, setIsSiteFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  const { data: sites, isLoading } = useSitesByClient(client?.id || "");

  const handleAddSite = () => {
    setSelectedSite(null);
    setIsSiteFormOpen(true);
  };

  const handleEditSite = (site: Site) => {
    setSelectedSite(site);
    setIsSiteFormOpen(true);
  };

  const handleDeleteSite = (site: Site) => {
    setSelectedSite(site);
    setIsDeleteOpen(true);
  };

  if (!client) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Locații - {client.name}</span>
              <Button size="sm" onClick={handleAddSite}>
                <Plus className="mr-2 h-4 w-4" />
                Adaugă
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-60" />
                </div>
              ))
            ) : sites && sites.length > 0 ? (
              sites.map((site) => {
                const typeConfig = installationTypeConfig[site.installation_type as keyof typeof installationTypeConfig] || installationTypeConfig.residential;
                const TypeIcon = typeConfig.icon;

                return (
                  <div
                    key={site.id}
                    className="group rounded-lg border bg-card p-4 transition-all hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <TypeIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{site.name}</h4>
                          {(site.address || site.city) && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                              <MapPin className="h-3 w-3" />
                              <span>{[site.address, site.city, site.county].filter(Boolean).join(", ")}</span>
                            </div>
                          )}
                          {site.installation_type && (
                            <Badge variant="secondary" className={`mt-2 text-xs ${typeConfig.color}`}>
                              {typeConfig.label}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditSite(site)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editează
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteSite(site)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Șterge
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {site.notes && (
                      <p className="text-sm text-muted-foreground mt-2 pl-13">
                        {site.notes}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Nu există locații pentru acest client</p>
                <p className="text-sm">Adaugă prima locație folosind butonul de mai sus</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {client && (
        <SiteFormDialog
          open={isSiteFormOpen}
          onOpenChange={setIsSiteFormOpen}
          clientId={client.id}
          site={selectedSite}
        />
      )}

      <DeleteSiteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        site={selectedSite}
      />
    </>
  );
}
