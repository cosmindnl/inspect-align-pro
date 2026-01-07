import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Clock, LogOut, Settings, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function WaitingForCompany() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: userRole, isLoading: roleLoading } = useUserRole();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Deconectat cu succes");
    navigate("/auth");
  };

  // If user is admin, redirect to settings to create company
  if (!roleLoading && userRole?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit mb-4">
              <Building className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Configurare Companie</CardTitle>
            <CardDescription>
              Ești administrator! Crează compania ta din pagina de setări.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => navigate("/settings")}
            >
              <Settings className="mr-2 h-5 w-5" />
              Mergi la Setări
            </Button>
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Deconectare
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto p-4 bg-amber-100 dark:bg-amber-900/30 rounded-full w-fit mb-4">
            <Clock className="h-10 w-10 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-2xl">Contul tău este activ</CardTitle>
          <CardDescription className="text-base mt-2">
            Nu ești încă asociat niciunei companii. Pentru a accesa aplicația, 
            un administrator trebuie să te invite în compania sa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Ce poți face?
            </h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Contactează administratorul companiei și cere o invitație</li>
              <li>• Verifică email-ul pentru un link de invitație</li>
              <li>• Dacă ai primit deja o invitație, accesează link-ul din email</li>
            </ul>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Autentificat ca:</p>
            <p className="font-medium text-foreground">{user?.email}</p>
          </div>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Deconectare
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
