import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Mail, Lock, User, ArrowRight, AlertCircle, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useInvitationByToken, useAcceptInvitation } from '@/hooks/useInvitations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Adresa de email invalidă' }).max(255),
  password: z.string().min(6, { message: 'Parola trebuie să aibă minim 6 caractere' }),
});

const signupSchema = z.object({
  firstName: z.string().trim().min(2, { message: 'Prenumele trebuie să aibă minim 2 caractere' }).max(50),
  lastName: z.string().trim().min(2, { message: 'Numele trebuie să aibă minim 2 caractere' }).max(50),
  email: z.string().trim().email({ message: 'Adresa de email invalidă' }).max(255),
  password: z.string().min(6, { message: 'Parola trebuie să aibă minim 6 caractere' }).max(72),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Parolele nu coincid',
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

const roleLabels: Record<string, string> = {
  admin: 'Administrator',
  engineer: 'Inginer',
  viewer: 'Vizualizator',
};

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get('invitation');
  
  const { user, loading, signIn, signUp } = useAuth();
  const { data: invitation, isLoading: invitationLoading } = useInvitationByToken(invitationToken);
  const acceptInvitation = useAcceptInvitation();
  
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(invitationToken ? 'signup' : 'login');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { firstName: '', lastName: '', email: invitation?.email || '', password: '', confirmPassword: '' },
  });

  // Pre-fill email from invitation
  useEffect(() => {
    if (invitation?.email) {
      signupForm.setValue('email', invitation.email);
    }
  }, [invitation, signupForm]);

  // Handle accepting invitation after signup
  useEffect(() => {
    const acceptInvitationIfNeeded = async () => {
      if (user && invitationToken && invitation && !acceptInvitation.isPending) {
        try {
          await acceptInvitation.mutateAsync({ token: invitationToken, userId: user.id });
          navigate('/', { replace: true });
        } catch (err: any) {
          console.error('Failed to accept invitation:', err);
          // Still navigate - user is logged in
          navigate('/', { replace: true });
        }
      } else if (user && !loading && !invitationToken) {
        navigate('/', { replace: true });
      }
    };
    
    acceptInvitationIfNeeded();
  }, [user, loading, invitationToken, invitation, navigate, acceptInvitation]);

  const handleLogin = async (data: LoginFormData) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Email sau parolă incorectă');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Te rugăm să confirmi adresa de email');
        } else {
          setError(error.message);
        }
      }
    } catch (err) {
      setError('A apărut o eroare. Te rugăm să încerci din nou.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const { error } = await signUp(data.email, data.password, data.firstName, data.lastName);
      
      if (error) {
        if (error.message.includes('User already registered')) {
          setError('Acest email este deja înregistrat. Te rugăm să te autentifici.');
        } else if (error.message.includes('Password should be')) {
          setError('Parola trebuie să aibă minim 6 caractere');
        } else {
          setError(error.message);
        }
      } else {
        setSignupSuccess(true);
        signupForm.reset();
      }
    } catch (err) {
      setError('A apărut o eroare. Te rugăm să încerci din nou.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || invitationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show invalid invitation message
  if (invitationToken && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Invitație invalidă</CardTitle>
            <CardDescription>
              Această invitație nu există, a expirat sau a fost deja folosită.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/auth')}>
              Mergi la autentificare
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary items-center justify-center p-12">
        <div className="max-w-md text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
              <Zap className="h-7 w-7 text-accent-foreground" />
            </div>
            <span className="text-2xl font-bold">ElectroVerify</span>
          </div>
          
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Platformă profesională pentru verificări electrice
          </h1>
          
          <p className="text-lg text-white/80 mb-8">
            Gestionează rapoartele de verificare, clienții și măsurătorile într-un singur loc. 
            Conform standardelor IEC 60364 și IEC 61557.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                <ArrowRight className="h-4 w-4" />
              </div>
              <span>Rapoarte de verificare digitale</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                <ArrowRight className="h-4 w-4" />
              </div>
              <span>Generare automată PDF</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                <ArrowRight className="h-4 w-4" />
              </div>
              <span>Conformitate ANRE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardHeader className="text-center pb-2">
            {/* Mobile logo */}
            <div className="flex items-center justify-center gap-2 mb-4 lg:hidden">
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">ElectroVerify</span>
            </div>
            
            <CardTitle className="text-2xl">
              {invitation 
                ? 'Acceptă invitația' 
                : activeTab === 'login' ? 'Bine ai revenit!' : 'Creează cont nou'}
            </CardTitle>
            <CardDescription>
              {invitation 
                ? `Te alături echipei ${(invitation as any).companies?.name || 'companiei'}`
                : activeTab === 'login' 
                  ? 'Autentifică-te pentru a continua'
                  : 'Completează datele pentru înregistrare'
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            {invitation && (
              <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <span>Vei fi adăugat ca <Badge variant="secondary">{roleLabels[invitation.role]}</Badge></span>
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {signupSuccess && (
              <Alert className="mb-4 border-success bg-success/10">
                <AlertCircle className="h-4 w-4 text-success" />
                <AlertDescription className="text-success">
                  Cont creat cu succes! Te poți autentifica acum.
                </AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'login' | 'signup'); setError(null); setSignupSuccess(false); }}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Autentificare</TabsTrigger>
                <TabsTrigger value="signup">Înregistrare</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="nume@companie.ro"
                        className="pl-10"
                        {...loginForm.register('email')}
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Parolă</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        {...loginForm.register('password')}
                      />
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Se autentifică...
                      </div>
                    ) : (
                      'Autentificare'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prenume</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          placeholder="Ion"
                          className="pl-10"
                          {...signupForm.register('firstName')}
                        />
                      </div>
                      {signupForm.formState.errors.firstName && (
                        <p className="text-sm text-destructive">{signupForm.formState.errors.firstName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nume</Label>
                      <Input
                        id="lastName"
                        placeholder="Popescu"
                        {...signupForm.register('lastName')}
                      />
                      {signupForm.formState.errors.lastName && (
                        <p className="text-sm text-destructive">{signupForm.formState.errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="nume@companie.ro"
                        className="pl-10"
                        {...signupForm.register('email')}
                      />
                    </div>
                    {signupForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{signupForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Parolă</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Minim 6 caractere"
                        className="pl-10"
                        {...signupForm.register('password')}
                      />
                    </div>
                    {signupForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{signupForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmă parola</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Repetă parola"
                        className="pl-10"
                        {...signupForm.register('confirmPassword')}
                      />
                    </div>
                    {signupForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">{signupForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Se creează contul...
                      </div>
                    ) : (
                      'Creează cont'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
