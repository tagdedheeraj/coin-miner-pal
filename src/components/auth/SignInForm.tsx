
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FormError from './FormError';
import { signInSchema, SignInFormValues } from './schemas/authValidation';

interface SignInFormProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  isSubmitting: boolean;
  onForgotPassword: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onSignIn, isSubmitting, onForgotPassword }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: SignInFormValues) => {
    setErrorMessage(null);
    
    try {
      console.log('Attempting to sign in with:', { email: values.email });
      await onSignIn(values.email, values.password);
    } catch (error) {
      console.error("Auth error:", error);
      
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Authentication failed. Please try again later.');
      }
      
      toast({
        title: "Error",
        description: errorMessage || 'Authentication failed',
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <FormError message={errorMessage} />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your email" 
                    type="email"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your password"
                    type="password"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button 
              type="button" 
              variant="link" 
              className="px-0 h-auto"
              onClick={onForgotPassword}
            >
              Forgot password?
            </Button>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </span>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default SignInForm;
