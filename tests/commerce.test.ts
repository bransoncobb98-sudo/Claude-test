import { describe, expect, it } from 'vitest';
import { computeDiscountedAmountCents } from '@/lib/commerce';

describe('computeDiscountedAmountCents', () => {
  it('returns the original price with no coupon', () => {
    expect(computeDiscountedAmountCents(14900, null)).toBe(14900);
  });

  it('applies a percent discount', () => {
    expect(computeDiscountedAmountCents(10000, { discountType: 'PERCENT', amount: 25 })).toBe(7500);
  });

  it('applies a fixed discount', () => {
    expect(computeDiscountedAmountCents(10000, { discountType: 'FIXED', amount: 3000 })).toBe(7000);
  });

  it('never goes below zero', () => {
    expect(computeDiscountedAmountCents(1000, { discountType: 'FIXED', amount: 5000 })).toBe(0);
    expect(computeDiscountedAmountCents(1000, { discountType: 'PERCENT', amount: 150 })).toBe(0);
  });
});
