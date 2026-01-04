import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, 
  Search, 
  MapPin, 
  FileText,
  MoreVertical,
  Phone,
  Mail,
  Building2,
  UserX
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClients } from "@/hooks/useClients";
import { useProfile } from "@/hooks/useProfile";
import { ClientFormDialog } from "@/components/clients/ClientFormDialog";
import { DeleteClientDialog } from "@/components/clients/DeleteClientDialog";
import { ClientSitesDialog } from "@/components/sites/ClientSitesDialog";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type Client = Database["public"]["Tables"]["clients"]["Row"];

const Clients = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSitesOpen, setIsSitesOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const { data: clients, isLoading, error } = useClients();
  const { data: profile } = useProfile();

  const filteredClients = clients?.filter(client => {
    const matchesSearch = searchQuery === "" ||
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.contact_person?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  }) ?? [];

  const handleAddClient = () => {
    if (!profile?.company_id) {
      toast.error("Trebuie să ai o companie asociată pentru a adăuga clienți.");
      return;
    }
    setSelectedClient(null);
    setIsFormOpen(true);
  };

  const handleEditClient = (client: Client) => {
    if (!profile?.company_id) {
      toast.error("Trebuie să ai o companie asociată pentru a edita clienți.");
      return;
    }
    setSelectedClient(client);
    setIsFormOpen(true);
  };

  const handleViewSites = (client: Client) => {
    setSelectedClient(client);
    setIsSitesOpen(true);
  };

  const handleViewReports = (clientId: string) => {
    toast.info("Funcționalitate în dezvoltare: Vizualizare rapoarte client");
  };

  const handleDeleteClient = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteOpen(true);
  };

  return (
    <AppLayout
      title="Clienți"
      subtitle="Gestionează baza de date cu clienții"
    >
      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-in">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Caută după nume, email, locație..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="accent" className="ml-auto" onClick={handleAddClient}>
          <Plus className="mr-2 h-4 w-4" />
          Client Nou
        </Button>
      </div>

      {/* Clients Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-slide-up">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-card p-5 shadow-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="pt-4 border-t">
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))
        ) : filteredClients.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
            <UserX className="h-12 w-12 mb-3" />
            <p className="text-lg font-medium">Nu există clienți</p>
            <p className="text-sm">Adaugă primul client folosind butonul "Client Nou"</p>
          </div>
        ) : (
          filteredClients.map((client) => (
            <div
              key={client.id}
              className="group rounded-xl bg-card p-5 shadow-card transition-all hover:shadow-card-hover"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 bg-primary/10">
                    <AvatarFallback className="text-primary font-semibold">
                      {client.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground">{client.name}</h3>
                    <p className="text-sm text-muted-foreground">{client.contact_person || "—"}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditClient(client)}>
                      Editează
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewSites(client)}>
                      Locații
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewReports(client.id)}>
                      Vezi rapoarte
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleDeleteClient(client)}
                    >
                      Șterge
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2 mb-4">
                {(client.city || client.county) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{[client.city, client.county].filter(Boolean).join(", ")}</span>
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.cui && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>CUI: {client.cui}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Date complete
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {profile?.company_id && (
        <ClientFormDialog
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          companyId={profile.company_id}
          client={selectedClient}
        />
      )}

      <DeleteClientDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        client={selectedClient}
      />

      <ClientSitesDialog
        open={isSitesOpen}
        onOpenChange={setIsSitesOpen}
        client={selectedClient}
      />
    </AppLayout>
  );
};

export default Clients;
