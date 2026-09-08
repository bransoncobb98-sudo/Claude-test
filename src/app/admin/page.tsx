import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/Card';

export default async function AdminAnalyticsPage() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUserIds,
    totalProfiles,
    completedDiagnostics,
    masteryAgg,
    difficultSkills,
    mostMissed,
    practiceExamAgg,
    responsesLast7Days,
    purchaseAgg,
    expiringGrants,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.response.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { attempt: { select: { userId: true } } },
      distinct: ['attemptId'],
    }),
    prisma.profile.count(),
    prisma.diagnosticAssessment.count({ where: { status: 'COMPLETED' } }),
    prisma.masteryRecord.aggregate({ _avg: { masteryScore: true } }),
    prisma.masteryRecord.groupBy({
      by: ['skillId'],
      _avg: { masteryScore: true },
      _count: { skillId: true },
      orderBy: { _avg: { masteryScore: 'asc' } },
      take: 5,
    }),
    prisma.mistake.groupBy({
      by: ['questionId'],
      _sum: { timesMissed: true },
      orderBy: { _sum: { timesMissed: 'desc' } },
      take: 5,
    }),
    prisma.practiceExamAttempt.aggregate({ where: { status: 'COMPLETED' }, _avg: { score: true }, _count: true }),
    prisma.response.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.purchase.aggregate({ where: { status: 'PAID' }, _sum: { amountCents: true }, _count: true }),
    prisma.accessGrant.findMany({
      where: { revoked: false, expiresAt: { gte: now, lte: thirtyDaysFromNow } },
      include: { user: true },
      orderBy: { expiresAt: 'asc' },
      take: 10,
    }),
  ]);

  const activeUsers = new Set(activeUserIds.map((r) => r.attempt.userId)).size;

  const skillNames = await prisma.skill.findMany({
    where: { id: { in: difficultSkills.map((s) => s.skillId) } },
    select: { id: true, name: true },
  });
  const skillNameMap = new Map(skillNames.map((s) => [s.id, s.name]));

  const questionPrompts = await prisma.question.findMany({
    where: { id: { in: mostMissed.map((m) => m.questionId) } },
    select: { id: true, prompt: true },
  });
  const promptMap = new Map(questionPrompts.map((q) => [q.id, q.prompt]));

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-2xl font-semibold text-brand-navy-900">Analytics</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total Students" value={totalUsers} />
        <Stat label="Active (7 days)" value={activeUsers} />
        <Stat
          label="Diagnostic Completion"
          value={totalProfiles ? `${Math.round((completedDiagnostics / totalProfiles) * 100)}%` : '—'}
        />
        <Stat label="Average Mastery" value={`${Math.round(masteryAgg._avg.masteryScore ?? 0)}%`} />
        <Stat label="Practice Exam Avg" value={`${Math.round(practiceExamAgg._avg.score ?? 0)}%`} />
        <Stat label="Practice Exams Taken" value={practiceExamAgg._count} />
        <Stat label="Responses (7 days)" value={responsesLast7Days} />
        <Stat label="Revenue" value={`$${((purchaseAgg._sum.amountCents ?? 0) / 100).toFixed(2)}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <p className="font-medium text-brand-navy-900">Most Difficult Skills</p>
            <ul className="mt-3 space-y-2 text-sm">
              {difficultSkills.map((s) => (
                <li key={s.skillId} className="flex justify-between">
                  <span>{skillNameMap.get(s.skillId) ?? s.skillId}</span>
                  <span className="text-slate-500">{Math.round(s._avg.masteryScore ?? 0)}% avg mastery</span>
                </li>
              ))}
              {difficultSkills.length === 0 && <li className="text-slate-500">No mastery data yet.</li>}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="font-medium text-brand-navy-900">Most-Missed Questions</p>
            <ul className="mt-3 space-y-2 text-sm">
              {mostMissed.map((m) => (
                <li key={m.questionId} className="flex justify-between gap-4">
                  <span className="truncate">{promptMap.get(m.questionId) ?? m.questionId}</span>
                  <span className="shrink-0 text-slate-500">{m._sum.timesMissed}x</span>
                </li>
              ))}
              {mostMissed.length === 0 && <li className="text-slate-500">No missed questions yet.</li>}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="font-medium text-brand-navy-900">Expiring Access (next 30 days)</p>
          <ul className="mt-3 divide-y divide-brand-navy-50 text-sm">
            {expiringGrants.map((g) => (
              <li key={g.id} className="flex justify-between py-2">
                <span>{g.user.firstName} {g.user.lastName} ({g.user.email})</span>
                <span className="text-slate-500">{g.expiresAt.toLocaleDateString()}</span>
              </li>
            ))}
            {expiringGrants.length === 0 && <li className="py-2 text-slate-500">No access grants expiring soon.</li>}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-brand-navy-900">{value}</p>
      </CardContent>
    </Card>
  );
}
