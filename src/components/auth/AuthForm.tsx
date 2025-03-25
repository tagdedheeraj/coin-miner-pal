
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface AuthFormProps {
  type: 'sign-in' | 'sign-up';
  onSuccess: () => void;
}

// Define the validation schema
const createAuthSchema = (isSignUp: boolean) => {
  const baseSchema = {
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  };

  return isSignUp
    ? z.object({
        ...baseSchema,
        name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
      })
    : z.object(baseSchema);
};

const AuthForm: React.FC<AuthFormProps> = ({ type, onSuccess }) => {
  const { signIn, signUp, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isSignUp = type === 'sign-up';
  
  // Create form with validation
  const authSchema = createAuthSchema(isSignUp);
  type AuthFormValues = z.infer<typeof authSchema>;
  
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: AuthFormValues) => {
    try {
      if (isSignUp) {
        await signUp(values.name, values.email, values.password);
      } else {
        await signIn(values.email, values.password);
      }
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Authentication failed',
        variant: "destructive",
      });
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {isSignUp && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your name" 
                        disabled={isLoading}
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
                      disabled={isLoading}
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
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : (type === 'sign-in' ? 'Sign In' : 'Sign Up')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
