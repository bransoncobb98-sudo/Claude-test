import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ButtonLink } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AFFILIATION_DISCLAIMER } from '@/lib/constants';

export const revalidate = 60;

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Take the Diagnostic',
    body: 'Answer questions spanning every domain of your exam so we can see exactly where you stand.',
  },
  {
    step: '2',
    title: 'Discover Your Weak Areas',
    body: 'We break your results down by domain, objective, and skill — not just one overall percentage.',
  },
  {
    step: '3',
    title: 'Follow Your Personalized Study Path',
    body: 'A study plan is generated automatically, ordered by what will move the needle most.',
  },
  {
    step: '4',
    title: 'Practice What You Need',
    body: 'Targeted lessons and practice questions focus on your priority skills, not the whole bank.',
  },
  {
    step: '5',
    title: 'Track Your Readiness',
    body: 'Watch your TX Arts Readiness Score climb as mastery improves across every domain.',
  },
];

const FAQS = [
  {
    q: 'Is this a subscription?',
    a: 'No. TX Arts Pathway is a one-time purchase that gives you 365 days of full access — no recurring charges.',
  },
  {
    q: 'Are these real TExES exam questions?',
    a: 'No. Every question is original practice content written for TX Arts Pathway, aligned to the same publicly available competencies TExES assesses. We never copy or reproduce official exam items.',
  },
  {
    q: 'Which exams are supported?',
    a: 'We are building out Art, Music, Theatre, and Dance certification tracks. See Exam Areas below for what is currently available.',
  },
  {
    q: 'Does the readiness score guarantee I will pass?',
    a: 'No. It reflects your performance across practice activities on this platform and is not a guarantee of an official passing score.',
  },
];

