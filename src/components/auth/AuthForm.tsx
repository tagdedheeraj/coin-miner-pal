import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AuthFormProps {
  type: 'sign-in' | 'sign-up';
  onSuccess: () => void;
}

// Define the validation schemas
const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

const signUpSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

// Define types based on the schemas
type SignInFormValues = z.infer<typeof signInSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;

const AuthForm: React.FC<AuthFormProps> = ({ type, onSuccess }) => {
  const { signIn, signUp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isSignUp = type === 'sign-up';
  
  // Create the appropriate form based on type
  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  // Use the appropriate form
  const form = isSignUp ? signUpForm : signInForm;

  const onSubmit = async (values: SignInFormValues | SignUpFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      if (isSignUp) {
        // Safe to cast since we're in sign-up mode
        const signUpValues = values as SignUpFormValues;
        console.log('Starting signup process with:', { name: signUpValues.name, email: signUpValues.email });
        
        await signUp(signUpValues.name, signUpValues.email, signUpValues.password);
        console.log('Signup successful');
        
        // Give a slight delay before redirect for better UX
        setTimeout(() => {
          onSuccess();
        }, 500);
      } else {
        const signInValues = values as SignInFormValues;
        await signIn(signInValues.email, signInValues.password);
        
        // Give a slight delay before redirect for better UX
        setTimeout(() => {
          onSuccess();
        }, 500);
      }
      
    } catch (error) {
      console.error("Auth error:", error);
      
      // Handle network errors separately for better user experience
      if (error instanceof Error) {
        if (error.message.includes('auth/network-request-failed')) {
          setErrorMessage("Network error. Please check your internet connection and try again.");
        } else if (error.message.includes('auth/email-already-in-use')) {
          setErrorMessage("This email is already registered. Please sign in instead.");
        } else if (error.message.includes('auth/user-not-found') || error.message.includes('auth/wrong-password')) {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle>{type === 'sign-in' ? 'Sign In' : 'Sign Up'}</CardTitle>
        <CardDescription>
          {type === 'sign-in' ? 'Enter your credentials to access your account.' : 'Create an account to start mining.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {errorMessage && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-600 text-sm">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {isSignUp && (
              <FormField
                control={signUpForm.control}
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
            )}
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
                type === 'sign-in' ? 'Sign In' : 'Sign Up'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
