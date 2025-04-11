
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import FormError from './FormError';

const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  onResetPassword: (email: string) => Promise<boolean>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onResetPassword, onCancel, isSubmitting }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setErrorMessage(null);
    
    try {
      const result = await onResetPassword(values.email);
      if (result) {
        setSuccess(true);
        toast.success("Password reset email sent. Please check your inbox.");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Failed to send reset password email. Please try again later.');
      }
    }
  };

  return (
    <>
      <div className="mb-4">
        <Button 
          onClick={onCancel} 
          variant="ghost"
          className="p-0 h-auto hover:bg-transparent"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Back to sign in</span>
        </Button>
      </div>
      
      <FormError message={errorMessage} />
      
      {success ? (
        <div className="text-center py-4">
          <h3 className="text-lg font-medium mb-2">Check your email</h3>
          <p className="text-gray-500 mb-4">
            We've sent a password reset link to your email address.
          </p>
          <Button onClick={onCancel} variant="outline" className="mt-2">
            Return to sign in
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
                    <Input 
                      placeholder="Enter your email address" 
                      type="email"
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
                  Sending...
                </span>
              ) : (
                'Reset password'
              )}
            </Button>
          </form>
        </Form>
      )}
    </>
  );
};

export default ResetPasswordForm;
