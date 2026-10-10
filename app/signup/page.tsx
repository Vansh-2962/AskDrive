'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Logo } from '@/components/app/logo';
import { useTheme } from 'next-themes';
import { Sun, Moon, Eye, EyeOff } from 'lucide-react';
import { delay } from '@/lib/utils-format';

const signupSchema = z
  .object({
    name: z.string().min(2, 'Enter your name'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignupValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async () => {
    setSubmitting(true);
    setError('');
    await delay(800);
    setSubmitting(false);
    router.push('/files');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex items-center justify-between px-6 py-5">
        <Logo />
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-foreground-secondary transition-all hover:bg-surface active:translate-y-px"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 pb-20">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-foreground-secondary">
              Upload files and ask AI questions about them
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-status-failed/30 bg-status-failed/5 px-3 py-2 text-sm text-status-failed">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Full name</label>
              <input
                {...register('name')}
                placeholder="Alex Morgan"
                className="flex h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-all placeholder:text-foreground-tertiary focus:border-accent focus:ring-2 focus:ring-accent/20 active:translate-y-px"
              />
              {errors.name && (
                <p className="text-xs text-status-failed">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="flex h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-all placeholder:text-foreground-tertiary focus:border-accent focus:ring-2 focus:ring-accent/20 active:translate-y-px"
              />
              {errors.email && (
                <p className="text-xs text-status-failed">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  className="flex h-9 w-full rounded-lg border border-border bg-background px-3 pr-10 text-sm outline-none transition-all placeholder:text-foreground-tertiary focus:border-accent focus:ring-2 focus:ring-accent/20 active:translate-y-px"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground-tertiary transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-status-failed">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Confirm password</label>
              <input
                {...register('confirmPassword')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                className="flex h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-all placeholder:text-foreground-tertiary focus:border-accent focus:ring-2 focus:ring-accent/20 active:translate-y-px"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-status-failed">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1),inset_0_-1px_0_rgba(0,0,0,0.15)] transition-all hover:bg-accent-hover active:translate-y-px active:shadow-none disabled:opacity-50"
            >
              {submitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-foreground-secondary">
            Already have an account?{' '}
            <a
              href="/login"
              className="font-medium text-accent transition-colors hover:text-accent-hover"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
