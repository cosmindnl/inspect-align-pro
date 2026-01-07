import { useState, useRef, useEffect } from "react";
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
  Save,
  Upload,
  Trash2,
  Loader2,
  ImageIcon,
  Wrench,
  Users
} from "lucide-react";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useCompany, useUpdateCompany } from "@/hooks/useCompany";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SignatureUpload } from "@/components/settings/SignatureUpload";
import { EquipmentManager } from "@/components/settings/EquipmentManager";
import { ConformityRulesManager } from "@/components/settings/ConformityRulesManager";
import { UserRolesManager } from "@/components/settings/UserRolesManager";
import { NotificationHistory } from "@/components/settings/NotificationHistory";
import { CompanySetupWizard } from "@/components/settings/CompanySetupWizard";

const Settings = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: company, isLoading: companyLoading } = useCompany();
  const { data: userRole } = useUserRole();
  const updateProfile = useUpdateProfile();
  const updateCompany = useUpdateCompany();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });
  
  // Company form state
  const [companyForm, setCompanyForm] = useState({
    name: "",
    cui: "",
    registration_number: "",
    address: "",
    city: "",
    county: "",
    phone: "",
    email: "",
    anre_certificate_number: "",
    logo_url: "",
  });

  // Initialize forms when data loads
  useEffect(() => {
    if (profile) {
      setProfileForm({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (company) {
      setCompanyForm({
        name: company.name || "",
        cui: company.cui || "",
        registration_number: company.registration_number || "",
        address: company.address || "",
        city: company.city || "",
        county: company.county || "",
        phone: company.phone || "",
        email: company.email || "",
        anre_certificate_number: company.anre_certificate_number || "",
        logo_url: company.logo_url || "",
      });
    }
  }, [company]);

  const handleProfileSave = async () => {
    try {
      await updateProfile.mutateAsync(profileForm);
      toast.success("Profilul a fost actualizat");
    } catch (error: any) {
      toast.error("Eroare la salvare: " + error.message);
    }
  };

  const handleCompanySave = async () => {
    try {
      await updateCompany.mutateAsync(companyForm);
      toast.success("Datele companiei au fost actualizate");
    } catch (error: any) {
      toast.error("Eroare la salvare: " + error.message);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !company?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Vă rugăm să încărcați o imagine");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Imaginea trebuie să fie mai mică de 2MB");
      return;
    }

    setIsUploadingLogo(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${company.id}/logo.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName);

      // Update company with logo URL
      await updateCompany.mutateAsync({ logo_url: publicUrl });
      setCompanyForm(prev => ({ ...prev, logo_url: publicUrl }));
      
      toast.success("Logo-ul a fost încărcat cu succes");
    } catch (error: any) {
      toast.error("Eroare la încărcare: " + error.message);
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLogoDelete = async () => {
    if (!company?.id) return;

    setIsUploadingLogo(true);
    try {
      // List and delete all files in the company folder
      const { data: files } = await supabase.storage
        .from('company-logos')
        .list(company.id);

      if (files && files.length > 0) {
        const filesToDelete = files.map(f => `${company.id}/${f.name}`);
        await supabase.storage
          .from('company-logos')
          .remove(filesToDelete);
      }

      // Update company to remove logo URL
      await updateCompany.mutateAsync({ logo_url: null });
      setCompanyForm(prev => ({ ...prev, logo_url: "" }));
      
      toast.success("Logo-ul a fost șters");
    } catch (error: any) {
      toast.error("Eroare la ștergere: " + error.message);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  if (profileLoading || companyLoading) {
    return (
      <AppLayout title="Setări" subtitle="Se încarcă...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Setări"
      subtitle="Configurează preferințele aplicației"
    >
      <Tabs defaultValue="profile" className="animate-fade-in">
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-2">
            <Building className="h-4 w-4" />
            Companie
          </TabsTrigger>
          <TabsTrigger value="equipment" className="gap-2">
            <Wrench className="h-4 w-4" />
            Echipamente
          </TabsTrigger>
          {userRole?.isAdmin && (
            <TabsTrigger value="admin" className="gap-2">
              <Users className="h-4 w-4" />
              Administrare
            </TabsTrigger>
          )}
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
                  <Input 
                    id="firstName" 
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, first_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nume</Label>
                  <Input 
                    id="lastName" 
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, last_name: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email || ""} disabled />
                <p className="text-xs text-muted-foreground">Email-ul nu poate fi modificat</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input 
                  id="phone" 
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+40 7XX XXX XXX"
                />
              </div>
              <Separator className="my-4" />
              <Button 
                variant="accent" 
                className="w-fit"
                onClick={handleProfileSave}
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvează Modificările
              </Button>
            </div>
            
            <Separator className="my-6" />
            
            {/* Signature Upload Section */}
            <SignatureUpload />
          </div>
        </TabsContent>

        <TabsContent value="company">
          {/* Show wizard if admin without company */}
          {userRole?.isAdmin && !company && (
            <div className="rounded-xl bg-card p-6 shadow-card max-w-2xl mb-6">
              <CompanySetupWizard onComplete={() => window.location.reload()} />
            </div>
          )}

          {/* Show company details only if company exists */}
          {company && (
          <div className="rounded-xl bg-card p-6 shadow-card max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Detalii Companie</h3>
            
            {/* Logo Upload Section */}
            <div className="mb-6">
              <Label className="mb-3 block">Logo Companie</Label>
              <div className="flex items-start gap-4">
                <div className="relative h-24 w-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted/50">
                  {companyForm.logo_url ? (
                    <img 
                      src={companyForm.logo_url} 
                      alt="Logo companie" 
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                  )}
                  {isUploadingLogo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingLogo || !company}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Încarcă Logo
                  </Button>
                  {companyForm.logo_url && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={handleLogoDelete}
                      disabled={isUploadingLogo}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Șterge Logo
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG sau SVG. Max 2MB.
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Denumire Firmă *</Label>
                <Input 
                  id="companyName" 
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cui">CUI</Label>
                  <Input 
                    id="cui" 
                    value={companyForm.cui}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, cui: e.target.value }))}
                    placeholder="RO12345678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regCom">Reg. Com.</Label>
                  <Input 
                    id="regCom" 
                    value={companyForm.registration_number}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, registration_number: e.target.value }))}
                    placeholder="J40/1234/2020"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="anre">Certificat ANRE</Label>
                <Input 
                  id="anre" 
                  value={companyForm.anre_certificate_number}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, anre_certificate_number: e.target.value }))}
                  placeholder="Număr certificat ANRE"
                />
              </div>
              <Separator className="my-2" />
              <div className="space-y-2">
                <Label htmlFor="companyAddress">Adresă</Label>
                <Input 
                  id="companyAddress" 
                  value={companyForm.address}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Strada și numărul"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Oraș</Label>
                  <Input 
                    id="city" 
                    value={companyForm.city}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="county">Județ</Label>
                  <Input 
                    id="county" 
                    value={companyForm.county}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, county: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Telefon</Label>
                  <Input 
                    id="companyPhone" 
                    value={companyForm.phone}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+40 XXX XXX XXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input 
                    id="companyEmail" 
                    type="email"
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contact@firma.ro"
                  />
                </div>
              </div>
              <Separator className="my-4" />
              <Button 
                variant="accent" 
                className="w-fit"
                onClick={handleCompanySave}
                disabled={updateCompany.isPending || !company}
              >
                {updateCompany.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvează Modificările
              </Button>
            </div>
          </div>
          )}

          {/* Message for non-admin users without company */}
          {!userRole?.isAdmin && !company && (
            <div className="rounded-xl bg-card p-6 shadow-card max-w-2xl">
              <p className="text-sm text-muted-foreground">
                Nu aveți o companie asociată. Contactați administratorul pentru a fi invitat.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="equipment">
          <div className="rounded-xl bg-card p-6 shadow-card max-w-2xl">
            <EquipmentManager />
          </div>
          <div className="rounded-xl bg-card p-6 shadow-card max-w-2xl mt-6">
            <ConformityRulesManager />
          </div>
        </TabsContent>

        {userRole?.isAdmin && (
          <TabsContent value="admin">
            <div className="rounded-xl bg-card p-6 shadow-card max-w-4xl">
              <UserRolesManager />
            </div>
          </TabsContent>
        )}

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
          
          {userRole?.isAdmin && (
            <div className="rounded-xl bg-card p-6 shadow-card max-w-4xl mt-6">
              <NotificationHistory />
            </div>
          )}
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
