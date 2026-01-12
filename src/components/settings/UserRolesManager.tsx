import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCompanyUsers, useUpdateUserRole, useAdminCount, useResetUserPassword, useDeleteUser } from "@/hooks/useUserManagement";
import { Database } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Shield, Wrench, Eye, Users, Mail, MoreHorizontal, KeyRound, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { InvitationsManager } from "./InvitationsManager";
import { ResetPasswordDialog } from "./ResetPasswordDialog";
import { DeleteUserDialog } from "./DeleteUserDialog";

type AppRole = Database['public']['Enums']['app_role'];

const roleConfig: Record<AppRole, { label: string; icon: React.ReactNode; variant: "default" | "secondary" | "outline" }> = {
  admin: { 
    label: "Administrator", 
    icon: <Shield className="h-3 w-3" />,
    variant: "default"
  },
  engineer: { 
    label: "Inginer", 
    icon: <Wrench className="h-3 w-3" />,
    variant: "secondary"
  },
  viewer: { 
    label: "Vizualizator", 
    icon: <Eye className="h-3 w-3" />,
    variant: "outline"
  },
};

const roleDescriptions: Record<AppRole, string> = {
  admin: "Acces complet: gestionare utilizatori, setări companie, toate rapoartele",
  engineer: "Creare și editare rapoarte proprii, clienți, echipamente",
  viewer: "Doar vizualizare rapoarte și date (read-only)",
};

