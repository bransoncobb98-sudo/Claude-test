'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';

interface Product {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  durationDays: number;
}

export function PurchaseForm({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState(products[0]?.id ?? '');
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function purchase() {
    setLoading(true);
    setError(null);
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: selected, couponCode: couponCode || undefined }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? 'Something went wrong starting checkout.');
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {products.map((p) => (
          <label
            key={p.id}
            className={`flex cursor-pointer flex-col rounded-lg border p-4 text-sm ${
              selected === p.id ? 'border-brand-navy-500 bg-brand-navy-50' : 'border-brand-navy-100'
            }`}
          >
            <input
              type="radio"
              name="product"
              className="sr-only"
              checked={selected === p.id}
              onChange={() => setSelected(p.id)}
            />
            <span className="font-medium text-brand-navy-900">{p.name}</span>
            <span className="text-lg font-semibold text-brand-navy-900">${(p.priceCents / 100).toFixed(2)}</span>
            <span className="text-xs text-slate-500">{p.durationDays} days of access</span>
          </label>
        ))}
      </div>

      <div>
        <Label htmlFor="couponCode">Promo / discount code (optional)</Label>
        <Input id="couponCode" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="e.g., DEMO25" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button onClick={purchase} disabled={!selected || loading} className="w-full justify-center">
        {loading ? 'Starting checkout…' : 'Purchase Access'}
      </Button>
      <p className="text-xs text-slate-400">
        Payment is processed securely by Stripe. We never store your card details.
      </p>
    </div>
  );
}
