'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FieldError, Input, Label } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { BRAND_NAME } from '@/lib/constants';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    setErrors({});

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setFormError(data.error ?? 'Something went wrong. Please try again.');
      setErrors(data.fieldErrors ?? {});
      setLoading(false);
      return;
    }

    const signInRes = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (signInRes?.error) {
      setFormError('Account created, but sign-in failed. Please sign in manually.');
      router.push('/sign-in');
      return;
    }

    router.push('/onboarding');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-navy-50/40 px-4 py-12">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="p-8">
            <h1 className="font-serif text-2xl font-semibold text-brand-navy-900">
              Create your {BRAND_NAME} account
            </h1>
            <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    required
                    value={form.firstName}
                    onChange={(e) => update('firstName', e.target.value)}
                  />
                  <FieldError>{errors.firstName?.[0]}</FieldError>
                </div>
                <div>
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    required
                    value={form.lastName}
                    onChange={(e) => update('lastName', e.target.value)}
                  />
                  <FieldError>{errors.lastName?.[0]}</FieldError>
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                />
                <FieldError>{errors.email?.[0]}</FieldError>
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                />
                <FieldError>{errors.password?.[0]}</FieldError>
              </div>
              <FieldError>{formError}</FieldError>
              <Button type="submit" disabled={loading} className="w-full justify-center">
                {loading ? 'Creating account…' : 'Create Account'}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link href="/sign-in" className="font-medium text-brand-navy-800 underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