export function UserRolesManager() {
  const { user } = useAuth();
  const { data: users, isLoading } = useCompanyUsers();
  const { data: adminCount } = useAdminCount();
  const updateRole = useUpdateUserRole();
  const resetPassword = useResetUserPassword();
  const deleteUser = useDeleteUser();
  
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId: string;
    userName: string;
    newRole: AppRole;
  }>({
    open: false,
    userId: "",
    userName: "",
    newRole: "engineer",
  });

  const [resetPasswordDialog, setResetPasswordDialog] = useState<{
    open: boolean;
    userId: string;
    userName: string;
  }>({
    open: false,
    userId: "",
    userName: "",
  });

  const [deleteUserDialog, setDeleteUserDialog] = useState<{
    open: boolean;
    userId: string;
    userName: string;
  }>({
    open: false,
    userId: "",
    userName: "",
  });

  const handleRoleChange = (userId: string, userName: string, newRole: AppRole) => {
    const targetUser = users?.find(u => u.id === userId);
    const isLastAdmin = adminCount === 1 && targetUser?.roles.includes('admin') && newRole !== 'admin';
    
    if (isLastAdmin) {
      toast.error("Nu puteți retrograda ultimul administrator. Trebuie să existe cel puțin un admin.");
      return;
    }
    
    if (userId === user?.id) {
      toast.error("Nu vă puteți schimba propriul rol.");
      return;
    }
    
    setConfirmDialog({
      open: true,
      userId,
      userName,
      newRole,
    });
  };

  const confirmRoleChange = async () => {
    try {
      await updateRole.mutateAsync({
        userId: confirmDialog.userId,
        newRole: confirmDialog.newRole,
      });
      toast.success(`Rolul utilizatorului ${confirmDialog.userName} a fost actualizat la ${roleConfig[confirmDialog.newRole].label}`);
    } catch (error: any) {
      toast.error("Eroare la actualizarea rolului: " + error.message);
    } finally {
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  const handleResetPassword = (userId: string, userName: string) => {
    setResetPasswordDialog({
      open: true,
      userId,
      userName,
    });
  };

  const confirmResetPassword = async () => {
    try {
      await resetPassword.mutateAsync(resetPasswordDialog.userId);
      toast.success(`Email de resetare parolă trimis către ${resetPasswordDialog.userName}`);
      setResetPasswordDialog({ ...resetPasswordDialog, open: false });
    } catch (error: any) {
      toast.error("Eroare la resetarea parolei: " + error.message);
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (userId === user?.id) {
      toast.error("Nu vă puteți șterge propriul cont.");
      return;
    }

    const targetUser = users?.find(u => u.id === userId);
    const isOnlyAdmin = adminCount === 1 && targetUser?.roles.includes('admin');
    
    if (isOnlyAdmin) {
      toast.error("Nu puteți șterge ultimul administrator din companie.");
      return;
    }

    setDeleteUserDialog({
      open: true,
      userId,
      userName,
    });
  };

  const confirmDeleteUser = async () => {
    try {
      await deleteUser.mutateAsync(deleteUserDialog.userId);
      toast.success(`Utilizatorul ${deleteUserDialog.userName} a fost șters`);
      setDeleteUserDialog({ ...deleteUserDialog, open: false });
    } catch (error: any) {
      toast.error("Eroare la ștergerea utilizatorului: " + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Utilizatori
          </TabsTrigger>
          <TabsTrigger value="invitations" className="gap-2">
            <Mail className="h-4 w-4" />
            Invitații
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6 space-y-6">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Gestionare Utilizatori și Roluri</h3>
              <p className="text-sm text-muted-foreground">
                Administrează rolurile utilizatorilor din companie
              </p>
            </div>
          </div>

          {/* Role descriptions */}
          <div className="grid gap-3 sm:grid-cols-3">
            {(Object.keys(roleConfig) as AppRole[]).map((role) => (
              <div key={role} className="rounded-lg border p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={roleConfig[role].variant} className="gap-1">
                    {roleConfig[role].icon}
                    {roleConfig[role].label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{roleDescriptions[role]}</p>
              </div>
            ))}
          </div>

          {/* Users table */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilizator</TableHead>
                  <TableHead>Rol Curent</TableHead>
                  <TableHead>Data Înregistrării</TableHead>
                  <TableHead className="text-right">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users && users.length > 0 ? (
                  users.map((u) => {
                    const currentRole = u.roles[0] || 'viewer';
                    const isCurrentUser = u.id === user?.id;
                    const isOnlyAdmin = adminCount === 1 && u.roles.includes('admin');
                    const fullName = [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Utilizator';
                    
                    return (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {fullName}
                              {isCurrentUser && (
                                <span className="text-xs text-muted-foreground ml-2">(tu)</span>
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={roleConfig[currentRole].variant} className="gap-1">
                            {roleConfig[currentRole].icon}
                            {roleConfig[currentRole].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {u.created_at 
                            ? format(new Date(u.created_at), 'dd MMM yyyy', { locale: ro })
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isCurrentUser || isOnlyAdmin ? (
                              <span className="text-xs text-muted-foreground">
                                {isCurrentUser ? "Nu poți schimba" : "Ultimul admin"}
                              </span>
                            ) : (
                              <Select
                                value={currentRole}
                                onValueChange={(value) => handleRoleChange(u.id, fullName, value as AppRole)}
                                disabled={updateRole.isPending}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Administrator</SelectItem>
                                  <SelectItem value="engineer">Inginer</SelectItem>
                                  <SelectItem value="viewer">Vizualizator</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            
                            {!isCurrentUser && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleResetPassword(u.id, fullName)}>
                                    <KeyRound className="mr-2 h-4 w-4" />
                                    Resetare parolă
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteUser(u.id, fullName)}
                                    className="text-destructive focus:text-destructive"
                                    disabled={isOnlyAdmin}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Șterge utilizator
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Nu există utilizatori în companie
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="invitations" className="mt-6">
          <InvitationsManager />
        </TabsContent>
      </Tabs>

      {/* Confirm role change dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmare schimbare rol</AlertDialogTitle>
            <AlertDialogDescription>
              Sigur doriți să schimbați rolul utilizatorului <strong>{confirmDialog.userName}</strong> la{" "}
              <strong>{roleConfig[confirmDialog.newRole]?.label}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange} disabled={updateRole.isPending}>
              {updateRole.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmă
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset password dialog */}
      <ResetPasswordDialog
        open={resetPasswordDialog.open}
        onOpenChange={(open) => setResetPasswordDialog({ ...resetPasswordDialog, open })}
        userName={resetPasswordDialog.userName}
        onConfirm={confirmResetPassword}
        isPending={resetPassword.isPending}
      />

      {/* Delete user dialog */}
      <DeleteUserDialog
        open={deleteUserDialog.open}
        onOpenChange={(open) => setDeleteUserDialog({ ...deleteUserDialog, open })}
        userName={deleteUserDialog.userName}
        onConfirm={confirmDeleteUser}
        isPending={deleteUser.isPending}
      />
    </div>
  );
}