export default async function LandingPage() {
  const exams = await prisma.exam.findMany({
    where: { published: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-navy-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="mb-4 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-brand-gold-300">
            FOR TEXAS FINE ARTS EDUCATORS
          </p>
          <h1 className="max-w-3xl font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            Stop Studying Everything. Start Studying What You Need.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-brand-navy-100">
            TX Arts Pathway uses diagnostic testing and personalized study recommendations to
            help Texas fine arts educators prepare smarter for their TExES certification exams.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink href="/register" size="lg" variant="secondary">
              Find My Study Path
            </ButtonLink>
            <ButtonLink href="#how-it-works" size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
              See How It Works
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="font-serif text-3xl font-semibold text-brand-navy-900">How It Works</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="rounded-2xl border border-brand-navy-100 bg-white p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-navy-800 text-sm font-semibold text-white">
                {item.step}
              </div>
              <h3 className="mt-4 font-semibold text-brand-navy-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why TX Arts Pathway */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-serif text-3xl font-semibold text-brand-navy-900">
                Why TX Arts Pathway
              </h2>
              <p className="mt-4 text-slate-600">
                Most exam-prep tools hand you a giant question bank and wish you luck. TX Arts
                Pathway is different: every recommendation you see is generated from your own
                performance data — accuracy, difficulty, recency, and repeated mistakes — across
                every domain, objective, and skill on your exam.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                {[
                  'A mastery score for every skill, not just a single percentage',
                  'Adaptive difficulty that responds to how you are actually performing',
                  'Spaced repetition so concepts resurface right before you would forget them',
                  'A study plan that reorders itself as your strengths and gaps change',
                ].map((line) => (
                  <li key={line} className="flex gap-2">
                    <span aria-hidden className="text-brand-terracotta-500">✓</span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <Card className="bg-brand-navy-50/50 p-2">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-brand-navy-700">YOUR TExES READINESS</p>
                <p className="mt-2 font-serif text-5xl font-semibold text-brand-navy-900">68%</p>
                <p className="mt-1 text-sm text-slate-600">You&rsquo;re making progress.</p>
                <div className="mt-5 space-y-2 text-sm">
                  <p className="font-medium text-brand-navy-900">You have mastered:</p>
                  <p className="text-emerald-700">✓ Theatre History &nbsp; ✓ Dramatic Literature</p>
                  <p className="mt-3 font-medium text-brand-navy-900">Focus next:</p>
                  <p className="text-amber-700">⚠ Stagecraft &nbsp; ⚠ Theatre Education</p>
                </div>
                <div className="mt-6 rounded-xl bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Your Next Step</p>
                  <p className="mt-1 font-medium text-brand-navy-900">Complete: Lighting Design Fundamentals</p>
                  <ButtonLink href="/register" size="sm" className="mt-3">
                    Start Study Session
                  </ButtonLink>
                </div>
                <p className="mt-4 text-xs text-slate-400">Illustrative preview — your dashboard reflects your own results.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Exam areas */}
      <section id="exams" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="font-serif text-3xl font-semibold text-brand-navy-900">Exam Areas</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Additional certification tracks are added regularly — the platform is built so a new
          exam area never requires a rebuild.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {['Art', 'Music', 'Theatre', 'Dance'].map((label) => {
            const match = exams.find((e) => e.name.toLowerCase().includes(label.toLowerCase()));
            return (
              <Card key={label}>
                <CardContent className="p-6">
                  <CardTitle>{label}</CardTitle>
                  <CardDescription>
                    {match ? match.description ?? 'Diagnostic-driven preparation available now.' : 'Coming soon.'}
                  </CardDescription>
                  <div className="mt-4">
                    {match ? (
                      <Badge variant="success">Available</Badge>
                    ) : (
                      <Badge variant="neutral">Future Exam</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-brand-navy-50/40">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <h2 className="font-serif text-3xl font-semibold text-brand-navy-900">Simple, One-Time Pricing</h2>
          <Card className="mx-auto mt-10 max-w-md text-left">
            <CardContent className="p-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-terracotta-600">365 Days Access</p>
              <p className="mt-2 font-serif text-4xl font-semibold text-brand-navy-900">$149</p>
              <p className="mt-1 text-sm text-slate-500">One payment. One year of access.</p>
              <ul className="mt-6 space-y-2 text-sm text-slate-700">
                {[
                  'Diagnostic Assessment',
                  'Personalized Study Plan',
                  'Practice Questions',
                  'Study Materials',
                  'Practice Exams',
                  'Progress Tracking',
                  'Missed Question Review',
                ].map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-emerald-600">✓</span> {f}
                  </li>
                ))}
              </ul>
              <ButtonLink href="/register" className="mt-8 w-full justify-center">
                Get Started
              </ButtonLink>
            </CardContent>
          </Card>
          <p className="mx-auto mt-4 max-w-md text-xs text-slate-500">
            Pricing shown is illustrative demo pricing. See Admin → Products to configure real pricing, promo codes, and school licenses.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="font-serif text-3xl font-semibold text-brand-navy-900">What Educators Say</h2>
        <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">Placeholder testimonials</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            { name: 'Placeholder — Theatre Educator', quote: 'Knowing exactly which skills to focus on saved me weeks of aimless review.' },
            { name: 'Placeholder — Art Educator', quote: 'The domain breakdown showed me gaps I didn’t know I had.' },
            { name: 'Placeholder — Music Educator', quote: 'I liked seeing my mastery score improve session over session.' },
          ].map((t) => (
            <Card key={t.name}>
              <CardContent className="p-6">
                <p className="text-sm italic text-slate-700">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-4 text-sm font-medium text-brand-navy-900">{t.name}</p>
                <Badge variant="neutral" className="mt-2">Placeholder</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <h2 className="font-serif text-3xl font-semibold text-brand-navy-900">Frequently Asked Questions</h2>
          <div className="mt-8 space-y-6">
            {FAQS.map((f) => (
              <div key={f.q}>
                <p className="font-medium text-brand-navy-900">{f.q}</p>
                <p className="mt-1 text-sm text-slate-600">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <p className="rounded-xl border border-brand-navy-100 bg-brand-navy-50/40 p-5 text-xs leading-relaxed text-slate-600">
          {AFFILIATION_DISCLAIMER}{' '}
          <Link href="/legal/disclaimer" className="underline">Read the full disclaimer.</Link>
        </p>
      </section>
    </div>
  );
}
