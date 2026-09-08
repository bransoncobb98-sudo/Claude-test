import { describe, expect, it } from 'vitest';
import {
  summarizeDomainPerformance,
  rankDomainPriorities,
  getNextActivity,
  type SkillMasteryProfile,
} from '@/lib/recommendation-engine';

function profile(overrides: Partial<SkillMasteryProfile>): SkillMasteryProfile {
  return {
    skillId: 'skill-1',
    skillName: 'Skill',
    skillSlug: 'skill',
    objectiveId: 'obj-1',
    objectiveName: 'Objective',
    domainId: 'domain-1',
    domainName: 'Domain',
    masteryScore: 50,
    questionsAttempted: 5,
    questionsCorrect: 2,
    trend: 'STABLE',
    priority: 'MEDIUM',
    recommendedAction: 'TARGETED_PRACTICE',
    hasLesson: true,
    lessonId: 'lesson-1',
    mistakeCount: 0,
    ...overrides,
  };
}

describe('summarizeDomainPerformance', () => {
  it('averages mastery per domain and sorts weakest first', () => {
    const profiles = [
      profile({ skillId: 's1', domainId: 'd1', domainName: 'Stagecraft', masteryScore: 40 }),
      profile({ skillId: 's2', domainId: 'd1', domainName: 'Stagecraft', masteryScore: 60 }),
      profile({ skillId: 's3', domainId: 'd2', domainName: 'History', masteryScore: 90 }),
    ];
    const result = summarizeDomainPerformance(profiles);
    expect(result).toEqual([
      { domainId: 'd1', domainName: 'Stagecraft', averageMastery: 50, skillCount: 2, attemptedSkillCount: 2 },
      { domainId: 'd2', domainName: 'History', averageMastery: 90, skillCount: 1, attemptedSkillCount: 1 },
    ]);
  });

  it('does not count a skill with zero attempts as "attempted"', () => {
    const profiles = [profile({ questionsAttempted: 0, masteryScore: 0 })];
    const result = summarizeDomainPerformance(profiles);
    expect(result[0].attemptedSkillCount).toBe(0);
  });
});

describe('rankDomainPriorities', () => {
  it('ranks domains ascending by mastery, weakest is PRIORITY 1', () => {
    const domains = [
      { domainId: 'd1', domainName: 'Strong', averageMastery: 90, skillCount: 1, attemptedSkillCount: 1 },
      { domainId: 'd2', domainName: 'Weak', averageMastery: 30, skillCount: 1, attemptedSkillCount: 1 },
    ];
    const ranked = rankDomainPriorities(domains);
    expect(ranked[0]).toMatchObject({ rank: 1, domainName: 'Weak' });
    expect(ranked[1]).toMatchObject({ rank: 2, domainName: 'Strong' });
  });
});

describe('getNextActivity', () => {
  it('prioritizes HIGH priority skills over MEDIUM/LOW', () => {
    const profiles = [
      profile({ skillId: 'low', priority: 'LOW', masteryScore: 95, recommendedAction: 'RETEST' }),
      profile({ skillId: 'high', priority: 'HIGH', masteryScore: 20, recommendedAction: 'TARGETED_PRACTICE' }),
      profile({ skillId: 'medium', priority: 'MEDIUM', masteryScore: 65, recommendedAction: 'MINI_QUIZ' }),
    ];
    const next = getNextActivity(profiles);
    expect(next?.skillId).toBe('high');
    expect(next?.action).toBe('TARGETED_PRACTICE');
  });

  it('breaks ties within the same priority by lowest mastery score', () => {
    const profiles = [
      profile({ skillId: 'a', priority: 'HIGH', masteryScore: 40 }),
      profile({ skillId: 'b', priority: 'HIGH', masteryScore: 10 }),
    ];
    const next = getNextActivity(profiles);
    expect(next?.skillId).toBe('b');
  });

  it('falls back to a RETEST-only profile when nothing else is available', () => {
    const profiles = [profile({ skillId: 'mastered', priority: 'LOW', masteryScore: 98, recommendedAction: 'RETEST' })];
    const next = getNextActivity(profiles);
    expect(next?.skillId).toBe('mastered');
    expect(next?.action).toBe('RETEST');
  });

  it('returns null when there are no skills at all', () => {
    expect(getNextActivity([])).toBeNull();
  });
});
