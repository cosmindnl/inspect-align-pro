import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateInvitation } from '@/hooks/useInvitations';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

const formSchema = z.object({
  email: z.string().email('Email invalid'),
  role: z.enum(['admin', 'engineer', 'viewer'] as const),
});

type FormValues = z.infer<typeof formSchema>;

const roleLabels: Record<AppRole, string> = {
  admin: 'Administrator',
  engineer: 'Inginer',
  viewer: 'Vizualizator',
};

const roleDescriptions: Record<AppRole, string> = {
  admin: 'Acces complet - poate gestiona utilizatori, setări și toate datele',
  engineer: 'Poate crea și gestiona rapoarte, clienți și măsurători',
  viewer: 'Poate vizualiza rapoartele și datele companiei',
};

export function InviteUserDialog() {
  const [open, setOpen] = useState(false);
  const createInvitation = useCreateInvitation();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      role: 'engineer',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createInvitation.mutateAsync({
        email: values.email,
        role: values.role,
      });
      toast.success('Invitație trimisă!', {
        description: `Un email a fost trimis la ${values.email}`,
      });
      form.reset();
      setOpen(false);
    } catch (error: any) {
      toast.error('Eroare la trimitere', {
        description: error.message || 'Nu s-a putut trimite invitația',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Invită utilizator
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invită un utilizator nou</DialogTitle>
          <DialogDescription>
            Trimite o invitație prin email pentru a adăuga un nou membru în echipă.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="email@exemplu.ro"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează rolul" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(Object.keys(roleLabels) as AppRole[]).map((role) => (
                        <SelectItem key={role} value={role}>
                          <div className="flex flex-col">
                            <span>{roleLabels[role]}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {roleDescriptions[field.value]}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Anulează
              </Button>
              <Button type="submit" disabled={createInvitation.isPending}>
                {createInvitation.isPending ? 'Se trimite...' : 'Trimite invitația'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
