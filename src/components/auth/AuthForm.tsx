
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Lock } from 'lucide-react';

interface AuthFormProps {
  type: 'sign-in' | 'sign-up';
  onSuccess?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ type, onSuccess }) => {
  const { signIn, signUp, isLoading } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  
  const validate = () => {
    const newErrors: typeof errors = {};
    
    if (type === 'sign-up' && !name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (type === 'sign-up' && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      if (type === 'sign-in') {
        await signIn(email, password);
      } else {
        await signUp(name, email, password);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md animate-fade-in">
      {type === 'sign-up' && (
        <div className="space-y-2">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <User size={16} />
            </div>
            <Input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`pl-10 h-12 rounded-xl ${errors.name ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.name && <p className="text-xs text-red-500 pl-2">{errors.name}</p>}
        </div>
      )}
      
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Mail size={16} />
          </div>
          <Input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`pl-10 h-12 rounded-xl ${errors.email ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.email && <p className="text-xs text-red-500 pl-2">{errors.email}</p>}
      </div>
      
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Lock size={16} />
          </div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`pl-10 h-12 rounded-xl ${errors.password ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.password && <p className="text-xs text-red-500 pl-2">{errors.password}</p>}
      </div>
      
      {type === 'sign-up' && (
        <div className="space-y-2">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={16} />
            </div>
            <Input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`pl-10 h-12 rounded-xl ${errors.confirmPassword ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-500 pl-2">{errors.confirmPassword}</p>}
        </div>
      )}
      
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-brand-blue hover:bg-brand-blue/90 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {isLoading ? (
          <span className="flex items-center">
            <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            {type === 'sign-in' ? 'Signing in...' : 'Creating account...'}
          </span>
        ) : (
          <span>{type === 'sign-in' ? 'Sign In' : 'Create Account'}</span>
        )}
      </Button>
    </form>
  );
};

export default AuthForm;
