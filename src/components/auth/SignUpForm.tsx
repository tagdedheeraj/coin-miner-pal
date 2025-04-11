
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FormError from './FormError';
import { signUpSchema, SignUpFormValues } from './schemas/authValidation';

interface SignUpFormProps {
  onSignUp: (name: string, email: string, password: string) => Promise<void>;
  isSubmitting: boolean;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSignUp, isSubmitting }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    setErrorMessage(null);
    
    try {
      console.log('Starting signup process with:', { name: values.name, email: values.email });
      await onSignUp(values.name, values.email, values.password);
    } catch (error) {
      console.error("Auth error:", error);
      
      // Handle network errors separately for better user experience
      if (error instanceof Error) {
        if (error.message.includes('auth/network-request-failed')) {
          setErrorMessage("Network error. Please check your internet connection and try again.");
        } else if (error.message.includes('auth/email-already-in-use')) {
          setErrorMessage("This email is already registered. Please sign in instead.");
        } else if (error.message.includes('auth/user-not-found') || 
                  error.message.includes('auth/wrong-password') || 
                  error.message.includes('auth/invalid-credential')) {
          setErrorMessage("Invalid email or password. Please try again.");
        } else {
          setErrorMessage(error.message);
        }
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your name" 
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
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </span>
            ) : (
              'Sign Up'
            )}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default SignUpForm;
