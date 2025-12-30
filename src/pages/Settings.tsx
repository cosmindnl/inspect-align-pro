import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Building, 
  Bell, 
  Shield, 
  Palette,
  Save
} from "lucide-react";

const Settings = () => {
  return (
    <AppLayout
      title="Setări"
      subtitle="Configurează preferințele aplicației"
    >
      <Tabs defaultValue="profile" className="animate-fade-in">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-2">
            <Building className="h-4 w-4" />
            Companie
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notificări
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Securitate
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="rounded-xl bg-card p-6 shadow-card max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Informații Personale</h3>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prenume</Label>
                  <Input id="firstName" defaultValue="Ion" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nume</Label>
                  <Input id="lastName" defaultValue="Marinescu" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="ion.marinescu@electroverify.ro" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" defaultValue="+40 721 123 456" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="anre">Număr Autorizație ANRE</Label>
                <Input id="anre" defaultValue="ANRE-12345-2024" />
              </div>
              <Separator className="my-4" />
              <Button variant="accent" className="w-fit">
                <Save className="mr-2 h-4 w-4" />
                Salvează Modificările
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="company">
          <div className="rounded-xl bg-card p-6 shadow-card max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Detalii Companie</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Denumire Firmă</Label>
                <Input id="companyName" defaultValue="ElectroVerify SRL" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cui">CUI</Label>
                  <Input id="cui" defaultValue="RO12345678" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regCom">Reg. Com.</Label>
                  <Input id="regCom" defaultValue="J40/1234/2020" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adresă</Label>
                <Input id="address" defaultValue="Str. Electricienilor nr. 10, București" />
              </div>
              <Separator className="my-4" />
              <Button variant="accent" className="w-fit">
                <Save className="mr-2 h-4 w-4" />
                Salvează Modificările
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="rounded-xl bg-card p-6 shadow-card max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Preferințe Notificări</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notificări Email</p>
                  <p className="text-sm text-muted-foreground">
                    Primește notificări despre rapoarte noi
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Alerte Expirare</p>
                  <p className="text-sm text-muted-foreground">
                    Notificări pentru verificări care expiră
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Rapoarte Săptămânale</p>
                  <p className="text-sm text-muted-foreground">
                    Sumar activitate săptămânală
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notificări Push</p>
                  <p className="text-sm text-muted-foreground">
                    Notificări în browser
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="rounded-xl bg-card p-6 shadow-card max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Securitate Cont</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Parolă Curentă</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Parolă Nouă</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmă Parola</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Autentificare în doi pași (2FA)</p>
                  <p className="text-sm text-muted-foreground">
                    Adaugă un strat suplimentar de securitate
                  </p>
                </div>
                <Button variant="outline">Activează</Button>
              </div>
              <Button variant="accent" className="w-fit">
                <Save className="mr-2 h-4 w-4" />
                Actualizează Parola
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Settings;
