import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toggleSuspendUser, grantAdminAccess } from './actions';

export default async function AdminUsersPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim();

  const users = await prisma.user.findMany({
    where: q
      ? {
          role: 'STUDENT',
          OR: [
            { email: { contains: q, mode: 'insensitive' } },
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
          ],
        }
      : { role: 'STUDENT' },
    include: { accessGrants: { orderBy: { expiresAt: 'desc' }, take: 1 } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const exams = await prisma.exam.findMany({ orderBy: { name: 'asc' } });

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-semibold text-brand-navy-900">Users</h1>

      <form method="get" className="max-w-sm">
        <Input name="q" defaultValue={q} placeholder="Search by name or email" />
      </form>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-brand-navy-100 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Access Expires</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const grant = u.accessGrants[0];
                  const active = grant && !grant.revoked && grant.expiresAt > new Date();
                  return (
                    <tr key={u.id} className="border-b border-brand-navy-50">
                      <td className="px-4 py-3">{u.firstName} {u.lastName}</td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">
                        {u.suspended ? (
                          <Badge variant="danger">Suspended</Badge>
                        ) : active ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="neutral">No Access</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">{grant ? grant.expiresAt.toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <form action={toggleSuspendUser.bind(null, u.id)}>
                            <Button type="submit" size="sm" variant="outline">
                              {u.suspended ? 'Unsuspend' : 'Suspend'}
                            </Button>
                          </form>
                          <form action={grantAdminAccess} className="flex items-center gap-1">
                            <input type="hidden" name="userId" value={u.id} />
                            <Select name="examId" className="w-32 py-1 text-xs" defaultValue="">
                              <option value="">All Exams</option>
                              {exams.map((e) => (
                                <option key={e.id} value={e.id}>{e.name}</option>
                              ))}
                            </Select>
                            <Select name="durationDays" className="w-24 py-1 text-xs" defaultValue="365">
                              <option value="30">30d</option>
                              <option value="90">90d</option>
                              <option value="180">180d</option>
                              <option value="365">365d</option>
                            </Select>
                            <Button type="submit" size="sm">
                              Grant
                            </Button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
