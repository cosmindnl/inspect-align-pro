import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Building2, 
  MapPin, 
  FileText,
  MoreVertical,
  Phone,
  Mail
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Client {
  id: string;
  name: string;
  type: "company" | "individual";
  contact: string;
  email: string;
  phone: string;
  location: string;
  reportsCount: number;
  lastReport: string;
}

const clients: Client[] = [
  {
    id: "1",
    name: "SC Metalurg SRL",
    type: "company",
    contact: "George Popescu",
    email: "contact@metalurg.ro",
    phone: "0721 123 456",
    location: "București, Sector 4",
    reportsCount: 12,
    lastReport: "28 Dec 2024",
  },
  {
    id: "2",
    name: "Dezvoltator Imobiliar SA",
    type: "company",
    contact: "Ana Marinescu",
    email: "office@dezvoltator.ro",
    phone: "0722 234 567",
    location: "Cluj-Napoca",
    reportsCount: 24,
    lastReport: "27 Dec 2024",
  },
  {
    id: "3",
    name: "Fermă Ecologică SRL",
    type: "company",
    contact: "Ion Vasilescu",
    email: "info@fermaeco.ro",
    phone: "0723 345 678",
    location: "Timișoara",
    reportsCount: 5,
    lastReport: "26 Dec 2024",
  },
  {
    id: "4",
    name: "Fabrica de Pâine SA",
    type: "company",
    contact: "Maria Ionescu",
    email: "tehnic@fabricapaine.ro",
    phone: "0724 456 789",
    location: "Brașov",
    reportsCount: 8,
    lastReport: "25 Dec 2024",
  },
  {
    id: "5",
    name: "Hotel Carpați SRL",
    type: "company",
    contact: "Andrei Radu",
    email: "manager@hotelcarpati.ro",
    phone: "0725 567 890",
    location: "Sinaia",
    reportsCount: 15,
    lastReport: "24 Dec 2024",
  },
  {
    id: "6",
    name: "Green Energy SRL",
    type: "company",
    contact: "Elena Pop",
    email: "office@greenenergy.ro",
    phone: "0726 678 901",
    location: "Constanța",
    reportsCount: 18,
    lastReport: "23 Dec 2024",
  },
];

const Clients = () => {
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
          />
        </div>
        <Button variant="accent" className="ml-auto">
          <Plus className="mr-2 h-4 w-4" />
          Client Nou
        </Button>
      </div>

      {/* Clients Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-slide-up">
        {clients.map((client) => (
          <div
            key={client.id}
            className="group rounded-xl bg-card p-5 shadow-card transition-all hover:shadow-card-hover"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 bg-primary/10">
                  <AvatarFallback className="text-primary font-semibold">
                    {client.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">{client.name}</h3>
                  <p className="text-sm text-muted-foreground">{client.contact}</p>
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
                  <DropdownMenuItem>Editează</DropdownMenuItem>
                  <DropdownMenuItem>Vezi rapoarte</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Șterge</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{client.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{client.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{client.phone}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium text-foreground">{client.reportsCount}</span>
                  <span className="text-muted-foreground"> rapoarte</span>
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                Ultima: {client.lastReport}
              </span>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
};

export default Clients;
