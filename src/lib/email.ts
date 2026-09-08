/**
 * Transactional email interface. No real provider is wired up in this
 * build (see docs/development-roadmap.md) — sendEmail() logs to the
 * console in every environment until EMAIL_PROVIDER_API_KEY is set and a
 * real provider (Resend/Postmark/SES/etc.) is connected here. Every place
 * in the app that should trigger an email calls sendEmail() with one of
 * the templates below, so wiring a provider in is a one-file change.
 */

export type EmailTemplate =
  | { type: 'WELCOME'; firstName: string }
  | { type: 'PURCHASE_CONFIRMATION'; firstName: string; productName: string; amountCents: number; expiresAt: Date }
  | { type: 'DIAGNOSTIC_REMINDER'; firstName: string }
  | { type: 'STUDY_REMINDER'; firstName: string; streakDays: number }
  | { type: 'WEEKLY_PROGRESS_REPORT'; firstName: string; readinessScore: number }
  | { type: 'ACCESS_EXPIRATION_WARNING'; firstName: string; daysRemaining: 30 | 7 | 1 }
  | { type: 'ACCESS_EXPIRED'; firstName: string }
  | { type: 'PASSWORD_RESET'; resetUrl: string };

function renderSubject(template: EmailTemplate): string {
  switch (template.type) {
    case 'WELCOME':
      return 'Welcome to TX Arts Pathway';
    case 'PURCHASE_CONFIRMATION':
      return 'Your TX Arts Pathway purchase is confirmed';
    case 'DIAGNOSTIC_REMINDER':
      return 'Take your TX Arts Pathway diagnostic';
    case 'STUDY_REMINDER':
      return "Keep your study streak going";
    case 'WEEKLY_PROGRESS_REPORT':
      return 'Your weekly TX Arts Pathway progress report';
    case 'ACCESS_EXPIRATION_WARNING':
      return `Your access expires in ${template.daysRemaining} day${template.daysRemaining === 1 ? '' : 's'}`;
    case 'ACCESS_EXPIRED':
      return 'Your TX Arts Pathway access has expired';
    case 'PASSWORD_RESET':
      return 'Reset your TX Arts Pathway password';
  }
}

export async function sendEmail(to: string, template: EmailTemplate): Promise<void> {
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY;

  if (!apiKey) {
    // eslint-disable-next-line no-console
    console.log(`[email:dev] to=${to} subject="${renderSubject(template)}" template=`, template);
    return;
  }

  // A real provider integration (Resend/Postmark/SES) goes here, keyed off
  // `apiKey`. Left unimplemented deliberately — see docs/development-roadmap.md.
  throw new Error('EMAIL_PROVIDER_API_KEY is set but no email provider is wired up in lib/email.ts yet.');
}
