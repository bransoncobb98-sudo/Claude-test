'use client';

import { FormEvent, Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FieldError, Input, Label } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { BRAND_NAME } from '@/lib/constants';

function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') ?? '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError('Incorrect email or password.');
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="p-8">
        <h1 className="font-serif text-2xl font-semibold text-brand-navy-900">Sign in to {BRAND_NAME}</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <FieldError>{error}</FieldError>
          <Button type="submit" disabled={loading} className="w-full justify-center">
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Don&rsquo;t have an account?{' '}
          <Link href="/register" className="font-medium text-brand-navy-800 underline">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-navy-50/40 px-4 py-12">
      <div className="w-full max-w-md">
        <Suspense>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}
