import { format, isPast } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Mail, MoreHorizontal, RefreshCw, X, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useInvitations, useCancelInvitation, useResendInvitation, Invitation } from '@/hooks/useInvitations';
import { InviteUserDialog } from './InviteUserDialog';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

const roleLabels: Record<AppRole, string> = {
  admin: 'Administrator',
  engineer: 'Inginer',
  viewer: 'Vizualizator',
};

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock }> = {
  pending: { label: 'În așteptare', variant: 'default', icon: Clock },
  accepted: { label: 'Acceptată', variant: 'secondary', icon: CheckCircle },
  expired: { label: 'Expirată', variant: 'outline', icon: XCircle },
  cancelled: { label: 'Anulată', variant: 'destructive', icon: XCircle },
};

export function InvitationsManager() {
  const { data: invitations, isLoading } = useInvitations();
  const cancelInvitation = useCancelInvitation();
  const resendInvitation = useResendInvitation();

  const handleCancel = async (id: string) => {
    try {
      await cancelInvitation.mutateAsync(id);
      toast.success('Invitația a fost anulată');
    } catch (error: any) {
      toast.error('Eroare', { description: error.message });
    }
  };

  const handleResend = async (invitation: Invitation) => {
    try {
      await resendInvitation.mutateAsync(invitation);
      toast.success('Email-ul a fost retrimis');
    } catch (error: any) {
      toast.error('Eroare', { description: error.message });
    }
  };

  const getEffectiveStatus = (invitation: Invitation) => {
    if (invitation.status === 'pending' && isPast(new Date(invitation.expires_at))) {
      return 'expired';
    }
    return invitation.status;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Invitații</h3>
          <p className="text-sm text-muted-foreground">
            Gestionează invitațiile trimise către noi utilizatori
          </p>
        </div>
        <InviteUserDialog />
      </div>

      {invitations && invitations.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Trimisă</TableHead>
                <TableHead>Expiră</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invitation) => {
                const effectiveStatus = getEffectiveStatus(invitation);
                const config = statusConfig[effectiveStatus] || statusConfig.pending;
                const StatusIcon = config.icon;
                const isPending = effectiveStatus === 'pending';

                return (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {invitation.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {roleLabels[invitation.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {invitation.created_at
                        ? format(new Date(invitation.created_at), 'dd MMM yyyy', { locale: ro })
                        : '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(invitation.expires_at), 'dd MMM yyyy', { locale: ro })}
                    </TableCell>
                    <TableCell>
                      {isPending && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleResend(invitation)}
                              disabled={resendInvitation.isPending}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Retrimite
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCancel(invitation.id)}
                              disabled={cancelInvitation.isPending}
                              className="text-destructive"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Anulează
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nicio invitație</h3>
          <p className="text-muted-foreground mb-4">
            Nu ai trimis încă nicio invitație. Adaugă membri noi în echipă.
          </p>
          <InviteUserDialog />
        </div>
      )}
    </div>
  );
}
