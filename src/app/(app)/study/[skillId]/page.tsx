import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { requireActiveAccess } from '@/lib/access';
import { startAttempt } from '@/lib/response-engine';
import { StudySessionClient } from './StudySessionClient';

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function toRunnerQuestion(q: {
  id: string;
  prompt: string;
  type: string;
  difficulty: number;
  imageUrl: string | null;
  options: { id: string; label: string; text: string }[];
}) {
  return {
    id: q.id,
    prompt: q.prompt,
    type: q.type,
    difficulty: q.difficulty,
    imageUrl: q.imageUrl,
    options: q.options.map((o) => ({ id: o.id, label: o.label, text: o.text })),
  };
}

export default async function StudySessionPage({ params }: { params: { skillId: string } }) {
  const user = await requireUser();
  const skill = await prisma.skill.findUnique({
    where: { id: params.skillId },
    include: {
      objective: { include: { domain: true } },
      lessons: { where: { published: true }, orderBy: { order: 'asc' } },
      questions: { where: { published: true }, include: { options: { orderBy: { order: 'asc' } } } },
    },
  });
  if (!skill || !skill.published) notFound();

  await requireActiveAccess(user, skill.objective.domain.examId);

  const masteryBefore = await prisma.masteryRecord.findUnique({
    where: { userId_skillId: { userId: user.id, skillId: skill.id } },
  });

  const shuffled = shuffle(skill.questions);
  const checkQuestions = shuffled.slice(0, Math.min(2, shuffled.length));
  const practiceQuestions = shuffled.slice(2, Math.min(shuffled.length, 2 + 8));
  const masteryQuestions = shuffle(shuffled).slice(0, Math.min(3, shuffled.length));

  const [checkAttempt, practiceAttempt, masteryAttempt] = await Promise.all([
    startAttempt({ userId: user.id, type: 'STUDY_CHECK', skillId: skill.id }),
    startAttempt({ userId: user.id, type: 'STUDY_PRACTICE', skillId: skill.id }),
    startAttempt({ userId: user.id, type: 'MASTERY_CHECK', skillId: skill.id }),
  ]);

  const lesson = skill.lessons[0] ?? null;

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-xs font-medium uppercase tracking-wide text-brand-navy-500">
        {skill.objective.domain.name} &rsaquo; {skill.objective.name}
      </p>
      <h1 className="mt-1 font-serif text-2xl font-semibold text-brand-navy-900">{skill.name}</h1>

      <div className="mt-8">
        <StudySessionClient
          skillId={skill.id}
          skillName={skill.name}
          lesson={lesson ? { title: lesson.title, content: lesson.content, keyConcepts: lesson.keyConcepts, example: lesson.example } : null}
          masteryBefore={Math.round(masteryBefore?.masteryScore ?? 0)}
          checkAttemptId={checkAttempt.id}
          practiceAttemptId={practiceAttempt.id}
          masteryAttemptId={masteryAttempt.id}
          checkQuestions={checkQuestions.map(toRunnerQuestion)}
          practiceQuestions={practiceQuestions.map(toRunnerQuestion)}
          masteryQuestions={masteryQuestions.map(toRunnerQuestion)}
        />
      </div>
    </div>
  );
}
