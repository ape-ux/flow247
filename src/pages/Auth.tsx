import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { z } from 'zod';
import logo from '@/assets/logo-ape-global.jpg';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isSignup, setIsSignup] = useState(searchParams.get('mode') === 'signup');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { login, signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app/chat');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    try {
      if (isSignup) {
        signupSchema.parse({ email, password, name });
      } else {
        loginSchema.parse({ email, password });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (isSignup) {
        await signup(email, password, name);
        toast({
          title: 'Account created!',
          description: 'Welcome to APE Global.',
        });
      } else {
        await login(email, password);
        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in.',
        });
      }
      navigate('/app/chat');
    } catch (error: any) {
      toast({
        title: 'Authentication failed',
        description: error.message || 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(175_84%_50%/0.1)_0%,transparent_50%)]" />
      
      <div className="container relative z-10 mx-auto flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="mb-8 flex items-center justify-center">
            <img 
              src={logo} 
              alt="APE Global" 
              className="h-16 w-auto"
            />
          </Link>

          {/* Auth Card */}
          <div className="glass-card p-8">
            <div className="mb-8 text-center">
              <h1 className="mb-2 font-display text-2xl font-bold">
                {isSignup ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isSignup
                  ? 'Start your journey with APE Global'
                  : 'Sign in to continue to your dashboard'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {isSignup ? 'Create Account' : 'Sign In'}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                {isSignup ? 'Already have an account?' : "Don't have an account?"}
              </span>{' '}
              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="font-medium text-primary hover:underline"
              >
                {isSignup ? 'Sign in' : 'Sign up'}
              </button>
            </div>
          </div>

          {/* Demo Notice */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Configure your Xano API base URL in environment variables to enable authentication.
          </p>
        </div>
      </div>
    </div>
  );
}
