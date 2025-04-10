
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
 
const schema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type FormValues = z.infer<typeof schema>;

const ForgotPassword: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, values.email);
      setIsSuccess(true);
      toast({
        title: 'Reset email sent',
        description: 'Please check your email for reset instructions',
      });
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send reset email',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="h-16 flex items-center px-4">
        <button
          onClick={() => navigate('/sign-in')}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-2 text-gradient">Reset Password</h1>
            <p className="text-gray-500">We'll send you an email with instructions</p>
          </div>

          <Card className="w-full">
            <CardHeader className="space-y-1">
              <CardTitle>Forgot your password?</CardTitle>
              <CardDescription>
                Enter your email address and we'll send you a link to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSuccess ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Check className="text-green-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Check your email</h3>
                  <p className="text-gray-500 mb-4">
                    We've sent a password reset link to your email address.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/sign-in')}
                    className="mt-2"
                  >
                    Back to Sign In
                  </Button>
                </div>
              ) : (
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
                              <Input
                                placeholder="Enter your email"
                                type="email"
                                disabled={isSubmitting}
                                {...field}
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Mail size={18} />
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          Loading...
                        </span>
                      ) : (
                        'Send Reset Link'
                      )}
                    </Button>

                    <div className="text-center mt-4">
                      <Button
                        variant="link"
                        onClick={() => navigate('/sign-in')}
                        className="text-sm"
                      >
                        Back to sign in
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
